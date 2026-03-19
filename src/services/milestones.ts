import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  amount: number | string;
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED";
  dueDate?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  createdAt?: string;
}

export async function fetchContractMilestones(contractId: string) {
  const token = getAccessToken();
  return apiFetch<{ milestones: Milestone[] }>(`/api/contracts/${contractId}/milestones`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function createMilestone(payload: {
  contractId: string;
  title: string;
  amount: number;
  dueDate?: string;
}) {
  const token = getAccessToken();
  return apiFetch<{ milestone: Milestone }>("/api/milestones", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function submitMilestone(id: string) {
  const token = getAccessToken();
  return apiFetch<{ milestone: Milestone }>(`/api/milestones/${id}/submit`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function approveMilestone(id: string) {
  const token = getAccessToken();
  return apiFetch<{ milestone: Milestone }>(`/api/milestones/${id}/approve`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function updateMilestone(
  id: string,
  payload: { amount?: number; dueDate?: string; status?: Milestone["status"]; title?: string }
) {
  const token = getAccessToken();
  return apiFetch<{ milestone: Milestone }>(`/api/milestones/${id}`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}
