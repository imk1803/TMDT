import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export interface GamificationHistoryItem {
  id: string;
  points: number;
  reason: string;
  source: string;
  createdAt: string;
}

export interface GamificationData {
  points: number;
  level: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  badges: string[];
  lastDailyLoginAt?: string | null;
  currentStreak?: number | null;
  longestStreak?: number | null;
  dailyPoints?: number | null;
  dailyPointsDate?: string | null;
}

export interface GamificationResponse {
  gamification: GamificationData;
  levelRules: { level: string; minPoints: number }[];
  limits?: { dailyPointsCap?: number };
  history: GamificationHistoryItem[];
}

export async function fetchMyGamification() {
  const token = getAccessToken();
  return apiFetch<GamificationResponse>("/api/users/me/gamification", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
