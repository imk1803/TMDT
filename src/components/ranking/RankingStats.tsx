import { BarChart3, CheckCircle2, ShieldCheck, Star } from "lucide-react";
import type { FreelancerCategory } from "@/types/freelancer";
import type { Freelancer } from "@/types/freelancer";
import { RANKING_CRITERIA, isEligibleForQuarterRanking } from "@/lib/ranking";

function avg(list: number[]) {
  if (!list.length) return 0;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " VNĐ";
}

interface RankingStatsProps {
  category: FreelancerCategory | "Tất cả";
  allFreelancers: Freelancer[];
  eligibleRanked: Freelancer[];
}

export function RankingStats({
  category,
  allFreelancers,
  eligibleRanked,
}: RankingStatsProps) {
  const scopeAll =
    category === "Tất cả"
      ? allFreelancers
      : allFreelancers.filter((f) => f.category === category);
  const scopeEligible =
    category === "Tất cả"
      ? allFreelancers.filter(isEligibleForQuarterRanking)
      : scopeAll.filter(isEligibleForQuarterRanking);

  const avgRating = avg(scopeEligible.map((f) => f.rating));
  const avgOnTime = avg(scopeEligible.map((f) => f.onTimeRate));
  const avgIncome = avg(scopeEligible.map((f) => f.totalIncome));

  return (
    <section className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Đủ điều kiện
          </p>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {scopeEligible.length}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Trên tổng {scopeAll.length} freelancer trong nhóm
        </p>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Rating TB
          </p>
          <Star className="h-4 w-4 text-amber-500" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {avgRating ? avgRating.toFixed(2) : "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Chỉ tính freelancer đạt điều kiện
        </p>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Đúng hạn TB
          </p>
          <ShieldCheck className="h-4 w-4 text-sky-500" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {avgOnTime ? `${avgOnTime.toFixed(1)}%` : "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Tối thiểu {RANKING_CRITERIA.minOnTimeRate}% để được xét
        </p>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Thu nhập TB
          </p>
          <BarChart3 className="h-4 w-4 text-teal-500" />
        </div>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {avgIncome ? formatVnd(Math.round(avgIncome)) : "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Top hiện có: {eligibleRanked.length} người (tối đa 10)
        </p>
      </div>
    </section>
  );
}

