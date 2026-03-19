'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, CheckCircle2, Lock, Mail, Tag, User, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/services/api";
import { categories } from "@/data/categories";
import { CategoryIcon } from "@/components/categories/CategoryIcon";

const MIN_PASSWORD = 6;
type Role = "CLIENT" | "FREELANCER";

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<Role>("CLIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { push } = useToast();
  const { register, login } = useAuth();
  const router = useRouter();

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD;
  const passwordMismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      push({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập họ và tên.",
        variant: "error",
      });
      return;
    }

    if (!email.trim()) {
      push({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập email.",
        variant: "error",
      });
      return;
    }

    if (password.length < MIN_PASSWORD) {
      push({
        title: "Mật khẩu quá ngắn",
        description: `Mật khẩu phải có ít nhất ${MIN_PASSWORD} ký tự.`,
        variant: "error",
      });
      return;
    }

    if (password !== confirm) {
      push({
        title: "Mật khẩu không khớp",
        description: "Vui lòng kiểm tra lại mật khẩu xác nhận.",
        variant: "error",
      });
      return;
    }

    if (role === "FREELANCER" && selectedCategories.length === 0) {
      push({
        title: "Thiếu ngành nghề",
        description: "Vui lòng chọn ít nhất một ngành nghề phù hợp.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name, email, password, role, categories: selectedCategories });
      await login(email, password);
      push({
        title: "Đăng ký thành công",
        description: "Tài khoản đã được tạo.",
        variant: "success",
      });
      router.push("/onboarding");
    } catch (err: any) {
      if (err instanceof ApiError && err.details?.fieldErrors) {
        const msg = err.details.fieldErrors.password?.[0];
        if (msg) {
          push({
            title: "Lỗi mật khẩu",
            description: msg,
            variant: "error",
          });
          return;
        }
      }
      push({
        title: "Đăng ký thất bại",
        description: err?.message || "Không thể tạo tài khoản.",
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
        <div className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
          Tạo tài khoản
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Đăng ký tài khoản mới</h1>
        <p className="text-sm text-slate-500">
          Điền thông tin bên dưới để bắt đầu. Bạn có thể đổi vai trò bất cứ lúc nào.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Bạn tham gia với vai trò nào?</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={`group relative rounded-2xl border p-3 text-left transition-all ${
                role === "CLIENT"
                  ? "border-sky-400 bg-gradient-to-br from-sky-50 to-white shadow-sm shadow-sky-100"
                  : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40"
              }`}
            >
              {role === "CLIENT" && (
                <CheckCircle2 className="absolute right-2.5 top-2.5 h-4 w-4 text-sky-600" />
              )}
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className={`h-4 w-4 ${role === "CLIENT" ? "text-sky-700" : "text-slate-500"}`} />
                <p className="text-sm font-semibold text-slate-900">Nhà tuyển dụng</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Đăng tin, nhận đề xuất và thuê freelancer phù hợp.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole("FREELANCER")}
              className={`group relative rounded-2xl border p-3 text-left transition-all ${
                role === "FREELANCER"
                  ? "border-sky-400 bg-gradient-to-br from-sky-50 to-white shadow-sm shadow-sky-100"
                  : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40"
              }`}
            >
              {role === "FREELANCER" && (
                <CheckCircle2 className="absolute right-2.5 top-2.5 h-4 w-4 text-sky-600" />
              )}
              <div className="flex items-center gap-2">
                <UserRoundSearch className={`h-4 w-4 ${role === "FREELANCER" ? "text-sky-700" : "text-slate-500"}`} />
                <p className="text-sm font-semibold text-slate-900">Freelancer</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Tìm job, gửi đề xuất và làm việc theo hợp đồng.
              </p>
            </button>
          </div>
        </div>

        {role === "FREELANCER" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Tag className="h-4 w-4 text-sky-600" />
              Chọn ngành nghề chính (có thể chọn nhiều)
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = selectedCategories.includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(cat.name)
                          ? prev.filter((x) => x !== cat.name)
                          : [...prev, cat.name]
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Ngành nghề sẽ hiển thị trên hồ sơ và dùng để lọc ở ranking/gamification.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Họ và tên</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 shadow-sm transition-colors focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
            <User className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>

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
          <div
            className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 shadow-sm transition-colors focus-within:ring-2 ${
              passwordTooShort
                ? "border-rose-300 focus-within:border-rose-400 focus-within:bg-white focus-within:ring-rose-100"
                : "border-slate-300 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-sky-100"
            }`}
          >
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
          <p className={`text-xs ${passwordTooShort ? "text-rose-500" : "text-slate-400"}`}>
            Mật khẩu tối thiểu {MIN_PASSWORD} ký tự.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
          <div
            className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 shadow-sm transition-colors focus-within:ring-2 ${
              passwordMismatch
                ? "border-rose-300 focus-within:border-rose-400 focus-within:bg-white focus-within:ring-rose-100"
                : "border-slate-300 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-sky-100"
            }`}
          >
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
          {passwordMismatch && <p className="text-xs text-rose-500">Mật khẩu xác nhận không khớp.</p>}
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        className="mt-6 h-12 rounded-xl text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
      </Button>

      <p className="mt-4 text-center text-xs text-slate-500 sm:text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
