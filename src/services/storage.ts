export const storageKeys = {
  accessToken: "jobfinder_access_token",
  refreshToken: "jobfinder_refresh_token",
  user: "jobfinder_user",
};

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(storageKeys.accessToken);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(storageKeys.refreshToken);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKeys.accessToken, accessToken);
  if (refreshToken) {
    window.localStorage.setItem(storageKeys.refreshToken, refreshToken);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKeys.accessToken);
  window.localStorage.removeItem(storageKeys.refreshToken);
  window.localStorage.removeItem(storageKeys.user);
}

export function setStoredUser(user: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKeys.user, JSON.stringify(user));
}

export function getStoredUser<T>() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKeys.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
