import { prisma } from "../lib/prisma";
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

    const contract = await tx.contract.create({
      data: {
        jobId: proposal.jobId,
        clientId,
        freelancerId: proposal.freelancerId,
        price: data.price ?? Number(proposal.bidAmount),
        dueAt: data.dueAt ? new Date(data.dueAt) : proposal.job.deadlineAt ?? undefined,
      },
    });

    const jobMilestones = await tx.jobMilestone.findMany({
      where: { jobId: proposal.jobId },
      orderBy: { createdAt: "asc" },
    });
    if (jobMilestones.length > 0) {
      await tx.milestone.createMany({
        data: jobMilestones.map((milestone) => ({
          contractId: contract.id,
          title: milestone.title,
          amount: milestone.amount,
          dueDate: milestone.dueDate ?? undefined,
          status: "PENDING",
        })),
      });
    }

    return {
      contract,
      jobId: proposal.jobId,
      autoRejectedProposals,
    };
  });

  await Promise.all(
    result.autoRejectedProposals.map((item) =>
      createNotification({
        userId: item.freelancerId,
        type: "PROPOSAL",
        title: "Ð? xu?t c?a b?n dã b? t? ch?i",
        body: "Nhà tuy?n d?ng dã ch?n freelancer khác cho công vi?c này.",
        link: `/jobs/${result.jobId}`,
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
