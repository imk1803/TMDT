import Image from "next/image";
import { Medal, Star } from "lucide-react";
import type { Freelancer } from "@/types/freelancer";
import {
  getAchievementBadges,
  getCommissionBenefitByOverallRank,
  getIndustryBadgeByCategoryRank,
  getRankTrendInfo,
} from "@/lib/ranking";
import { cn } from "@/lib/utils";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " VNĐ";
}

function medalStyle(rank: 1 | 2 | 3) {
  if (rank === 1)
    return {
      ring: "ring-amber-200",
      bg: "from-amber-200 via-amber-50 to-white",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      icon: "text-amber-600",
      label: "Top 1",
    };
  if (rank === 2)
    return {
      ring: "ring-slate-200",
      bg: "from-slate-200 via-white to-white",
      badge: "bg-slate-100 text-slate-800 border-slate-200",
      icon: "text-slate-600",
      label: "Top 2",
    };
  return {
    ring: "ring-orange-200",
    bg: "from-orange-200 via-orange-50 to-white",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "text-orange-600",
    label: "Top 3",
  };
}

interface TopThreeCardProps {
  freelancer: Freelancer;
  rank: 1 | 2 | 3;
  mode: "overall" | "category";
}

export function TopThreeCard({ freelancer, rank, mode }: TopThreeCardProps) {
  const s = medalStyle(rank);
  const benefit = mode === "overall" ? getCommissionBenefitByOverallRank(rank) : "";
  const badge =
    mode === "category" ? getIndustryBadgeByCategoryRank(rank) : "";
  const trend = getRankTrendInfo(
    freelancer.previousQuarterRank,
    freelancer.currentRank
  );
  const badges = getAchievementBadges(freelancer);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br p-5 shadow-xl shadow-sky-100 transition-all hover:-translate-y-0.5 hover:shadow-2xl sm:p-6",
        s.bg
      )}
    >
      <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-gradient-to-tr from-sky-200 to-teal-200 opacity-30 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("relative h-14 w-14 overflow-hidden rounded-2xl ring-4", s.ring)}>
            <Image
              src={freelancer.avatar}
              alt={freelancer.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">
              {freelancer.name}
            </p>
            <p className="text-sm font-medium text-sky-700">
              {freelancer.category}
            </p>
          </div>
        </div>

        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", s.badge)}>
          <Medal className={cn("h-4 w-4", s.icon)} />
          {s.label}
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-sky-100 bg-white/70 p-3">
          <p className="text-xs font-semibold text-slate-600">Hoàn thành</p>
          <p className="mt-0.5 text-base font-semibold text-slate-900">
            {freelancer.completedJobs} job
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-white/70 p-3">
          <p className="text-xs font-semibold text-slate-600">Thu nhập</p>
          <p className="mt-0.5 text-base font-semibold text-slate-900">
            {formatVnd(freelancer.totalIncome)}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-white/70 p-3">
          <p className="text-xs font-semibold text-slate-600">Rating</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-base font-semibold text-slate-900">
            <Star className="h-4 w-4 text-amber-500" />
            {freelancer.rating.toFixed(1)}/5
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-white/70 p-3">
          <p className="text-xs font-semibold text-slate-600">Đúng hạn</p>
          <p className="mt-0.5 text-base font-semibold text-slate-900">
            {freelancer.onTimeRate}%
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-col gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              trend.type === "up" && "bg-emerald-50 text-emerald-700",
              trend.type === "down" && "bg-rose-50 text-rose-700",
              trend.type === "new" && "bg-sky-50 text-sky-700",
              trend.type === "same" && "bg-slate-50 text-slate-700",
              trend.type === "unknown" && "bg-slate-50 text-slate-500"
            )}
          >
            {trend.label}
          </span>
          <span className="text-xs font-medium text-slate-500">
            Score: {freelancer.rankingScore?.toFixed(2) ?? "—"}
          </span>
        </div>
        {/* Hàng 1: ưu đãi hoặc badge ngành */}
        <div className="flex min-h-[28px] flex-wrap items-center gap-2">
          {mode === "overall" && benefit && (
            <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
              Ưu đãi: {benefit}
            </span>
          )}
          {mode === "category" && badge && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              Thành tích: {badge}
            </span>
          )}
        </div>
        {/* Hàng 2: badge thành tích cá nhân */}
        <div className="flex min-h-[28px] flex-wrap items-center gap-2">
          {badges.slice(0, 2).map((b) => (
            <span
              key={b}
              className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
