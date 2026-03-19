import type { Company } from "@/types/company";
import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export async function adminFetchCompanies(): Promise<Company[]> {
  const token = getAccessToken();
  const res = await apiFetch<{ companies: any[] }>("/api/admin/companies", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return res.companies.map((c) => ({
    id: c.id,
    name: c.clientProfile?.companyName || c.name,
    logoUrl: c.clientProfile?.companyLogoUrl || null,
    logoText: (c.clientProfile?.companyName || c.name || "C")
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .slice(0, 3)
      .toUpperCase(),
    location: c.clientProfile?.location || "",
    industry: c.clientProfile?.industry || "",
    employees: c.clientProfile?.companySize || "",
    jobsOpen: 0,
    tagline: c.clientProfile?.tagline || "",
  }));
}

export async function adminCreateCompany(payload: {
  name: string;
  location?: string;
  industry?: string;
  employees?: string;
  tagline?: string;
  logoUrl?: string;
}) {
  const token = getAccessToken();
  return apiFetch<{ company: any }>("/api/admin/companies", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateCompany(id: string, payload: {
  name?: string;
  location?: string;
  industry?: string;
  employees?: string;
  tagline?: string;
  logoUrl?: string;
}) {
  const token = getAccessToken();
  return apiFetch<{ company: any }>(`/api/admin/companies/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteCompany(id: string) {
  const token = getAccessToken();
  return apiFetch<{ company: any }>(`/api/admin/companies/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
