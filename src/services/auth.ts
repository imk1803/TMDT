import { apiFetch } from "./api";
import { clearTokens, getAccessToken, getRefreshToken, setStoredUser, setTokens } from "./storage";

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  freelancerProfile?: {
    title?: string | null;
    bio?: string | null;
    hourlyRate?: number | string | null;
    rating?: number | null;
    completedJobs?: number | null;
    totalIncome?: number | string | null;
    onTimeRate?: number | null;
    categories?: { category?: { id: string; name: string } }[];
  } | null;
  clientProfile?: {
    companyName?: string | null;
    companySize?: string | null;
    industry?: string | null;
    location?: string | null;
    tagline?: string | null;
  } | null;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  role?: "CLIENT" | "FREELANCER";
  categories?: string[];
}) {
  const res = await apiFetch<{ user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.user;
}

export async function login(payload: { email: string; password: string }) {
  const res = await apiFetch<{ user: AuthUser; accessToken: string; refreshToken: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  setTokens(res.accessToken, res.refreshToken);
  setStoredUser(res.user);
  return res;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }
  clearTokens();
}

export async function getMe() {
  const token = getAccessToken();
  if (!token) return null;
  const res = await apiFetch<{ user: AuthUser }>("/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  setStoredUser(res.user);
  return res.user;
}
