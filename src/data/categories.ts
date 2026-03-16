export interface Category {
  id: string;
  name: string;
  icon: string;
  jobsCount: number;
}

export const categories: Category[] = [
  {
    id: "dev",
    name: "Công nghệ thông tin",
    icon: "code",
    jobsCount: 320,
  },
  {
    id: "design",
    name: "Thiết kế & Sáng tạo",
    icon: "design",
    jobsCount: 120,
  },
  {
    id: "marketing",
    name: "Marketing & Truyền thông",
    icon: "megaphone",
    jobsCount: 210,
  },
  {
    id: "finance",
    name: "Tài chính & Kế toán",
    icon: "wallet",
    jobsCount: 95,
  },
  {
    id: "hr",
    name: "Nhân sự & Tuyển dụng",
    icon: "users",
    jobsCount: 80,
  },
  {
    id: "sale",
    name: "Kinh doanh & Bán hàng",
    icon: "chart",
    jobsCount: 260,
  },
];

