'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/services/api";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { push } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      push({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập email.",
        variant: "error",
      });
      return;
    }
    if (!password.trim()) {
      push({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mật khẩu.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      push({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay lại.",
        variant: "success",
      });
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        push({
          title: "Sai thông tin đăng nhập",
          description: "Email hoặc mật khẩu không đúng.",
          variant: "error",
        });
        return;
      }
      push({
        title: "Đăng nhập thất bại",
        description: err?.message || "Không thể đăng nhập.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-[2rem] border border-sky-100/80 bg-white p-6 shadow-[0_20px_70px_-30px_rgba(2,132,199,0.45)] sm:p-8"
    >
      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Bảo mật tài khoản</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Đăng nhập tài khoản</h1>
        <p className="text-sm text-slate-500">
          Truy cập vào JobFinder để quản lý công việc, hồ sơ và đề xuất của bạn.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 shadow-sm transition-colors focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 shadow-sm transition-colors focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 sm:text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>
        <button type="button" className="font-medium text-sky-600 hover:text-sky-700">
          Quên mật khẩu?
        </button>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        className="mt-6 h-12 rounded-xl text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
      </Button>

      <p className="mt-4 text-center text-xs text-slate-500 sm:text-sm">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-700">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}

