import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

function _authOpts(opts: RequestInit = {}) {
  const token = getAccessToken();
  return {
    ...opts,
    headers: {
      ...opts.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  activeContracts: number;
  totalRevenue: number;
}

export async function fetchAdminStats() {
  return apiFetch<AdminStats>("/api/admin/stats", _authOpts());
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENT" | "FREELANCER";
  isBanned: boolean;
  createdAt: string;
}

export async function fetchAdminUsers() {
  return apiFetch<{users: AdminUser[]}>("/api/admin/users", _authOpts()).then(r => r.users);
}

export async function banAdminUser(id: string, isBanned: boolean) {
  return apiFetch<{user: AdminUser}>(`/api/admin/users/${id}/ban`, _authOpts({ method: "PUT", body: JSON.stringify({ isBanned }) })).then(r => r.user);
}

export async function fetchAdminContracts() {
  return apiFetch<{contracts: any[]}>("/api/admin/contracts", _authOpts()).then(r => r.contracts);
}

export async function fetchAdminTransactions() {
  return apiFetch<{transactions: any[]}>("/api/admin/transactions", _authOpts()).then(r => r.transactions);
}

export async function fetchAdminSupport() {
  return apiFetch<{tickets: any[]}>("/api/admin/support", _authOpts()).then(r => r.tickets);
}

export async function fetchAdminLeaderboard() {
  return apiFetch<{leaderboard: any[]}>("/api/admin/leaderboard", _authOpts()).then(r => r.leaderboard);
}

export async function fetchAdminResources() {
  return apiFetch<{resources: any[]}>("/api/admin/resources", _authOpts()).then(r => r.resources);
}

export async function fetchAdminRevenue() {
  return apiFetch<{platformRevenue: number, userVolume: number}>("/api/admin/revenue", _authOpts());
}

export async function updateAdminSupportTicket(id: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED") {
  return apiFetch<{ticket: any}>(`/api/admin/support/${id}`, _authOpts({ method: "PUT", body: JSON.stringify({ status }) })).then(r => r.ticket);
}
