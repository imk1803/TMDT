"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { RankingHeader } from "@/components/ranking/RankingHeader";
import { RankingStats } from "@/components/ranking/RankingStats";
import { TopThreeCard } from "@/components/ranking/TopThreeCard";
import { RankingCard } from "@/components/ranking/RankingCard";
import { CriteriaSection } from "@/components/ranking/CriteriaSection";
import { BenefitSection } from "@/components/ranking/BenefitSection";
import { RankingFilters } from "@/components/ranking/RankingFilters";
import { QuarterHighlightsSection } from "@/components/ranking/QuarterHighlights";
import { useToast } from "@/components/ui/Toast";
import {
  getCurrentQuarterLabel,
  getQuarterHighlights,
  getTopNByCategory,
} from "@/lib/ranking";
import type { Freelancer, FreelancerCategory } from "@/types/freelancer";
import { fetchLeaderboard, type LeaderboardEntry } from "@/services/leaderboard";
import { categories as categoryData } from "@/data/categories";
import { CategoryIcon } from "@/components/categories/CategoryIcon";

const FALLBACK_AVATAR = "https://i.pravatar.cc/150?img=10";

function normalizeCategory(title?: string | null): FreelancerCategory {
  const normalized = (title || "").toLowerCase();

  if (
    normalized.includes("kế toán") ||
    normalized.includes("ke toan") ||
    normalized.includes("account")
  ) {
    return "Tài chính & Kế toán";
  }
  if (
    normalized.includes("thiết kế") ||
    normalized.includes("thiet ke") ||
    normalized.includes("design")
  ) {
    return "Thiết kế & Sáng tạo";
  }
  if (normalized.includes("marketing")) {
    return "Marketing & Truyền thông";
  }
  if (
    normalized.includes("viết") ||
    normalized.includes("viet") ||
    normalized.includes("content") ||
    normalized.includes("copy")
  ) {
    return "Viết lách & Nội dung";
  }

  return "Công nghệ thông tin";
}

function mapToFreelancers(entries: LeaderboardEntry[]): Freelancer[] {
  return entries.map((entry) => ({
    id: entry.user.id,
    name: entry.user.name,
    avatar: entry.user.avatarUrl || FALLBACK_AVATAR,
    category: normalizeCategory(entry.user.categories?.[0] || entry.user.title),
    completedJobs: entry.stats.total_completed_jobs,
    totalIncome: entry.stats.total_earnings,
    rating: entry.stats.average_rating,
    onTimeRate: entry.stats.on_time_rate,
    rankingScore: entry.score,
    currentRank: entry.rank,
  }));
}

