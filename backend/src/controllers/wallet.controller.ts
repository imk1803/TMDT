import type { NextApiRequest, NextApiResponse } from "next";
import { withErrorHandler } from "../middleware/error";
import { withAuth } from "../middleware/auth";
import { sendJson } from "../utils/http";
import { topUpWalletSchema, withdrawWalletSchema } from "../validators/payment";
import { getMyWallet, topUpWallet, withdrawWallet } from "../services/payment.service";

export const my = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const data = await getMyWallet((req as any).user.id);
  sendJson(res, 200, data);
}));

export const topUp = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = topUpWalletSchema.parse(req.body);
  const data = await topUpWallet((req as any).user.id, payload.amount, payload.method);
  sendJson(res, 200, data);
}));

export const withdraw = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = withdrawWalletSchema.parse(req.body);
  const data = await withdrawWallet((req as any).user.id, payload.amount, payload.method);
  sendJson(res, 200, data);
}));


