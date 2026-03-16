'use client';

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { freelancers } from "@/data/freelancers";
import type { FreelancerCategory } from "@/types/freelancer";
import {
  getCategoryTopN,
  getCurrentQuarterLabel,
  getQuarterHighlights,
  getOverallTopN,
} from "@/lib/ranking";
import { RankingHeader } from "@/components/ranking/RankingHeader";
import { RankingFilters } from "@/components/ranking/RankingFilters";
import { RankingStats } from "@/components/ranking/RankingStats";
import { CriteriaSection } from "@/components/ranking/CriteriaSection";
import { BenefitSection } from "@/components/ranking/BenefitSection";
import { TopThreeCard } from "@/components/ranking/TopThreeCard";
import { RankingCard } from "@/components/ranking/RankingCard";
import { QuarterHighlightsSection } from "@/components/ranking/QuarterHighlights";

export default function RankingPage() {
  const [category, setCategory] = useState<FreelancerCategory | "Tất cả">(
    "Tất cả"
  );

  const quarterLabel = useMemo(() => getCurrentQuarterLabel(), []);

  const overallTop = useMemo(() => getOverallTopN(freelancers, 10), []);
  const highlights = useMemo(
    () => getQuarterHighlights(freelancers),
    []
  );

  const rankedList = useMemo(() => {
    if (category === "Tất cả") return overallTop;
    return getCategoryTopN(freelancers, category, 10);
  }, [category, overallTop]);

  const top3 = rankedList.slice(0, 3);
  const rest = rankedList.slice(3);

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <RankingHeader quarterLabel={quarterLabel} />
        <RankingFilters value={category} onChange={setCategory} />

        <RankingStats
          category={category}
          allFreelancers={freelancers}
          eligibleRanked={rankedList}
        />

        <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-2">
          <CriteriaSection />
          <BenefitSection />
        </div>

        <div className="mt-6">
          <QuarterHighlightsSection data={highlights} />
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Top 10 theo quý{" "}
                <span className="text-sky-600">
                  {category === "Tất cả" ? "" : `• ${category}`}
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {category === "Tất cả"
                  ? "Top Freelancer quý này (bảng tổng), xếp hạng theo điểm tổng hợp (score) và áp dụng ưu đãi hoa hồng."
                  : "Top Freelancer theo ngành trong quý, xếp hạng theo score và gắn badge thành tích (không áp dụng ưu đãi hoa hồng)."}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 sm:text-sm">
              {rankedList.length ? (
                <span>
                  Hiển thị{" "}
                  <span className="font-semibold text-slate-800">
                    {rankedList.length}
                  </span>{" "}
                  người
                </span>
              ) : (
                <span>Chưa có freelancer đủ điều kiện</span>
              )}
            </div>
          </div>

          {rankedList.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-3">
              {top3.map((f, idx) => (
                <TopThreeCard
                  key={f.id}
                  freelancer={f}
                  rank={(idx + 1) as 1 | 2 | 3}
                  mode={category === "Tất cả" ? "overall" : "category"}
                />
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:mt-6">
            {rest.map((f, idx) => (
              <RankingCard
                key={f.id}
                freelancer={f}
                rank={idx + 4}
                mode={category === "Tất cả" ? "overall" : "category"}
              />
            ))}

            {rankedList.length === 0 && (
              <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
                <p className="font-semibold text-slate-900">
                  Chưa có freelancer đủ điều kiện trong nhóm này.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Hãy thử chọn ngành nghề khác hoặc xem lại điều kiện tham gia.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

