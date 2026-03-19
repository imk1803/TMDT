import type { NextApiRequest, NextApiResponse } from "next";
import { withErrorHandler } from "../middleware/error";
import { withAuth } from "../middleware/auth";
import { withRole } from "../middleware/role";
import { sendJson } from "../utils/http";
import { holdEscrowSchema } from "../validators/payment";
import { holdEscrow, listMyPayments, releaseEscrow } from "../services/payment.service";

export const my = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const payments = await listMyPayments((req as any).user.id);
  sendJson(res, 200, { payments });
}));

export const hold = withErrorHandler(withAuth(withRole(["CLIENT"], async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = holdEscrowSchema.parse(req.body);
  const payment = await holdEscrow((req as any).user.id, payload as any);
  sendJson(res, 201, { payment });
})));

export const release = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const payment = await releaseEscrow((req as any).user.id, (req as any).user.role, id);
  sendJson(res, 200, { payment });
}));


