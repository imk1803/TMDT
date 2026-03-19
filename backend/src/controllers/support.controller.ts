import type { NextApiRequest, NextApiResponse } from "next";
import { createSupportSchema } from "../validators/support";
import { createSupportTicket, listMySupportTickets } from "../services/support.service";
import { sendJson } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withErrorHandler } from "../middleware/error";

export const create = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = createSupportSchema.parse(req.body);
  const ticket = await createSupportTicket((req as any).user.id, payload as any);
  sendJson(res, 201, { ticket });
}));

export const my = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const tickets = await listMySupportTickets((req as any).user.id);
  sendJson(res, 200, { tickets });
}));


