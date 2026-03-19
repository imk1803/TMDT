import type { Company } from "@/types/company";
import { apiFetch } from "./api";

export async function fetchCompanies(): Promise<Company[]> {
  const res = await apiFetch<{ jobs: any[] }>("/api/jobs");
  const map = new Map<string, Company>();

  for (const job of res.jobs) {
    const clientId = job.clientId || job.client?.id || "unknown";
    const name = job.client?.clientProfile?.companyName || job.client?.name || "Company";
    const location = job.location || "Remote";
    const industry = job.category?.name || "General";
    const employees = job.client?.clientProfile?.companySize || "Unknown";
    const tagline = job.description ? String(job.description).slice(0, 80) : "";
    const logoText = name
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

    const existing = map.get(clientId);
    if (existing) {
      existing.jobsOpen += 1;
      continue;
    }

    map.set(clientId, {
      id: clientId,
      name,
      logoText,
      location,
      industry,
      employees,
      jobsOpen: 1,
      tagline: tagline || "Hiring now",
    });
  }

  return Array.from(map.values());
}
