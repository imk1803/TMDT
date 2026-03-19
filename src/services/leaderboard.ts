import { apiFetch } from "./api";

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    title?: string | null;
    categories?: string[];
  };
  score: number;
  stats: {
    total_completed_jobs: number;
    total_earnings: number;
    average_rating: number;
    on_time_rate: number;
  };
}

export async function fetchLeaderboard() {
  const res = await apiFetch<{ leaderboard: LeaderboardEntry[] }>("/api/leaderboard");
  return res.leaderboard || [];
}
