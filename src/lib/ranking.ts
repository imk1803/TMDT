import type { Freelancer, FreelancerCategory } from "@/types/freelancer";

export const RANKING_CRITERIA = {
  minCompletedJobs: 50,
  minTotalIncome: 40_000_000,
  minRating: 4.5,
  minOnTimeRate: 90,
} as const;

/**
 * rankingScore phản ánh hiệu suất tổng hợp:
 * - completedJobs: 30%
 * - totalIncome (quy về triệu VNĐ): 30%
 * - rating (0..5) nhân 20 để đưa về thang 0..100: 20%
 * - onTimeRate (0..100): 20%
 *
 * Công thức gợi ý:
 * score =
 * (completedJobs * 0.3) +
 * (totalIncome / 1_000_000 * 0.3) +
 * (rating * 20 * 0.2) +
 * (onTimeRate * 0.2)
 */
export function calculateRankingScore(f: Freelancer): number {
  const completedJobsPart = f.completedJobs * 0.3;
  const incomePart = (f.totalIncome / 1_000_000) * 0.3;
  const ratingPart = f.rating * 20 * 0.2;
  const onTimePart = f.onTimeRate * 0.2;
  return Number((completedJobsPart + incomePart + ratingPart + onTimePart).toFixed(2));
}

export function isEligibleForQuarterRanking(f: Freelancer): boolean {
  return (
    f.completedJobs >= RANKING_CRITERIA.minCompletedJobs &&
    f.totalIncome >= RANKING_CRITERIA.minTotalIncome &&
    f.rating >= RANKING_CRITERIA.minRating &&
    f.onTimeRate >= RANKING_CRITERIA.minOnTimeRate
  );
}

// Alias cũ để code cũ không bị lỗi, ưu tiên dùng isEligibleForQuarterRanking
export const isEligibleForMonthlyRanking = isEligibleForQuarterRanking;

export function withRankingScore(f: Freelancer): Freelancer {
  return { ...f, rankingScore: calculateRankingScore(f) };
}

export function filterByCategory(
  list: Freelancer[],
  category: FreelancerCategory | "Tất cả"
) {
  if (category === "Tất cả") return list;
  return list.filter((f) => f.category === category);
}

export function sortByScoreDesc(list: Freelancer[]) {
  return [...list].sort((a, b) => {
    const sa = a.rankingScore ?? calculateRankingScore(a);
    const sb = b.rankingScore ?? calculateRankingScore(b);
    if (sb !== sa) return sb - sa;
    // tie-breaker: rating -> onTime -> income -> completedJobs
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.onTimeRate !== a.onTimeRate) return b.onTimeRate - a.onTimeRate;
    if (b.totalIncome !== a.totalIncome) return b.totalIncome - a.totalIncome;
    return b.completedJobs - a.completedJobs;
  });
}

export function getEligibleRanked(list: Freelancer[]) {
  const base = list.filter(isEligibleForQuarterRanking).map(withRankingScore);
  const sorted = sortByScoreDesc(base);
  return sorted.map((f, index) => ({
    ...f,
    currentRank: index + 1,
  }));
}

export function getTopNByCategory(
  list: Freelancer[],
  category: FreelancerCategory | "Tất cả",
  topN = 10
) {
  const ranked = getEligibleRanked(filterByCategory(list, category));
  return ranked.slice(0, topN);
}

// Bảng xếp hạng tổng toàn hệ thống (overallRank)
export function getOverallTopN(list: Freelancer[], topN = 10) {
  return getEligibleRanked(list).slice(0, topN);
}

// Bảng xếp hạng theo ngành (categoryRank)
export function getCategoryTopN(
  list: Freelancer[],
  category: FreelancerCategory,
  topN = 10
) {
  const ranked = getEligibleRanked(list.filter((f) => f.category === category));
  return ranked.slice(0, topN);
}

export function getCommissionBenefitByOverallRank(rank: number): string {
  if (rank === 1) return "Miễn 10% phí hoa hồng";
  if (rank >= 2 && rank <= 3) return "Giảm 7% phí hoa hồng";
  if (rank >= 4 && rank <= 6) return "Giảm 5% phí hoa hồng";
  if (rank >= 7 && rank <= 10) return "Giảm 3% phí hoa hồng";
  return "Không áp dụng ưu đãi";
}

// Alias cũ cho tương thích
export const getCommissionBenefitByRank = getCommissionBenefitByOverallRank;

export function getIndustryBadgeByCategoryRank(rank: number): string {
  if (rank === 1) return "Quán quân ngành";
  if (rank >= 2 && rank <= 3) return "Freelancer nổi bật";
  if (rank >= 4 && rank <= 10) return "Top 10 ngành";
  return "";
}

export function getCurrentQuarterLabel(date = new Date()): string {
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  const year = date.getFullYear();
  return `Quý ${quarter} - ${year}`;
}

export type RankTrendType = "up" | "down" | "same" | "new" | "unknown";

export interface RankTrendInfo {
  type: RankTrendType;
  diff?: number;
  label: string;
}

export function getRankTrendInfo(
  previousRank?: number,
  currentRank?: number
): RankTrendInfo {
  if (!currentRank) {
    return { type: "unknown", label: "Chưa có dữ liệu" };
  }
  if (!previousRank) {
    return { type: "new", label: "Mới vào bảng xếp hạng" };
  }
  const diff = previousRank - currentRank;
  if (diff > 0) {
    return {
      type: "up",
      diff,
      label: `↑ Tăng ${diff} bậc`,
    };
  }
  if (diff < 0) {
    const down = Math.abs(diff);
    return {
      type: "down",
      diff: down,
      label: `↓ Giảm ${down} bậc`,
    };
  }
  return {
    type: "same",
    diff: 0,
    label: "→ Giữ nguyên",
  };
}

export function getAchievementBadges(f: Freelancer): string[] {
  const badges: string[] = [];

  if (f.currentRank === 1) {
    badges.push("Quán quân quý");
  }
  if (f.rating >= 4.9) {
    badges.push("Rating xuất sắc");
  }
  if (f.onTimeRate >= 98) {
    badges.push("Đúng hạn xuất sắc");
  }
  if (f.totalIncome >= 100_000_000) {
    badges.push("Thu nhập ấn tượng");
  }
  if (f.completedJobs >= 100) {
    badges.push("Hoạt động tích cực");
  }

  return badges;
}

export interface QuarterHighlights {
  highestIncome?: Freelancer;
  bestRating?: Freelancer;
  bestOnTime?: Freelancer;
  mostJobs?: Freelancer;
}

export function getQuarterHighlights(list: Freelancer[]): QuarterHighlights {
  if (!list.length) return {};

  const byScore = getEligibleRanked(list);

  const highestIncome = [...byScore].sort(
    (a, b) => b.totalIncome - a.totalIncome
  )[0];
  const bestRating = [...byScore].sort((a, b) => b.rating - a.rating)[0];
  const bestOnTime = [...byScore].sort(
    (a, b) => b.onTimeRate - a.onTimeRate
  )[0];
  const mostJobs = [...byScore].sort(
    (a, b) => b.completedJobs - a.completedJobs
  )[0];

  return { highestIncome, bestRating, bestOnTime, mostJobs };
}
