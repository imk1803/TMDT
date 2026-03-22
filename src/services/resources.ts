import { apiFetch, ApiError } from "./api";
import { getAccessToken } from "./storage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export interface Resource {
  id: string;
  contractId: string;
  uploaderId: string;
  type: "FILE" | "IMAGE" | "LINK";
  url: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  uploader?: {
    id: string;
    name: string;
    email: string;
  };
}

export async function uploadResource(contractId: string, file: File): Promise<{ resource: Resource }> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("contractId", contractId);
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/resources/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Upload failed");
  }
  return data;
}

export async function addLinkResource(contractId: string, url: string, fileName?: string): Promise<{ resource: Resource }> {
  const token = getAccessToken();
  return apiFetch<{ resource: Resource }>("/api/resources/link", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify({ contractId, url, fileName }),
  });
}

export async function fetchResources(contractId: string): Promise<{ resources: Resource[] }> {
  const token = getAccessToken();
  return apiFetch<{ resources: Resource[] }>(`/api/resources/${contractId}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function deleteResource(id: string): Promise<{ success: boolean }> {
  const token = getAccessToken();
  return apiFetch<{ success: boolean }>(`/api/resources/delete/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
