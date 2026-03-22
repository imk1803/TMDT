import { prisma } from "../lib/prisma";
import { emitNotificationsChanged } from "../lib/notification-bus";

const db = prisma as any;

export interface NotificationPayload {
  title: string;
  body: string;
  link?: string;
  referenceId?: string;
  category?: "SYSTEM" | "MESSAGE" | "PAYMENT" | "SUPPORT";
  metadata?: any;
}

export async function createNotification(
  userId: string,
  type: string,
  payload: NotificationPayload
) {
  const notification = await db.notification.create({
    data: {
      userId,
      type,
      category: payload.category || "SYSTEM",
      title: payload.title,
      body: payload.body,
      link: payload.link,
      referenceId: payload.referenceId,
      metadata: payload.metadata ? JSON.parse(JSON.stringify(payload.metadata)) : undefined,
    },
  });
  emitNotificationsChanged(userId, notification);
  return notification;
}

export async function listMyNotifications(userId: string, limit = 50) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
  });
}

export async function markNotificationRead(userId: string, id: string) {
  const result = await db.notification.updateMany({
    where: {
      id,
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
  if (result?.count) emitNotificationsChanged(userId);
  return result;
}

export async function markAllNotificationsRead(userId: string) {
  const result = await db.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
  if (result?.count) emitNotificationsChanged(userId);
  return result;
}

export async function countUnreadNotifications(userId: string) {
  return db.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}
