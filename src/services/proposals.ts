import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export async function submitProposal(payload: {
  jobId: string;
  coverLetter?: string;
  bidAmount: number;
}) {
  const token = getAccessToken();
  return apiFetch<{ proposal: any }>("/api/proposals", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function fetchJobProposals(jobId: string) {
  const token = getAccessToken();
  return apiFetch<{ proposals: any[] }>(`/api/jobs/${jobId}/proposals`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function updateProposalStatus(proposalId: string, status: "ACCEPTED" | "REJECTED") {
  const token = getAccessToken();
  return apiFetch<{ proposal: any; contract?: any }>(`/api/proposals/${proposalId}`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify({ status }),
  });
}

export async function fetchMyProposals() {
  const token = getAccessToken();
  return apiFetch<{ proposals: any[] }>("/api/proposals/my", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
