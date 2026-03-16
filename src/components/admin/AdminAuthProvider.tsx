'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "jobfinder_admin_demo_token";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(STORAGE_KEY);
    const hasToken = Boolean(token);
    // Thực hiện trong transition để tránh cảnh báo về setState trong effect
    startTransition(() => {
      setIsAuthenticated(hasToken);
      setHydrated(true);
    });
  }, []);

  const login = useCallback(async (password: string) => {
    // Demo only: mật khẩu cố định "admin123"
    const ok = password === "admin123";
    if (ok && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setIsAuthenticated(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setIsAuthenticated(false);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 text-slate-900">
        <p className="text-sm text-slate-500">Đang tải phiên quản trị...</p>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}

