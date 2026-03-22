import { HttpError } from "../utils/http";

export enum BillingAction {
  POST_JOB = "POST_JOB",
  ACCEPT_PROPOSAL = "ACCEPT_PROPOSAL",
  RELEASE_PAYMENT = "RELEASE_PAYMENT",
  BOOST_JOB = "BOOST_JOB",
  APPLY_JOB_OVER_LIMIT = "APPLY_JOB_OVER_LIMIT",
}

const BILLING_PRICING: Record<BillingAction, number | ((meta: any) => number)> = {
  [BillingAction.POST_JOB]: 10000,
  [BillingAction.BOOST_JOB]: 20000,
  [BillingAction.APPLY_JOB_OVER_LIMIT]: 2000,
  [BillingAction.ACCEPT_PROPOSAL]: (meta: any) => meta.amountOverride || 0,
  [BillingAction.RELEASE_PAYMENT]: (meta: any) => meta.amountOverride || 0,
};

export async function chargeUser(
  tx: any, 
  userId: string, 
  action: BillingAction, 
  metadata: { referenceId?: string; amountOverride?: number } = {}
) {
  let amount = 0;
  const pricingRule = BILLING_PRICING[action];
  if (typeof pricingRule === "function") {
    amount = pricingRule(metadata);
  } else {
    amount = pricingRule;
  }

  if (amount <= 0) return true;

  const wallet = await tx.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const available = Number(wallet.availableBalance ?? 0);

  if (available < amount) {
    throw new HttpError(400, `Số dư ví không đủ để thực hiện thao tác. Mã lỗi: ${action} - Yêu cầu: ${amount.toLocaleString('vi-VN')} VND`);
  }

  const nextAvailable = available - amount;
  
  await tx.wallet.update({
    where: { userId },
    data: {
      availableBalance: nextAvailable,
    },
  });

  await tx.transaction.create({
    data: {
      userId,
      amount,
      type: "DEBIT",
      category: "PLATFORM",
      action: action,
      description: `Biểu phí dịch vụ hệ thống hành động [${action}]${metadata.referenceId ? ` (ref_id: ${metadata.referenceId})` : ''}`,
      balanceAfter: nextAvailable,
    },
  });

  return true;
}

export async function creditUser(
  tx: any,
  userId: string,
  actionText: string,
  description: string,
  amount: number
) {
  if (amount <= 0) return true;

  const wallet = await tx.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const available = Number(wallet.availableBalance ?? 0);
  const nextAvailable = available + amount;

  await tx.wallet.update({
    where: { userId },
    data: {
      availableBalance: nextAvailable,
    },
  });

  await tx.transaction.create({
    data: {
      userId,
      amount,
      type: "CREDIT",
      category: "USER",
      action: "RECEIVE_FUNDS",
      description: `Nhận thanh toán [${actionText}]: ${description}`,
      balanceAfter: nextAvailable,
    },
  });

  return true;
}
