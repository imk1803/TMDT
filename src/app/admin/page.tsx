"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, Building2, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { fetchJobs } from "@/services/jobs";
import { fetchCompanies } from "@/services/companies";
import { fetchFreelancers } from "@/services/freelancers";
import { getEligibleRanked } from "@/lib/ranking";
import type { Job } from "@/types/job";
import type { Company } from "@/types/company";
import type { Freelancer } from "@/types/freelancer";

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
    <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500/10 to-teal-500/10 text-sky-600 ring-1 ring-sky-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [j, c, f] = await Promise.all([
          fetchJobs(),
          fetchCompanies(),
          fetchFreelancers(),
        ]);
        if (!cancelled) {
          setJobs(j);
          setCompanies(c);
          setFreelancers(f);
        }
      } catch {
        if (!cancelled) {
          setJobs([]);
          setCompanies([]);
          setFreelancers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const eligible = useMemo(() => getEligibleRanked(freelancers), [freelancers]);

  return (
    <div>
      <AdminPageHeader
        title="Tổng quan"
        subtitle="Dashboard quản trị (đã kết nối API)."
        actions={
          <>
            <Link href="/admin/jobs">
              <Button size="sm">Quản lý việc làm</Button>
            </Link>
            <Link href="/admin/companies">
              <Button variant="secondary" size="sm">
                Quản lý công ty
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Việc làm"
          value={`${loading ? 0 : jobs.length}`}
          hint="Tin đăng trong hệ thống"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          label="Công ty"
          value={`${loading ? 0 : companies.length}`}
          hint="Doanh nghiệp nổi bật"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          label="Freelancers"
          value={`${loading ? 0 : freelancers.length}`}
          hint="Hồ sơ freelancer"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Đủ điều kiện BXH"
          value={`${loading ? 0 : eligible.length}`}
          hint="Theo tiêu chí trong lib/ranking"
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
          <p className="text-sm font-semibold text-slate-900">
            Việc làm gần đây
          </p>
          <div className="mt-3 space-y-2">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-900">
                  {job.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {job.companyName} · {job.location} · {job.workMode}
                </p>
              </div>
            ))}
            {!loading && jobs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Chưa có dữ liệu việc làm.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
          <p className="text-sm font-semibold text-slate-900">
            Top freelancers
          </p>
          <div className="mt-3 space-y-2">
            {eligible.slice(0, 5).map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {f.currentRank}. {f.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {f.category} · Rating {f.rating} · Đúng hạn {f.onTimeRate}%
                  </p>
                </div>
                <p className="text-xs font-semibold text-indigo-600">
                  {f.rankingScore?.toFixed(2)}
                </p>
              </div>
            ))}
            {!loading && eligible.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Chưa có freelancer đủ điều kiện theo tiêu chí hiện tại.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
