import type { Freelancer } from "@/types/freelancer";
import { apiFetch } from "./api";

export function mapFreelancer(apiUser: any): Freelancer {
  const profileCategories = apiUser.freelancerProfile?.categories;
  const categoryFromProfile =
    Array.isArray(profileCategories) && profileCategories.length > 0
      ? profileCategories[0]?.category?.name
      : undefined;
  const rawCategory = categoryFromProfile || apiUser.freelancerProfile?.title;
  const category =
    rawCategory && typeof rawCategory === "string" ? rawCategory : "Công nghệ thông tin";

  return {
    id: apiUser.id,
    name: apiUser.name,
    avatar: apiUser.avatarUrl || "https://i.pravatar.cc/150?img=1",
    category: category as Freelancer["category"],
    completedJobs: apiUser.freelancerProfile?.completedJobs || 0,
    totalIncome: Number(apiUser.freelancerProfile?.totalIncome || 0),
    rating: apiUser.freelancerProfile?.avgRating || 0,
    onTimeRate: apiUser.freelancerProfile?.onTimeRate ?? 90,
  };
}

export async function fetchFreelancers() {
  const res = await apiFetch<{ freelancers: any[] }>("/api/freelancers");
  return res.freelancers.map(mapFreelancer);
}
