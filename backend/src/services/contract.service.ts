import { prisma } from "../lib/prisma";
import { chargeUser, BillingAction } from "./billing.service";
import { awardPoints } from "./gamification.service";
import { createNotification } from "./notification.service";

async function recomputeFreelancerMetrics(freelancerId: string) {
  const completed = await prisma.contract.findMany({
    where: { freelancerId, status: "COMPLETED" },
    select: { price: true, completedAt: true, dueAt: true },
  });

  const completedJobs = completed.length;
  const totalIncome = completed.reduce((sum, c) => sum + Number(c.price), 0);
  const onTimeCount = completed.filter((c) => {
    if (!c.completedAt) return false;
    if (!c.dueAt) return true;
    return c.completedAt <= c.dueAt;
  }).length;
  const onTimeRate = completedJobs === 0 ? 0 : Math.round((onTimeCount / completedJobs) * 100);

  await prisma.freelancerProfile.updateMany({
    where: { userId: freelancerId },
    data: {
      completedJobs,
      totalIncome,
      onTimeRate,
    },
  });
}

export async function createContract(
  clientId: string,
  data: {
    proposalId?: string;
    price?: number;
    dueAt?: string;
  }
) {
  if (!data.proposalId) {
    throw new Error("Proposal id is required");
  }

  const result = await prisma.$transaction(async (tx) => {
    const proposal = await tx.proposal.findUnique({
      where: { id: data.proposalId },
      include: { job: true },
    });

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    if (proposal.job.clientId !== clientId) {
      throw new Error("Forbidden: proposal does not belong to your job");
    }

    const alreadyAccepted = await tx.proposal.findFirst({
      where: { jobId: proposal.jobId, status: "ACCEPTED" },
    });
    if (alreadyAccepted) {
      throw new Error("A proposal has already been accepted for this job");
    }

    const existing = await tx.contract.findFirst({
      where: {
        jobId: proposal.jobId,
        clientId,
        freelancerId: proposal.freelancerId,
        status: { not: "CANCELLED" },
      },
    });
    if (existing) {
      throw new Error("Contract already exists for this proposal");
    }

    await tx.proposal.update({
      where: { id: proposal.id },
      data: { status: "ACCEPTED" },
    });

    const autoRejectedProposals = await tx.proposal.findMany({
      where: {
        jobId: proposal.jobId,
        id: { not: proposal.id },
        status: "PENDING",
      },
      select: {
        id: true,
        freelancerId: true,
      },
    });

    await tx.proposal.updateMany({
      where: {
        jobId: proposal.jobId,
        id: { not: proposal.id },
        status: "PENDING",
      },
      data: { status: "REJECTED" },
    });

    await tx.job.update({
      where: { id: proposal.jobId },
      data: { status: "IN_PROGRESS" },
    });

    const contractPrice = Number(proposal.job.budget);
    const contract = await tx.contract.create({
      data: {
        jobId: proposal.jobId,
        clientId,
        freelancerId: proposal.freelancerId,
        // Contract price is always anchored to job budget.
        price: contractPrice,
        dueAt: data.dueAt ? new Date(data.dueAt) : proposal.job.deadlineAt ?? undefined,
      },
    });

    const jobMilestones = await tx.jobMilestone.findMany({
      where: { jobId: proposal.jobId },
      orderBy: { createdAt: "asc" },
    });
    if (jobMilestones.length > 0) {
      const prepared = jobMilestones.map((milestone) => ({
        contractId: contract.id,
        title: milestone.title,
        amount: Number(milestone.amount),
        dueDate: milestone.dueDate ?? undefined,
        status: "PENDING" as const,
      }));
      const milestoneSum = prepared.reduce((sum, item) => sum + item.amount, 0);
      const delta = Number((contractPrice - milestoneSum).toFixed(2));
      if (Math.abs(delta) >= 0.01 && prepared.length > 0) {
        prepared[prepared.length - 1].amount = Number(
          (prepared[prepared.length - 1].amount + delta).toFixed(2)
        );
      }
      await tx.milestone.createMany({
        data: prepared,
      });
    } else {
      // Backward-compatible fallback for older jobs without milestone template.
      await tx.milestone.create({
        data: {
          contractId: contract.id,
          title: "Giai đoạn 1",
          amount: contractPrice,
          dueDate: proposal.job.deadlineAt ?? undefined,
          status: "PENDING",
        },
      });
    }

    await chargeUser(tx, clientId, BillingAction.ACCEPT_PROPOSAL, { 
      referenceId: contract.id, 
      amountOverride: contractPrice * 0.05 
    });

    return {
      contract,
      jobId: proposal.jobId,
      autoRejectedProposals,
    };
  });

  await Promise.all(
    result.autoRejectedProposals.map((item) =>
      createNotification(item.freelancerId, "notification:proposal_rejected", {
        title: "Đề xuất của bạn đã bị từ chối",
        body: "Nhà tuyển dụng đã chọn freelancer khác cho công việc này.",
        link: `/jobs/${result.jobId}`,
        category: "SYSTEM",
        referenceId: item.id,
      })
    )
  );

  return result.contract;
}

export async function listMyContracts(userId: string) {
  return prisma.contract.findMany({
    where: {
      OR: [{ clientId: userId }, { freelancerId: userId }],
    },
    include: {
      job: true,
      freelancer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          clientProfile: {
            select: {
              companyLogoUrl: true,
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function completeContract(contractId: string) {
  const contract = await prisma.$transaction(async (tx) => {
    const updated = await tx.contract.update({
      where: { id: contractId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    await tx.job.update({
      where: { id: updated.jobId },
      data: { status: "COMPLETED" },
    });

    return updated;
  });

  await recomputeFreelancerMetrics(contract.freelancerId);
  await awardPoints(contract.freelancerId, 100, "job_complete");

  await createNotification(contract.freelancerId, "notification:contract_completed", {
    title: "Hợp đồng đã hoàn tất",
    body: "Chúc mừng bạn đã hoàn thành hợp đồng thành công.",
    link: `/contracts/${contract.id}`,
    category: "SYSTEM",
    referenceId: contract.id,
  });

  return contract;
}

export async function cancelContract(contractId: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.contract.update({
      where: { id: contractId },
      data: { status: "CANCELLED" },
    });

    await tx.job.update({
      where: { id: updated.jobId },
      data: { status: "OPEN" },
    });

    return updated;
  });
}

export async function updateContractDetails(
  contractId: string,
  clientId: string,
  data: { price?: number; dueAt?: string }
) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { id: true, clientId: true, status: true, job: { select: { budget: true } } },
  });
  if (!contract) {
    throw new Error("Contract not found");
  }
  if (contract.clientId !== clientId) {
    throw new Error("Forbidden");
  }
  if (contract.status !== "ACTIVE") {
    throw new Error("Only active contracts can be updated");
  }

  return prisma.contract.update({
    where: { id: contractId },
    data: {
      // Keep invariant: contract price always equals job budget.
      price: Number(contract.job.budget),
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
    },
  });
}
