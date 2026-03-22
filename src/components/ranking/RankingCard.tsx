import Image from "next/image";
import { Award, Bolt, Paintbrush2, Star, Timer, Wand2 } from "lucide-react";
import type { Freelancer } from "@/types/freelancer";
import {
  getAchievementBadges,
  getCommissionBenefitByOverallRank,
  getIndustryBadgeByCategoryRank,
  getRankTrendInfo,
} from "@/lib/ranking";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { getCategoryBadge } from "@/lib/categoryBadge";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " VNĐ";
}

interface RankingCardProps {
  freelancer: Freelancer;
  rank: number;
}

export function RankingCard({
  freelancer,
  rank,
  mode,
}: RankingCardProps & { mode: "overall" | "category" }) {
  const benefit =
    mode === "overall" ? getCommissionBenefitByOverallRank(rank) : "";
  const badge =
    mode === "category" ? getIndustryBadgeByCategoryRank(rank) : "";
  const trend = getRankTrendInfo(
    freelancer.previousQuarterRank,
    freelancer.currentRank
  );
  const badges = getAchievementBadges(freelancer);
  const categoryBadge = getCategoryBadge(freelancer.category);
  const badgeMeta: Record<
    string,
    { icon: JSX.Element; className: string }
  > = {
    "Design Hero": {
      icon: <Paintbrush2 className="h-3.5 w-3.5" />,
      className: "bg-pink-50 text-pink-700",
    },
    "IT Hero": {
      icon: <Bolt className="h-3.5 w-3.5" />,
      className: "bg-indigo-50 text-indigo-700",
    },
    "Marketing Hero": {
      icon: <Wand2 className="h-3.5 w-3.5" />,
      className: "bg-amber-50 text-amber-700",
    },
    "Content Hero": {
      icon: <Star className="h-3.5 w-3.5" />,
      className: "bg-emerald-50 text-emerald-700",
    },
    "Top Performer": {
      icon: <Award className="h-3.5 w-3.5" />,
      className: "bg-sky-50 text-sky-700",
    },
    "Fast Responder": {
      icon: <Star className="h-3.5 w-3.5" />,
      className: "bg-slate-100 text-slate-700",
    },
  };

  return (
    <article className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-12 sm:items-center sm:gap-4">
        {/* Left: rank + avatar + name */}
        <div className="flex items-center gap-4 sm:col-span-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-sky-50 text-sm font-semibold text-sky-700">
            #{rank}
          </div>
          <div className="relative h-12 w-12 flex-none overflow-hidden rounded-2xl ring-2 ring-sky-100">
            <Image
              src={freelancer.avatar}
              alt={freelancer.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {freelancer.name}
            </p>
            <span
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryBadge.className}`}
            >
              <CategoryIcon name={categoryBadge.icon} className="h-3.5 w-3.5" />
              {freelancer.category}
            </span>
          </div>
        </div>

        {/* Middle stats */}
        <div className="grid grid-cols-2 gap-3 text-sm sm:col-span-5 sm:grid-cols-4 sm:gap-4">
          <div className="sm:text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Jobs
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {freelancer.completedJobs}
            </p>
          </div>
          <div className="sm:text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Thu nhập
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatVnd(freelancer.totalIncome)}
            </p>
          </div>
          <div className="sm:text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Rating
            </p>
            <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-900 sm:justify-center">
              <Star className="h-4 w-4 text-amber-500" />
              {freelancer.rating.toFixed(1)}
            </p>
          </div>
          <div className="sm:text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Đúng hạn
            </p>
            <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-900 sm:justify-center">
              <Timer className="h-4 w-4 text-sky-500" />
              {Math.round(freelancer.onTimeRate)}%
            </p>
          </div>
        </div>

        {/* Right: trend + benefit / badge / badges */}
        <div className="flex flex-col items-end gap-1.5 text-xs sm:col-span-4">
          <span
            className={
              trend.type === "up"
                ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700"
                : trend.type === "down"
                ? "inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-700"
                : trend.type === "new"
                ? "inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700"
                : trend.type === "same"
                ? "inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 font-medium text-slate-700"
                : "inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 font-medium text-slate-500"
            }
          >
            {trend.label}
          </span>
          {/* Hàng 1: ưu đãi hoặc badge ngành (1 pill cố định vị trí) */}
          <div className="flex min-h-[28px] items-center justify-end gap-1.5">
            {mode === "overall" && benefit && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                {benefit}
              </span>
            )}
            {mode === "category" && badge && (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
                {badge}
              </span>
            )}
          </div>
          {/* Hàng 2: badge thành tích cá nhân */}
          <div className="flex min-h-[28px] flex-wrap justify-end gap-1.5">
            {badges.slice(0, 2).map((b) => {
              const meta = badgeMeta[b] || {
                icon: <Award className="h-3.5 w-3.5" />,
                className: "bg-slate-100 text-slate-700",
              };
              return (
                <span
                  key={b}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${meta.className}`}
                >
                  {meta.icon}
                  {b}
                </span>
              );
            })}
          </div>
          <span className="mt-0.5 text-[11px] font-medium text-slate-500">
            Score: {freelancer.rankingScore?.toFixed(2) ?? "—"}
          </span>
        </div>
      </div>
    </article>
  );
}
