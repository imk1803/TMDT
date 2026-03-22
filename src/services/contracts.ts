import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export async function createContract(payload: {
  proposalId: string;
  price?: number;
  dueAt?: string;
}) {
  const token = getAccessToken();
  return apiFetch<{ contract: any }>("/api/contracts", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function fetchMyContracts() {
  const token = getAccessToken();
  return apiFetch<{ contracts: any[] }>("/api/contracts", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function updateContract(
  id: string,
  payload: { price?: number; dueAt?: string }
) {
  const token = getAccessToken();
  return apiFetch<{ contract: any }>(`/api/contracts/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function completeContract(id: string) {
  const token = getAccessToken();
  return apiFetch<{ contract: any }>(`/api/contracts/${id}/complete`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function cancelContract(id: string) {
  const token = getAccessToken();
  return apiFetch<{ contract: any }>(`/api/contracts/${id}/cancel`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
