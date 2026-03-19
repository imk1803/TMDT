"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const nav = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Việc làm", icon: Search },
  { href: "/admin/companies", label: "Công ty", icon: Building2 },
  { href: "/admin/freelancers", label: "Freelancers", icon: Trophy },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { push } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-50 to-cyan-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        <aside className="hidden w-72 flex-col border-r border-sky-100 bg-white/90 p-5 backdrop-blur md:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">Admin</p>
              <p className="text-xs text-slate-500">JobFinder Console</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {nav.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700",
                    active &&
                      "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              fullWidth
              className="justify-start gap-2.5 text-slate-600 hover:bg-sky-50"
              onClick={() => {
                logout();
                push({
                  title: "Logged out",
                  description: "Đã đăng xuất.",
                  variant: "info",
                });
              }}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
            <p className="mt-3 text-xs text-slate-500">
              Dữ liệu đang lấy từ API backend.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  Bảng điều khiển quản trị
                </p>
                <p className="truncate text-xs text-slate-500">
                  Quản lý nội dung tuyển dụng, công ty và xếp hạng.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="secondary" size="sm">
                    Về trang người dùng
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
