import type { NextApiRequest, NextApiResponse } from "next";
import { withErrorHandler } from "../middleware/error";
import { withAuth } from "../middleware/auth";
import { sendJson } from "../utils/http";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service";

export const my = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const userId = (req as any).user.id;
  const notifications = await listMyNotifications(userId);
  sendJson(res, 200, { notifications });
}));

export const readOne = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const userId = (req as any).user.id;
  const id = req.query.id as string;
  await markNotificationRead(userId, id);
  sendJson(res, 200, { ok: true });
}));

export const readAll = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const userId = (req as any).user.id;
  await markAllNotificationsRead(userId);
  sendJson(res, 200, { ok: true });
}));

