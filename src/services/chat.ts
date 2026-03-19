import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "./storage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

let socketInstance: Socket | null = null;

export async function ensureChatServerReady() {
  try {
    await fetch(`${API_BASE}/api/socket`);
  } catch {
    // best effort bootstrap
  }
}

export function getChatSocket() {
  if (socketInstance) return socketInstance;
  const token = getAccessToken();
  socketInstance = io(API_BASE, {
    path: "/api/socket/io",
    transports: ["websocket"],
    auth: token ? { token } : undefined,
  });
  return socketInstance;
}

export function disconnectChatSocket() {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
}
