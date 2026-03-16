export type FreelancerCategory =
  | "IT"
  | "Kế toán"
  | "Thiết kế"
  | "Marketing"
  | "Viết nội dung";

export interface Freelancer {
  id: string;
  name: string;
  avatar: string;
  category: FreelancerCategory;
  completedJobs: number;
  totalIncome: number; // VNĐ
  rating: number; // 0 - 5
  onTimeRate: number; // 0 - 100
  rankingScore?: number;
  /**
   * Thứ hạng quý trước trên bảng tương ứng (overall hoặc ngành).
   * Dùng để hiển thị xu hướng tăng / giảm hạng.
   */
  previousQuarterRank?: number;
  /**
   * Thứ hạng hiện tại sau khi hệ thống xếp hạng.
   * Được gán động khi tính toán ranking.
   */
  currentRank?: number;
}

