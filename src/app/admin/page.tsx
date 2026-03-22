"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, Building2, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { fetchAdminStats } from "@/services/admin";
import type { AdminStats } from "@/services/admin";

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800/40 bg-[#09090B] p-6 shadow-sm shadow-zinc-950/50 transition-all duration-300 ease-out hover:bg-[#0A0A0C] hover:border-zinc-700/50 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">{label}</p>
          <p className="mt-2.5 text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {value}
          </p>
          {hint && <p className="mt-2 text-xs text-zinc-500 font-medium tracking-wide">{hint}</p>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-zinc-900/80 text-zinc-300 ring-1 ring-zinc-800/60 shadow-inner group-hover:bg-zinc-800 group-hover:text-indigo-400 transition-all duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAdminStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Tổng quan"
        subtitle="Dashboard quản trị (đã kết nối API)."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Việc làm"
          value={`${loading ? 0 : stats?.totalJobs || 0}`}
          hint="Tin đăng trong hệ thống"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          label="Người dùng"
          value={`${loading ? 0 : stats?.totalUsers || 0}`}
          hint="Tổng người dùng (Client/Freelancer)"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Hợp đồng đang chạy"
          value={`${loading ? 0 : stats?.activeContracts || 0}`}
          hint="Hợp đồng trạng thái ACTIVE"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          label="Doanh thu Nền tảng"
          value={`${loading ? 0 : (stats?.totalRevenue || 0).toLocaleString()} VNĐ`}
          hint="Từ phí dịch vụ (Service Fee)"
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>

      <div className="mt-10 rounded-[2rem] border border-zinc-800/40 bg-gradient-to-br from-[#0A0A0C] to-[#050505] p-12 text-center shadow-lg shadow-black/20 min-h-[350px] flex items-center justify-center flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        
        <div className="h-20 w-20 bg-zinc-900/80 text-indigo-400 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/5 shadow-2xl shadow-black/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
           <Users className="h-10 w-10" />
        </div>
        <h3 className="text-3xl font-extrabold tracking-tight text-white mb-4 drop-shadow-sm">Welcome to JobFinder Core</h3>
        <p className="text-zinc-400 max-w-lg mx-auto text-[15px] tracking-wide leading-relaxed">
           System overview and control center. Manage the global user base, moderate live job postings, and review decentralized transactions in one secure place.
        </p>
        <div className="mt-10 flex gap-4 justify-center relative z-10 w-full max-w-md mx-auto">
            <Link href="/admin/users" className="flex-1">
               <button className="w-full flex items-center justify-center bg-white text-black font-semibold tracking-wide py-2.5 rounded-xl hover:bg-zinc-200 transition-colors shadow-sm">
                 Manage Users
               </button>
            </Link>
            <Link href="/admin/finance" className="flex-1">
               <button className="w-full flex items-center justify-center bg-zinc-900 text-zinc-300 font-semibold tracking-wide py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
                 View Finances
               </button>
            </Link>
        </div>
      </div>
    </div>
  );
}
