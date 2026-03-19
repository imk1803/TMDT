export type FreelancerCategory =
  | "Công nghệ thông tin"
  | "Thiết kế & Sáng tạo"
  | "Marketing & Truyền thông"
  | "Viết lách & Nội dung"
  | "Tài chính & Kế toán"
  | "Kinh doanh & Bán hàng"
  | "Hỗ trợ khách hàng"
  | "Nhân sự & Tuyển dụng"
  | "Quản lý dự án"
  | "Pháp lý"
  | "Giáo dục & Đào tạo"
  | "Dữ liệu & Phân tích"
  | "Sản phẩm & UX"
  | "Ảnh/Video & Multimedia"
  | "Dịch thuật";

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
