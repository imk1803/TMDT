import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/http";

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

export async function topUpWallet(userId: string, amount: number) {
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
        description: "WALLET_TOPUP",
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
        description: "ESCROW_HELD",
        balanceAfter: nextClientAvailable,
      },
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
          },
        },
      },
    });

    if (!payment) throw new HttpError(404, "Payment not found");
    if (payment.escrowStatus !== "HELD") {
      throw new HttpError(400, "Payment is not in HELD state");
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
        description: "ESCROW_RELEASED",
        balanceAfter: nextFreelancerAvailable,
      },
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
