import type { Job } from "@/types/job";
import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

function formatVnd(amount?: number | null) {
  if (!amount || amount <= 0) return "Thỏa thuận";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function mapJob(apiJob: any): Job {
  const companyName =
    apiJob?.client?.clientProfile?.companyName ||
    apiJob?.client?.name ||
    "Doanh nghiệp";
  const budgetValue = apiJob?.budget ? Number(apiJob.budget) : null;

  return {
    id: apiJob.id,
    title: apiJob.title,
    companyId: apiJob.clientId,
    companyName,
    categoryName: apiJob?.category?.name || undefined,
    location: apiJob.location || "Remote",
    salary: formatVnd(budgetValue),
    salaryValue: budgetValue,
    type: "Freelance",
    workMode: (apiJob.workMode as Job["workMode"]) || "Remote",
    experienceLevel: (apiJob.experienceLevel as Job["experienceLevel"]) || "Mid",
    tags: Array.isArray(apiJob.skills)
      ? apiJob.skills.map((s: any) => s.skill?.name).filter(Boolean)
      : [],
    description: apiJob.description || "",
  };
}

export async function fetchJobs() {
  const res = await apiFetch<{ jobs: any[] }>("/api/jobs");
  return res.jobs.map(mapJob);
}

export async function fetchMyJobs() {
  const token = getAccessToken();
  const res = await apiFetch<{ jobs: any[] }>("/api/jobs/my", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.jobs.map(mapJob);
}

export async function createJob(payload: {
  title: string;
  description: string;
  budget: number;
  location?: string;
  workMode?: string;
  experienceLevel?: string;
  deadlineAt?: string;
  categoryName?: string;
  milestones?: { title: string; percent: number; dueDate?: string }[];
}) {
  const token = getAccessToken();
  return apiFetch<{ job: any }>("/api/jobs", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function updateJob(
  id: string,
  payload: {
    title?: string;
    description?: string;
    budget?: number;
    location?: string;
    workMode?: string;
    experienceLevel?: string;
    categoryName?: string;
    milestones?: { title: string; percent: number; dueDate?: string }[];
  }
) {
  const token = getAccessToken();
  return apiFetch<{ job: any }>(`/api/jobs/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function deleteJob(id: string) {
  const token = getAccessToken();
  return apiFetch<{ job: any }>(`/api/admin/jobs/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
