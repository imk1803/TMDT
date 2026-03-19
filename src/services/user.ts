import { apiFetch } from "./api";
import { getAccessToken } from "./storage";
import type { AuthUser } from "./auth";

export async function updateProfile(payload: {
  name?: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  hourlyRate?: number;
  companyName?: string;
  industry?: string;
  location?: string;
  tagline?: string;
}) {
  const token = getAccessToken();
  return apiFetch<{ user: AuthUser }>("/api/users/profile", {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}
