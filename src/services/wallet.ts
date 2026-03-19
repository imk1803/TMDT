import { apiFetch } from "./api";
import { getAccessToken } from "./storage";

export interface WalletData {
  id: string;
  userId: string;
  availableBalance: number | string;
  heldBalance: number | string;
}

export interface WalletTransaction {
  id: string;
  amount: number | string;
  type: "DEBIT" | "CREDIT";
  description?: string | null;
  balanceAfter?: number | string | null;
  createdAt: string;
}

export interface WalletUpdatedDetail {
  availableBalance?: number;
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function emitWalletUpdated(detail?: WalletUpdatedDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<WalletUpdatedDetail>("wallet:updated", { detail }));
}

export async function fetchMyWallet() {
  return apiFetch<{ wallet: WalletData; transactions: WalletTransaction[] }>("/api/wallet", {
    headers: authHeaders(),
  });
}

export async function topUpWallet(amount: number, method?: string) {
  const res = await apiFetch<{ wallet: WalletData; transaction: WalletTransaction }>("/api/wallet/topup", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amount, method }),
  });
  emitWalletUpdated({ availableBalance: Number(res.wallet?.availableBalance ?? 0) });
  return res;
}

export async function withdrawWallet(amount: number, method?: string) {
  const res = await apiFetch<{ wallet: WalletData; transaction: WalletTransaction }>("/api/wallet/withdraw", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amount, method }),
  });
  emitWalletUpdated({ availableBalance: Number(res.wallet?.availableBalance ?? 0) });
  return res;
}
