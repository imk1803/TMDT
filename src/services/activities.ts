import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export interface Activity {
  id: string;
  contractId: string;
  userId: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function fetchActivities(contractId: string): Promise<{ activities: Activity[] }> {
  const token = getAccessToken();
  return apiFetch<{ activities: Activity[] }>(`/api/activities/${contractId}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
