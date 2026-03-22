import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyAccessToken } from "../../../utils/jwt";
import { notificationBus } from "../../../lib/notification-bus";
import { countUnreadNotifications } from "../../../services/notification.service";

type SseResponse = NextApiResponse & {
  flushHeaders?: () => void;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

async function authenticate(req: NextApiRequest) {
  const queryToken = typeof req.query.token === "string" ? req.query.token : "";
  const headerAuth = req.headers.authorization;
  const headerToken =
    headerAuth && headerAuth.startsWith("Bearer ")
      ? headerAuth.replace("Bearer ", "").trim()
      : "";
  const token = queryToken || headerToken;
  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, isBanned: true },
    });
    if (!dbUser || dbUser.isBanned) return null;
    return dbUser;
  } catch {
    return null;
  }
}

function sendEvent(res: SseResponse, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default async function stream(req: NextApiRequest, res: SseResponse) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const user = await authenticate(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const sendUnread = async () => {
    const unreadCount = await countUnreadNotifications(user.id);
    sendEvent(res, "unread_count", { unreadCount });
  };

  await sendUnread();

  const onChanged = async (payload: { userId: string, notification?: any }) => {
    if (payload.userId !== user.id) return;
    await sendUnread();
    if (payload.notification) {
      sendEvent(res, "new_notification", payload.notification);
    }
  };

  notificationBus.on("notifications:changed", onChanged);

  const heartbeat = setInterval(() => {
    sendEvent(res, "heartbeat", { ts: Date.now() });
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    notificationBus.off("notifications:changed", onChanged);
    res.end();
  });
}

