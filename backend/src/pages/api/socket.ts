import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { Server as IOServer } from "socket.io";
import type { Server as IOServerType, Socket as IOSocket } from "socket.io";
import { verifyAccessToken } from "../../utils/jwt";
import { prisma } from "../../lib/prisma";
import {
  createContractMessage,
  getContractForUser,
  listContractMessages,
  markContractMessagesRead,
} from "../../services/message.service";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: IOServerType;
    };
  };
};

interface AuthedSocket extends IOSocket {
  data: IOSocket["data"] & {
    userId?: string;
    role?: string;
  };
}

function getTokenFromSocket(socket: IOSocket) {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }
  const headerAuth = socket.handshake.headers.authorization;
  if (typeof headerAuth === "string" && headerAuth.startsWith("Bearer ")) {
    return headerAuth.replace("Bearer ", "").trim();
  }
  const queryToken = socket.handshake.query.token;
  if (typeof queryToken === "string" && queryToken.trim()) {
    return queryToken.trim();
  }
  return "";
}

async function authorizeSocket(socket: IOSocket) {
  const token = getTokenFromSocket(socket);
  if (!token) {
    throw new Error("Unauthorized");
  }
  const payload = verifyAccessToken(token);
  const dbUser = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isBanned: true },
  });
  if (!dbUser || dbUser.isBanned) {
    throw new Error("Unauthorized");
  }
  return { id: dbUser.id, role: dbUser.role };
}

function roomForContract(contractId: string) {
  return `contract:${contractId}`;
}

const contractPresence = new Map<string, Map<string, number>>();
const socketJoinedContracts = new Map<string, Set<string>>();

function addPresence(contractId: string, userId: string) {
  const byUser = contractPresence.get(contractId) ?? new Map<string, number>();
  byUser.set(userId, (byUser.get(userId) ?? 0) + 1);
  contractPresence.set(contractId, byUser);
}

function removePresence(contractId: string, userId: string) {
  const byUser = contractPresence.get(contractId);
  if (!byUser) return;
  const next = (byUser.get(userId) ?? 0) - 1;
  if (next <= 0) {
    byUser.delete(userId);
  } else {
    byUser.set(userId, next);
  }
  if (byUser.size === 0) {
    contractPresence.delete(contractId);
  } else {
    contractPresence.set(contractId, byUser);
  }
}

function getOnlineUserIds(contractId: string) {
  const byUser = contractPresence.get(contractId);
  if (!byUser) return [];
  return Array.from(byUser.keys());
}

function emitPresence(io: IOServerType, contractId: string) {
  io.to(roomForContract(contractId)).emit("chat:presence", {
    contractId,
    onlineUserIds: getOnlineUserIds(contractId),
  });
}

function initSocket(io: IOServerType) {
  io.use(async (socket, next) => {
    try {
      const user = await authorizeSocket(socket);
      const authed = socket as AuthedSocket;
      authed.data.userId = user.id;
      authed.data.role = user.role;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const authed = socket as AuthedSocket;

    socket.on("chat:join", async (payload: { contractId?: string }, ack?: (data: any) => void) => {
      try {
        const contractId = payload?.contractId?.trim();
        const userId = authed.data.userId;
        if (!contractId || !userId) {
          ack?.({ ok: false, error: "Invalid payload" });
          return;
        }
        const contract = await getContractForUser(contractId, userId);
        if (!contract) {
          ack?.({ ok: false, error: "Forbidden" });
          return;
        }
        const room = roomForContract(contractId);
        const joined = socketJoinedContracts.get(socket.id) ?? new Set<string>();
        const firstJoinForSocket = !joined.has(contractId);
        if (firstJoinForSocket) {
          joined.add(contractId);
          socketJoinedContracts.set(socket.id, joined);
          addPresence(contractId, userId);
        }
        socket.join(room);
        const messages = await listContractMessages(contractId, userId);
        const readMessageIds = await markContractMessagesRead(contractId, userId);
        if (readMessageIds.length > 0) {
          io.to(room).emit("chat:read", {
            contractId,
            readerId: userId,
            messageIds: readMessageIds,
            readAt: new Date().toISOString(),
          });
        }
        emitPresence(io, contractId);
        ack?.({ ok: true, messages, onlineUserIds: getOnlineUserIds(contractId) });
      } catch (err: any) {
        ack?.({ ok: false, error: err?.message || "Join failed" });
      }
    });

    socket.on(
      "chat:send",
      async (
        payload: { contractId?: string; content?: string },
        ack?: (data: any) => void
      ) => {
        try {
          const contractId = payload?.contractId?.trim();
          const content = payload?.content?.trim();
          const userId = authed.data.userId;
          if (!contractId || !content || !userId) {
            ack?.({ ok: false, error: "Invalid payload" });
            return;
          }
          if (content.length > 2000) {
            ack?.({ ok: false, error: "Message too long" });
            return;
          }
          const message = await createContractMessage(contractId, userId, content);
          io.to(roomForContract(contractId)).emit("chat:new", message);
          ack?.({ ok: true, message });
        } catch (err: any) {
          ack?.({ ok: false, error: err?.message || "Send failed" });
        }
      }
    );

    socket.on(
      "chat:typing",
      async (
        payload: { contractId?: string; isTyping?: boolean },
        ack?: (data: any) => void
      ) => {
        try {
          const contractId = payload?.contractId?.trim();
          const userId = authed.data.userId;
          if (!contractId || !userId) {
            ack?.({ ok: false, error: "Invalid payload" });
            return;
          }
          const contract = await getContractForUser(contractId, userId);
          if (!contract) {
            ack?.({ ok: false, error: "Forbidden" });
            return;
          }
          socket.to(roomForContract(contractId)).emit("chat:typing", {
            contractId,
            userId,
            isTyping: Boolean(payload?.isTyping),
          });
          ack?.({ ok: true });
        } catch (err: any) {
          ack?.({ ok: false, error: err?.message || "Typing failed" });
        }
      }
    );

    socket.on("chat:read", async (payload: { contractId?: string }, ack?: (data: any) => void) => {
      try {
        const contractId = payload?.contractId?.trim();
        const userId = authed.data.userId;
        if (!contractId || !userId) {
          ack?.({ ok: false, error: "Invalid payload" });
          return;
        }
        const readMessageIds = await markContractMessagesRead(contractId, userId);
        if (readMessageIds.length > 0) {
          io.to(roomForContract(contractId)).emit("chat:read", {
            contractId,
            readerId: userId,
            messageIds: readMessageIds,
            readAt: new Date().toISOString(),
          });
        }
        ack?.({ ok: true, messageIds: readMessageIds });
      } catch (err: any) {
        ack?.({ ok: false, error: err?.message || "Read failed" });
      }
    });

    socket.on("disconnect", () => {
      const userId = authed.data.userId;
      const joined = socketJoinedContracts.get(socket.id);
      if (!userId || !joined || joined.size === 0) return;
      for (const contractId of Array.from(joined)) {
        removePresence(contractId, userId);
        emitPresence(io, contractId);
      }
      socketJoinedContracts.delete(socket.id);
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket/io",
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
      },
    });
    res.socket.server.io = io;
    initSocket(io);
  }
  res.status(200).json({ ok: true });
}
