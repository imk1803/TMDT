'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Đăng ký demo thành công! (chưa kết nối backend)");
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-xl shadow-sky-100 backdrop-blur sm:p-7"
    >
      <div className="mb-5 space-y-1.5 text-center">
        <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
          Tạo tài khoản mới
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm">
          Đăng ký để lưu hồ sơ và ứng tuyển nhanh trong vài giây.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Họ và tên
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <User className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Mật khẩu
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              required
              className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Xác nhận mật khẩu
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              required
              className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        className="mt-5"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
      </Button>

      <p className="mt-4 text-center text-xs text-slate-500 sm:text-sm">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-medium text-sky-600 hover:text-sky-700"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

