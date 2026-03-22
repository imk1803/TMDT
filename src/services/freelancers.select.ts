import type { Freelancer } from "@/types/freelancer";
import { apiFetch } from "./api";

export async function fetchFreelancersForSelect(): Promise<Freelancer[]> {
  const res = await apiFetch<{ freelancers: any[] }>("/api/freelancers");
  return res.freelancers.map((f) => ({
    id: f.id,
    name: f.name,
    avatar: f.avatarUrl || "https://i.pravatar.cc/150?img=1",
    category:
      (f.freelancerProfile?.categories?.[0]?.category?.name as Freelancer["category"]) ||
      (f.freelancerProfile?.title as Freelancer["category"]) ||
      "Công nghệ thông tin",
    completedJobs: f.freelancerProfile?.completedJobs || 0,
    totalIncome: Number(f.freelancerProfile?.totalIncome || 0),
    rating: f.freelancerProfile?.avgRating || 0,
    onTimeRate: f.freelancerProfile?.onTimeRate ?? 0,
  }));
}
