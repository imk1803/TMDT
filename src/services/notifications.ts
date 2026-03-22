import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export interface AppNotification {
  id: string;
  type: string;
  category: "SYSTEM" | "MESSAGE" | "PAYMENT" | "SUPPORT";
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  referenceId?: string | null;
  metadata?: any;
  readAt?: string | null;
  createdAt: string;
}

export function resolveNotificationHref(notification: Pick<AppNotification, "link">) {
  if (notification.link && notification.link.startsWith("/")) {
    return notification.link;
  }
  return "/notifications";
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function getNotificationsStreamUrl() {
  const token = getAccessToken();
  if (!token) return null;
  const url = new URL("/api/notifications/stream", API_BASE);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function fetchMyNotifications() {
  return apiFetch<{ notifications: AppNotification[] }>("/api/notifications", {
    headers: authHeaders(),
  });
}

export async function markNotificationRead(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/notifications/${id}/read`, {
    method: "PUT",
    headers: authHeaders(),
  });
}

export async function markAllNotificationsRead() {
  return apiFetch<{ ok: boolean }>("/api/notifications/read-all", {
    method: "PUT",
    headers: authHeaders(),
  });
}
