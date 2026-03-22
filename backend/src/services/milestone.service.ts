import { prisma } from "../lib/prisma";
import { chargeUser, creditUser, BillingAction } from "./billing.service";

async function ensureMilestoneEditableWindow(contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { id: true, status: true },
  });
  if (!contract) {
    throw new Error("Contract not found");
  }

  // Current contract statuses are ACTIVE/COMPLETED/CANCELLED.
  // We treat the editable window as "pre-start" when contract is ACTIVE and
  // all milestones are still PENDING.
  if (contract.status !== "ACTIVE") {
    throw new Error("Milestones are locked once contract has started");
  }

  const startedMilestone = await prisma.milestone.findFirst({
    where: {
      contractId,
      status: { in: ["IN_PROGRESS", "SUBMITTED", "APPROVED"] },
    },
    select: { id: true },
  });
  if (startedMilestone) {
    // Extension point: replace this hard lock with a change-request workflow.
    throw new Error("Milestones are locked once contract is in progress");
  }
}

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
    orderBy: [
      { createdAt: "asc" },
      { id: "asc" }
    ],
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
  await ensureMilestoneEditableWindow(contract.id);

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

  const updated = await prisma.$transaction(async (tx) => {
    // 1. Tiền đã được tạm giữ lúc IN_PROGRESS, nay chỉ cần chuyển cho Freelancer

    // 2. Cộng tiền vào ví của Freelancer (đã trừ 10% phí nền tảng)
    const netAmount = Number(milestone.amount) * 0.9;
    await creditUser(
      tx,
      milestone.contract.freelancerId,
      "GIAI ĐOẠN",
      `Thanh toán giai đoạn: ${milestone.title}`,
      netAmount
    );

    // 3. Đánh dấu giai đoạn hoàn tất
    return tx.milestone.update({
      where: { id: milestoneId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        paidAt: new Date(),
      },
    });
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
    include: { contract: { select: { id: true, clientId: true } } },
  });
  if (!milestone) throw new Error("Milestone not found");
  if (milestone.contract.clientId !== clientId) throw new Error("Forbidden");

  const isEditingFields =
    data.title !== undefined || data.amount !== undefined || data.dueDate !== undefined;
  if (isEditingFields) {
    await ensureMilestoneEditableWindow(milestone.contract.id);
  }

  return prisma.$transaction(async (tx) => {
    // Escrow: Tạm giữ quỹ khi bắt đầu giai đoạn
    if (milestone.status === "PENDING" && data.status === "IN_PROGRESS") {
      await chargeUser(tx, clientId, BillingAction.RELEASE_PAYMENT, {
        amountOverride: Number(milestone.amount),
        referenceId: milestone.id,
      });
    }

    return tx.milestone.update({
      where: { id: milestoneId },
      data: {
        title: data.title ?? undefined,
        amount: data.amount ?? undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status ?? undefined,
      },
    });
  });
}
