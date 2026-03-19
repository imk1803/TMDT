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
