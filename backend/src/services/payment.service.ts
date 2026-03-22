import { prisma } from "../lib/prisma";
import { chargeUser, BillingAction } from "./billing.service";
import { HttpError } from "../utils/http";
import { createNotification } from "./notification.service";

function asNumber(value: any) {
  return Number(value ?? 0);
}

function ensurePositive(value: number, message: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new HttpError(400, message);
  }
}

const db = prisma as any;

async function ensureWallet(userId: string) {
  return db.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getMyWallet(userId: string) {
  await ensureWallet(userId);

  const [wallet, transactions] = await Promise.all([
    db.wallet.findUnique({ where: { userId } }),
    db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        payment: {
          select: {
            id: true,
            contractId: true,
            status: true,
            escrowStatus: true,
          },
        },
      },
    }),
  ]);

  return { wallet, transactions };
}

export async function topUpWallet(userId: string, amount: number, method?: string) {
  ensurePositive(amount, "Top up amount must be positive");

  return db.$transaction(async (tx: any) => {
    const wallet = await tx.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const nextAvailable = asNumber(wallet.availableBalance) + amount;
    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { availableBalance: nextAvailable },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        amount,
        type: "CREDIT",
        category: "USER",
        action: "TOPUP",
        description: method ? `WALLET_TOPUP_${method}` : "WALLET_TOPUP",
        balanceAfter: nextAvailable,
      },
    });

    return { wallet: updatedWallet, transaction };
  });
}

export async function withdrawWallet(userId: string, amount: number, method?: string) {
  ensurePositive(amount, "Withdraw amount must be positive");

  return db.$transaction(async (tx: any) => {
    const wallet = await tx.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const available = asNumber(wallet.availableBalance);
    if (available < amount) {
      throw new HttpError(400, "Insufficient wallet balance");
    }

    const nextAvailable = available - amount;
    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { availableBalance: nextAvailable },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        amount,
        type: "DEBIT",
        category: "USER",
        action: "WITHDRAW",
        description: method ? `WALLET_WITHDRAW_${method}` : "WALLET_WITHDRAW",
        balanceAfter: nextAvailable,
      },
    });

    return { wallet: updatedWallet, transaction };
  });
}

export async function holdEscrow(clientId: string, data: { contractId: string; amount: number; provider?: string }) {
  ensurePositive(data.amount, "Escrow amount must be positive");

  return db.$transaction(async (tx: any) => {
    const contract = await tx.contract.findUnique({
      where: { id: data.contractId },
      select: { id: true, clientId: true, freelancerId: true, status: true },
    });

    if (!contract) throw new HttpError(404, "Contract not found");
    if (contract.clientId !== clientId) throw new HttpError(403, "Forbidden");
    if (contract.status !== "ACTIVE") throw new HttpError(400, "Contract is not active");

    const clientWallet = await tx.wallet.upsert({
      where: { userId: clientId },
      update: {},
      create: { userId: clientId },
    });

    const clientAvailable = asNumber(clientWallet.availableBalance);
    if (clientAvailable < data.amount) {
      throw new HttpError(400, "Insufficient wallet balance");
    }

    const nextClientAvailable = clientAvailable - data.amount;
    const nextClientHeld = asNumber(clientWallet.heldBalance) + data.amount;

    await tx.wallet.update({
      where: { userId: clientId },
      data: {
        availableBalance: nextClientAvailable,
        heldBalance: nextClientHeld,
      },
    });

    const payment = await tx.payment.create({
      data: {
        contractId: data.contractId,
        amount: data.amount,
        provider: data.provider,
        status: "PENDING",
        escrowStatus: "HELD",
      } as any,
    });

    await tx.transaction.create({
      data: {
        userId: clientId,
        paymentId: payment.id,
        amount: data.amount,
        type: "DEBIT",
        category: "USER",
        action: "ESCROW_HOLD",
        description: "ESCROW_HELD",
        balanceAfter: nextClientAvailable,
      },
    });

    await createNotification(clientId, "notification:payment_added", {
      title: "Đã tạm giữ thanh toán",
      body: `Khoản thanh toán ${data.amount.toLocaleString("vi-VN")} VND đã được tạm giữ an toàn.`,
      link: `/contracts/${data.contractId}`,
      category: "PAYMENT",
      referenceId: payment.id,
    });

    return payment;
  });
}

export async function releaseEscrow(actorId: string, actorRole: string, paymentId: string) {
  return db.$transaction(async (tx: any) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: {
          select: {
            id: true,
            clientId: true,
            freelancerId: true,
            supportTickets: {
              where: {
                type: "DISPUTE",
                status: { in: ["OPEN", "IN_PROGRESS"] },
              },
            },
          },
        },
      },
    });

    if (!payment) throw new HttpError(404, "Payment not found");
    if (payment.escrowStatus !== "HELD") {
      throw new HttpError(400, "Payment is not in HELD state");
    }

    if (payment.contract.supportTickets && payment.contract.supportTickets.length > 0) {
      throw new HttpError(400, "Không thể giải ngân khi hợp đồng đang có Khiếu nại (Dispute) chưa giải quyết.");
    }

    const canRelease = actorRole === "ADMIN" || payment.contract.clientId === actorId;
    if (!canRelease) throw new HttpError(403, "Forbidden");

    const clientWallet = await tx.wallet.upsert({
      where: { userId: payment.contract.clientId },
      update: {},
      create: { userId: payment.contract.clientId },
    });

    const held = asNumber(clientWallet.heldBalance);
    const amount = asNumber(payment.amount);

    if (held < amount) {
      throw new HttpError(400, "Insufficient held balance to release");
    }

    const nextClientHeld = held - amount;
    await tx.wallet.update({
      where: { userId: payment.contract.clientId },
      data: { heldBalance: nextClientHeld },
    });

    const freelancerWallet = await tx.wallet.upsert({
      where: { userId: payment.contract.freelancerId },
      update: {},
      create: { userId: payment.contract.freelancerId },
    });

    const nextFreelancerAvailable = asNumber(freelancerWallet.availableBalance) + amount;
    await tx.wallet.update({
      where: { userId: payment.contract.freelancerId },
      data: { availableBalance: nextFreelancerAvailable },
    });

    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        escrowStatus: "RELEASED",
        status: "PAID",
        releasedAt: new Date(),
      } as any,
    });

    await tx.transaction.create({
      data: {
        userId: payment.contract.freelancerId,
        paymentId: payment.id,
        amount,
        type: "CREDIT",
        category: "USER",
        action: "ESCROW_RELEASE",
        description: "ESCROW_RELEASED",
        balanceAfter: nextFreelancerAvailable,
      },
    });

    await chargeUser(tx, payment.contract.freelancerId, BillingAction.RELEASE_PAYMENT, { 
      referenceId: paymentId, 
      amountOverride: amount * 0.1 
    });

    await createNotification(payment.contract.freelancerId, "notification:payment_released", {
      title: "Thanh toán đã được giải ngân",
      body: `Bạn đã nhận được khoản thanh toán ${amount.toLocaleString("vi-VN")} VND.`,
      link: `/contracts/${payment.contract.id}`,
      category: "PAYMENT",
      referenceId: payment.id,
    });

    return updatedPayment;
  });
}

export async function listMyPayments(userId: string) {
  return db.payment.findMany({
    where: {
      OR: [
        { contract: { clientId: userId } },
        { contract: { freelancerId: userId } },
      ],
    },
    include: {
      contract: {
        select: {
          id: true,
          clientId: true,
          freelancerId: true,
          jobId: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
