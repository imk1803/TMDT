export interface Category {
  id: string;
  name: string;
  icon: string;
  jobsCount: number;
}

export const categories: Category[] = [
  {
    id: "it",
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
    id: "content",
    name: "Viết lách & Nội dung",
    icon: "pen",
    jobsCount: 180,
  },
  {
    id: "finance",
    name: "Tài chính & Kế toán",
    icon: "wallet",
    jobsCount: 95,
  },
  {
    id: "sales",
    name: "Kinh doanh & Bán hàng",
    icon: "chart",
    jobsCount: 260,
  },
  {
    id: "support",
    name: "Hỗ trợ khách hàng",
    icon: "headset",
    jobsCount: 140,
  },
  {
    id: "hr",
    name: "Nhân sự & Tuyển dụng",
    icon: "users",
    jobsCount: 80,
  },
  {
    id: "pm",
    name: "Quản lý dự án",
    icon: "clipboard",
    jobsCount: 110,
  },
  {
    id: "legal",
    name: "Pháp lý",
    icon: "scale",
    jobsCount: 50,
  },
  {
    id: "education",
    name: "Giáo dục & Đào tạo",
    icon: "book",
    jobsCount: 70,
  },
  {
    id: "data",
    name: "Dữ liệu & Phân tích",
    icon: "database",
    jobsCount: 90,
  },
  {
    id: "product",
    name: "Sản phẩm & UX",
    icon: "layers",
    jobsCount: 75,
  },
  {
    id: "media",
    name: "Ảnh/Video & Multimedia",
    icon: "video",
    jobsCount: 65,
  },
  {
    id: "translation",
    name: "Dịch thuật",
    icon: "globe",
    jobsCount: 55,
  },
];
