'use client';

import type { ReactNode, FormEvent } from "react";
import { useState } from "react";
import { Lock, Shield } from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { Button } from "@/components/ui/Button";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, login } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await login(password);
    setLoading(false);
    if (!ok) {
      setError("Mật khẩu không đúng. Gợi ý: admin123 (demo).");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4 text-slate-900">
      <div className="w-full max-w-sm rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100 backdrop-blur">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Đăng nhập khu vực Admin
            </p>
            <p className="text-xs text-slate-500">
              Chế độ demo, chưa kết nối hệ thống auth thật.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Mật khẩu demo
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Nhập mật khẩu admin demo..."
              />
            </div>
            <p className="text-xs text-slate-500">
              Gợi ý cho đồ án: sử dụng JWT hoặc session, phân quyền role theo
              bảng `users`/`roles`.
            </p>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-400">{error}</p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={loading || !password}
            className="mt-2"
          >
            {loading ? "Đang kiểm tra..." : "Đăng nhập Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}

