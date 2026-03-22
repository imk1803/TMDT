import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

function _authOpts(opts: RequestInit = {}) {
  const token = typeof window !== "undefined" ? getAccessToken() : "";
  return {
    ...opts,
    headers: {
      ...opts.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

export type SupportType = "SUPPORT" | "DISPUTE";
export type SupportPriority = "LOW" | "MEDIUM" | "HIGH";
export type SupportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface SupportTicket {
  id: string;
  contractId?: string;
  senderId: string;
  title: string;
  description: string;
  type: SupportType;
  priority: SupportPriority;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  contract?: {
    id: string;
    job: { title: string };
  };
  messages?: SupportMessage[];
  _count?: {
    messages: number;
  };
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  attachments: string[];
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
}

export async function createSupportTicket(data: {
  contractId?: string;
  title: string;
  description: string;
  type: SupportType;
  priority?: SupportPriority;
}): Promise<{ ticket: SupportTicket }> {
  return apiFetch("/api/support", _authOpts({
    method: "POST",
    body: JSON.stringify(data),
  }));
}

export async function getMyTickets(): Promise<{ tickets: SupportTicket[] }> {
  return apiFetch("/api/support/my", _authOpts());
}

export async function getTicketDetail(id: string): Promise<{ ticket: SupportTicket }> {
  return apiFetch(`/api/support/${id}`, _authOpts());
}

export async function replyToTicket(
  id: string,
  message: string,
  attachments?: string[]
): Promise<{ message: SupportMessage }> {
  return apiFetch(`/api/support/${id}/message`, _authOpts({
    method: "POST",
    body: JSON.stringify({ message, attachments }),
  }));
}

export async function getAdminSupportTickets(filters?: {
  status?: string;
  type?: string;
  priority?: string;
}): Promise<{ tickets: SupportTicket[] }> {
  const query = new URLSearchParams();
  if (filters?.status) query.append("status", filters.status);
  if (filters?.type) query.append("type", filters.type);
  if (filters?.priority) query.append("priority", filters.priority);
  return apiFetch(`/api/admin/support?${query.toString()}`, _authOpts());
}

export async function updateAdminSupportTicket(
  id: string,
  data: { status?: SupportStatus; priority?: SupportPriority }
): Promise<{ ticket: SupportTicket }> {
  return apiFetch(`/api/admin/support/${id}`, _authOpts({
    method: "PATCH",
    body: JSON.stringify(data),
  }));
}
