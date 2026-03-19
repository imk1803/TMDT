import { prisma } from "../lib/prisma";

export async function listContractMilestones(contractId: string, userId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { id: true, clientId: true, freelancerId: true },
  });
  if (!contract) {
    throw new Error("Contract not found");
  }
  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new Error("Forbidden");
  }

  return prisma.milestone.findMany({
    where: { contractId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createMilestone(
  clientId: string,
  data: {
    contractId?: string;
    title?: string;
    amount?: number;
    dueDate?: string;
  }
) {
  if (!data.contractId || !data.title || data.amount === undefined || data.amount === null) {
    throw new Error("Contract, title and amount are required");
  }

  const contract = await prisma.contract.findUnique({
    where: { id: data.contractId },
    select: { id: true, clientId: true },
  });
  if (!contract) {
    throw new Error("Contract not found");
  }
  if (contract.clientId !== clientId) {
    throw new Error("Forbidden");
  }

  return prisma.milestone.create({
    data: {
      contractId: data.contractId,
      title: data.title,
      amount: data.amount,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: "PENDING",
    },
  });
}

export async function submitMilestone(milestoneId: string, freelancerId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { contract: { select: { id: true, freelancerId: true, clientId: true, jobId: true } } },
  });
  if (!milestone) {
    throw new Error("Milestone not found");
  }
  if (milestone.contract.freelancerId !== freelancerId) {
    throw new Error("Forbidden");
  }
  if (milestone.status === "APPROVED") {
    throw new Error("Milestone already approved");
  }

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });
  return { milestone: updated, contract: milestone.contract };
}

export async function approveMilestone(milestoneId: string, clientId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { contract: { select: { id: true, clientId: true, freelancerId: true, jobId: true } } },
  });
  if (!milestone) {
    throw new Error("Milestone not found");
  }
  if (milestone.contract.clientId !== clientId) {
    throw new Error("Forbidden");
  }

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      paidAt: new Date(),
    },
  });
  return { milestone: updated, contract: milestone.contract };
}

export async function updateMilestone(
  milestoneId: string,
  clientId: string,
  data: {
    title?: string;
    amount?: number;
    dueDate?: string;
    status?: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED";
  }
) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { contract: { select: { clientId: true } } },
  });
  if (!milestone) throw new Error("Milestone not found");
  if (milestone.contract.clientId !== clientId) throw new Error("Forbidden");

  return prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      title: data.title ?? undefined,
      amount: data.amount ?? undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: data.status ?? undefined,
    },
  });
}
