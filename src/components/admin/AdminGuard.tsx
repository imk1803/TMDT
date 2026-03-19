"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 text-slate-900">
        <p className="text-sm text-slate-500">Đang tải phiên đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4 text-slate-900">
        <div className="w-full max-w-sm rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100 backdrop-blur">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Yêu cầu đăng nhập</p>
              <p className="text-xs text-slate-500">Vui lòng đăng nhập tài khoản Admin.</p>
            </div>
          </div>
          <Link href="/login">
            <Button fullWidth size="lg">Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4 text-slate-900">
        <div className="w-full max-w-sm rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100 backdrop-blur">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Không đủ quyền</p>
              <p className="text-xs text-slate-500">Tài khoản của bạn không có quyền Admin.</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="secondary" fullWidth size="lg">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
