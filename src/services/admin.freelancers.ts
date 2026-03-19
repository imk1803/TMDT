import type { Freelancer } from "@/types/freelancer";
import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export async function adminFetchFreelancers(): Promise<Freelancer[]> {
  const token = getAccessToken();
  const res = await apiFetch<{ freelancers: any[] }>("/api/admin/freelancers", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return res.freelancers.map((f) => ({
    id: f.id,
    name: f.name,
    avatar: f.avatarUrl || "https://i.pravatar.cc/150?img=1",
    category: (f.freelancerProfile?.title as Freelancer["category"]) || "IT",
    completedJobs: f.freelancerProfile?.completedJobs || 0,
    totalIncome: Number(f.freelancerProfile?.totalIncome || 0),
    rating: f.freelancerProfile?.rating || 0,
    onTimeRate: f.freelancerProfile?.onTimeRate ?? 90,
    currentRank: f.freelancerProfile?.rating ? 1 : undefined,
  }));
}

export async function adminCreateFreelancer(payload: {
  name: string;
  email: string;
  password: string;
  title?: string;
  hourlyRate?: number;
  completedJobs?: number;
  totalIncome?: number;
  rating?: number;
  onTimeRate?: number;
}) {
  const token = getAccessToken();
  return apiFetch<{ freelancer: any }>("/api/admin/freelancers", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateFreelancer(id: string, payload: {
  name?: string;
  title?: string;
  hourlyRate?: number;
  completedJobs?: number;
  totalIncome?: number;
  rating?: number;
  onTimeRate?: number;
}) {
  const token = getAccessToken();
  return apiFetch<{ freelancer: any }>(`/api/admin/freelancers/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteFreelancer(id: string) {
  const token = getAccessToken();
  return apiFetch<{ freelancer: any }>(`/api/admin/freelancers/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
