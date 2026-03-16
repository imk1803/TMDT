'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LogIn, Menu, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/jobs", label: "Tìm việc" },
  { href: "/ranking", label: "Xếp hạng" },
  { href: "/companies", label: "Công ty", disabled: true },
  { href: "/about", label: "Giới thiệu", disabled: true },
  { href: "/admin", label: "Admin", disabled: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white shadow-lg shadow-sky-100">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">
              JobFinder
            </span>
            <span className="text-[11px] font-medium text-sky-500">
              Nền tảng tuyển dụng hiện đại
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "relative transition-colors hover:text-sky-600",
                item.disabled && "cursor-not-allowed opacity-60",
                isActive(item.href) && "text-sky-600"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-sky-500 to-teal-400" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <LogIn className="h-4 w-4" />
              <span>Đăng nhập</span>
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              <span>Đăng ký</span>
            </Button>
          </Link>
        </div>

        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-slate-700 shadow-sm hover:bg-sky-50 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </Container>

      {open && (
        <div className="border-b border-sky-100 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-sky-50",
                  item.disabled && "cursor-not-allowed opacity-60",
                  isActive(item.href) && "text-sky-600"
                )}
                onClick={() => !item.disabled && setOpen(false)}
              >
                <span>{item.label}</span>
                {isActive(item.href) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                )}
              </Link>
            ))}
            <div className="mt-1 flex gap-2 border-t border-sky-50 pt-2">
              <Link href="/login" className="flex-1">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  className="gap-1.5"
                  onClick={() => setOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button size="sm" fullWidth className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  <span>Đăng ký</span>
                </Button>
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

