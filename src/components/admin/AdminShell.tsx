"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, Briefcase, FileText, Settings, Shield,
  LogOut, LayoutDashboard, DollarSign, Trophy, FolderOpen,
  Bell, Search, Menu, Activity, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/contracts", label: "Contracts", icon: FileText },
  { href: "/admin/finance", label: "Finance Analytics", icon: Activity },
  { href: "/admin/finances", label: "Transactions", icon: DollarSign },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/resources", label: "Resources", icon: FolderOpen },
  { href: "/admin/support", label: "Support & Disputes", icon: ShieldAlert },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { push } = useToast();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-indigo-500/30">
      <div className="mx-auto flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden w-[280px] flex-col border-r border-zinc-800/40 bg-[#09090b] py-8 px-5 md:flex">
          <div className="flex items-center gap-3.5 px-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-zinc-100 to-zinc-300 text-black shadow-sm ring-1 ring-white/20">
              <Shield className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight text-white">JobFinder</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold mt-0.5">Admin Console</p>
            </div>
          </div>

          <nav className="mt-8 flex-1 space-y-1">
            {nav.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
                    active
                      ? "bg-zinc-800/70 text-white shadow-sm ring-1 ring-white/5"
                      : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-100"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors duration-300", active ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400")} />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-800/40">
            <button
              onClick={() => {
                logout();
                push({ title: "Logged out", description: "Đã đăng xuất.", variant: "info" });
              }}
              className="flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-300 ease-out hover:bg-zinc-800/30 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="tracking-wide">Log out</span>
            </button>
            <div className="mt-4 px-3.5 flex items-center gap-3">
               <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 ring-1 ring-indigo-500/30 flex items-center justify-center shadow-inner">
                  <span className="text-sm font-bold text-indigo-300">A</span>
               </div>
               <div>
                  <p className="text-sm font-semibold tracking-tight text-white">Admin User</p>
                  <p className="text-[11px] text-zinc-500 tracking-wide">admin@system.io</p>
               </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#050505]">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-zinc-800/40 bg-[#050505]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/50">
            <div className="flex h-16 items-center justify-between gap-4 px-6 sm:px-10">
              <div className="flex flex-1 items-center gap-4">
                 <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input 
                       type="text" 
                       placeholder="Search resources, users, or settings..." 
                       className="h-10 w-full rounded-2xl border border-zinc-800/60 bg-[#0A0A0A] pl-11 pr-4 text-sm tracking-wide text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300 ease-out shadow-sm"
                    />
                 </div>
              </div>
              <div className="flex items-center gap-5">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-all duration-300">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-[#050505]"></span>
                </button>
                <div className="h-6 w-px bg-zinc-800/60 hidden sm:block"></div>
                <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-400 hover:text-white transition-all duration-300 bg-zinc-900/40 hover:bg-zinc-800/60 px-4 py-2 rounded-2xl ring-1 ring-zinc-800/50 hover:ring-zinc-700 hidden sm:block">
                  Exit to App
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-10 sm:px-10 overflow-y-auto">
             <div className="mx-auto max-w-7xl">
                {children}
             </div>
          </main>
        </div>
      </div>
    </div>
  );
}
