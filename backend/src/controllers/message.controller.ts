import type { NextApiRequest, NextApiResponse } from "next";
import { createMessageSchema } from "../validators/message";
import { listMessages, createMessage } from "../services/message.service";
import { sendJson } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withErrorHandler } from "../middleware/error";

export const list = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const conversationId = req.query.conversation as string;
  const messages = await listMessages(conversationId);
  sendJson(res, 200, { messages });
}));

export const create = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = createMessageSchema.parse(req.body);
  const message = await createMessage((req as any).user.id, payload as any);
  sendJson(res, 201, { message });
}));