export default function RankingPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<FreelancerCategory | "Tất cả">("Tất cả");
  const [allFreelancers, setAllFreelancers] = useState<Freelancer[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      try {
        const entries = await fetchLeaderboard();
        if (!cancelled) {
          setAllFreelancers(mapToFreelancers(entries));
        }
      } catch (error: any) {
        if (!cancelled) {
          setAllFreelancers([]);
          push({
            title: "Không tải được bảng xếp hạng",
            description: error?.message || "Vui lòng thử lại.",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [push]);

  const ranked = useMemo(
    () => getTopNByCategory(allFreelancers, category, 10),
    [allFreelancers, category]
  );

  const topThree = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const quarterLabel = getCurrentQuarterLabel();
  const highlights = getQuarterHighlights(ranked);

  const topIndustries = useMemo(() => {
    const map = new Map<string, { totalScore: number; count: number }>();
    allFreelancers.forEach((f) => {
      const key = f.category;
      const score = f.rankingScore ?? 0;
      const item = map.get(key) || { totalScore: 0, count: 0 };
      item.totalScore += score;
      item.count += 1;
      map.set(key, item);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        count: value.count,
        avgScore: value.count ? value.totalScore / value.count : 0,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 6);
  }, [allFreelancers]);

  const topIndustriesByRating = useMemo(() => {
    const map = new Map<string, { totalRating: number; count: number }>();
    allFreelancers.forEach((f) => {
      const key = f.category;
      const item = map.get(key) || { totalRating: 0, count: 0 };
      item.totalRating += f.rating;
      item.count += 1;
      map.set(key, item);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        count: value.count,
        avgRating: value.count ? value.totalRating / value.count : 0,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 6);
  }, [allFreelancers]);

  const topIndustriesByEarnings = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    allFreelancers.forEach((f) => {
      const key = f.category;
      const item = map.get(key) || { total: 0, count: 0 };
      item.total += f.totalIncome;
      item.count += 1;
      map.set(key, item);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        count: value.count,
        avgEarnings: value.count ? value.total / value.count : 0,
      }))
      .sort((a, b) => b.avgEarnings - a.avgEarnings)
      .slice(0, 6);
  }, [allFreelancers]);

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="space-y-6 sm:space-y-8">
          <RankingHeader quarterLabel={quarterLabel} />

          <div className="grid gap-4 lg:grid-cols-2">
            <CriteriaSection />
            <BenefitSection />
          </div>

          <RankingFilters value={category} onChange={setCategory} />

          <RankingStats
            category={category}
            allFreelancers={allFreelancers}
            eligibleRanked={ranked}
          />

          <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                  Top ngành nghề nổi bật
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm">
                  So sánh theo các tiêu chí khác nhau: điểm, rating, thu nhập.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Điểm trung bình
                </div>
                <div className="divide-y divide-slate-100 bg-white text-sm">
                  {topIndustries.map((item, index) => {
                    const cat = categoryData.find((c) => c.name === item.name);
                    return (
                    <div key={item.name} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700">
                          {index + 1}
                        </span>
                        {cat && <CategoryIcon name={cat.icon} className="h-4 w-4 text-sky-600" />}
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{item.avgScore.toFixed(2)}</span>
                    </div>
                  );})}
                  {topIndustries.length === 0 && (
                    <div className="px-4 py-4 text-center text-sm text-slate-500">
                      Chưa có dữ liệu.
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rating trung bình
                </div>
                <div className="divide-y divide-slate-100 bg-white text-sm">
                  {topIndustriesByRating.map((item, index) => {
                    const cat = categoryData.find((c) => c.name === item.name);
                    return (
                    <div key={item.name} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold text-amber-700">
                          {index + 1}
                        </span>
                        {cat && <CategoryIcon name={cat.icon} className="h-4 w-4 text-amber-600" />}
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{item.avgRating.toFixed(2)}</span>
                    </div>
                  );})}
                  {topIndustriesByRating.length === 0 && (
                    <div className="px-4 py-4 text-center text-sm text-slate-500">
                      Chưa có dữ liệu.
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Thu nhập trung bình
                </div>
                <div className="divide-y divide-slate-100 bg-white text-sm">
                  {topIndustriesByEarnings.map((item, index) => {
                    const cat = categoryData.find((c) => c.name === item.name);
                    return (
                    <div key={item.name} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                          {index + 1}
                        </span>
                        {cat && <CategoryIcon name={cat.icon} className="h-4 w-4 text-emerald-600" />}
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {item.avgEarnings.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  );})}
                  {topIndustriesByEarnings.length === 0 && (
                    <div className="px-4 py-4 text-center text-sm text-slate-500">
                      Chưa có dữ liệu.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-center text-sm text-slate-600">
              Đang tải bảng xếp hạng...
            </div>
          ) : ranked.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Chưa có freelancer nào đủ điều kiện trong nhóm hiện tại.
            </div>
          ) : (
            <>
              <section className="grid gap-4 lg:grid-cols-3">
                {topThree.map((freelancer, index) => (
                  <TopThreeCard
                    key={freelancer.id}
                    freelancer={freelancer}
                    rank={(index + 1) as 1 | 2 | 3}
                    mode={category === "Tất cả" ? "overall" : "category"}
                  />
                ))}
              </section>

              {rest.length > 0 && (
                <section className="space-y-3">
                  {rest.map((freelancer, index) => (
                    <RankingCard
                      key={freelancer.id}
                      freelancer={freelancer}
                      rank={index + 4}
                      mode={category === "Tất cả" ? "overall" : "category"}
                    />
                  ))}
                </section>
              )}
            </>
          )}

          <QuarterHighlightsSection data={highlights} />
        </div>
      </Container>
    </div>
  );
}
