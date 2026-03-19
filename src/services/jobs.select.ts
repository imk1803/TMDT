import type { Job } from "@/types/job";
import { apiFetch } from "./api";

export async function fetchJobsForSelect(): Promise<Job[]> {
  const res = await apiFetch<{ jobs: any[] }>("/api/jobs");
  return res.jobs.map((j) => ({
    id: j.id,
    title: j.title,
    companyId: j.clientId,
    companyName: j.client?.clientProfile?.companyName || j.client?.name || "Doanh nghiệp",
    location: j.location || "Remote",
    salary: "",
    salaryValue: j.budget ? Number(j.budget) : null,
    type: "Freelance",
    workMode: j.workMode || "Remote",
    experienceLevel: j.experienceLevel || "Mid",
    tags: [],
    description: j.description || "",
  } as Job));
}
