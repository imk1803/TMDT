import { prisma } from "../lib/prisma";
import { emitNotificationsChanged } from "../lib/notification-bus";

const db = prisma as any;

export async function createNotification(data: {
  userId: string;
  type?: "SYSTEM" | "JOB" | "PROPOSAL" | "CONTRACT" | "REVIEW" | "MESSAGE";
  title: string;
  body: string;
  link?: string;
}) {
  const notification = await db.notification.create({
    data: {
      userId: data.userId,
      type: data.type || "SYSTEM",
      title: data.title,
      body: data.body,
      link: data.link,
    },
  });
  emitNotificationsChanged(data.userId);
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
      readAt: null,
    },
    data: {
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
      readAt: null,
    },
    data: {
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
      readAt: null,
    },
  });
}
