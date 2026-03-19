import type { Freelancer } from "@/types/freelancer";
import { apiFetch } from "./api";

export function mapFreelancer(apiUser: any): Freelancer {
  const rawCategory = apiUser.freelancerProfile?.title;
  const category = rawCategory && typeof rawCategory === "string" ? rawCategory : "IT";

  return {
    id: apiUser.id,
    name: apiUser.name,
    avatar: apiUser.avatarUrl || "https://i.pravatar.cc/150?img=1",
    category: category as Freelancer["category"],
    completedJobs: apiUser.freelancerProfile?.completedJobs || 0,
    totalIncome: Number(apiUser.freelancerProfile?.totalIncome || 0),
    rating: apiUser.freelancerProfile?.rating || 0,
    onTimeRate: apiUser.freelancerProfile?.onTimeRate ?? 90,
  };
}

export async function fetchFreelancers() {
  const res = await apiFetch<{ freelancers: any[] }>("/api/freelancers");
  return res.freelancers.map(mapFreelancer);
}
