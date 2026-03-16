import type { Job } from "@/types/job";

export const JOB_LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Remote",
] as const;

export const WORK_MODES = ["Onsite", "Remote", "Hybrid"] as const;

export const JOB_TYPES = [
  "Toàn thời gian",
  "Bán thời gian",
  "Thực tập",
  "Freelance",
  "Remote",
] as const;

export const SALARY_RANGES = [
  { id: "all", label: "Tất cả mức lương" },
  { id: "under-15", label: "Dưới 15 triệu" },
  { id: "15-25", label: "15 - 25 triệu" },
  { id: "25-40", label: "25 - 40 triệu" },
  { id: "over-40", label: "Trên 40 triệu" },
] as const;

export const jobs: Job[] = [
  {
    id: "1",
    title: "Frontend Developer (React)",
    companyId: "c1",
    companyName: "VietTech Solutions",
    location: "TP. Hồ Chí Minh",
    salary: "25 - 35 triệu",
    type: "Toàn thời gian",
    workMode: "Hybrid",
    experienceLevel: "Mid",
    tags: ["React", "TypeScript", "TailwindCSS"],
    description:
      "Phát triển giao diện web hiện đại cho nền tảng tuyển dụng với React & Next.js.",
  },
  {
    id: "2",
    title: "Backend Engineer (Node.js)",
    companyId: "c2",
    companyName: "FinX Việt Nam",
    location: "Hà Nội",
    salary: "30 - 45 triệu",
    type: "Toàn thời gian",
    workMode: "Onsite",
    experienceLevel: "Senior",
    tags: ["Node.js", "PostgreSQL", "Microservices"],
    description:
      "Thiết kế và xây dựng hệ thống backend hiệu năng cao cho sản phẩm tài chính.",
  },
  {
    id: "3",
    title: "UI/UX Designer",
    companyId: "c3",
    companyName: "Creative Studio",
    location: "Đà Nẵng",
    salary: "18 - 25 triệu",
    type: "Toàn thời gian",
    workMode: "Onsite",
    experienceLevel: "Mid",
    tags: ["Figma", "Design System", "Prototyping"],
    description:
      "Thiết kế giao diện và trải nghiệm người dùng cho các sản phẩm web & mobile.",
  },
  {
    id: "4",
    title: "Data Analyst",
    companyId: "c1",
    companyName: "VietTech Solutions",
    location: "TP. Hồ Chí Minh",
    salary: "20 - 30 triệu",
    type: "Toàn thời gian",
    workMode: "Hybrid",
    experienceLevel: "Mid",
    tags: ["SQL", "Python", "Dashboard"],
    description:
      "Phân tích dữ liệu hành vi ứng viên và nhà tuyển dụng để tối ưu sản phẩm.",
  },
  {
    id: "5",
    title: "Mobile Developer (React Native)",
    companyId: "c4",
    companyName: "AppWorks",
    location: "Remote",
    salary: "30 - 40 triệu",
    type: "Remote",
    workMode: "Remote",
    experienceLevel: "Senior",
    tags: ["React Native", "iOS", "Android"],
    description:
      "Phát triển ứng dụng mobile tìm việc với trải nghiệm mượt mà, hiện đại.",
  },
  {
    id: "6",
    title: "Digital Marketing Executive",
    companyId: "c5",
    companyName: "GrowUp Agency",
    location: "Hà Nội",
    salary: "12 - 18 triệu",
    type: "Toàn thời gian",
    workMode: "Onsite",
    experienceLevel: "Junior",
    tags: ["Facebook Ads", "Google Ads", "SEO"],
    description:
      "Lên kế hoạch và triển khai chiến dịch marketing cho các thương hiệu tuyển dụng.",
  },
  {
    id: "7",
    title: "Content Writer (Part-time)",
    companyId: "c5",
    companyName: "GrowUp Agency",
    location: "Remote",
    salary: "8 - 12 triệu",
    type: "Bán thời gian",
    workMode: "Remote",
    experienceLevel: "Junior",
    tags: ["Content", "Blog", "Social Media"],
    description:
      "Sáng tạo nội dung thu hút ứng viên cho website và mạng xã hội.",
  },
  {
    id: "8",
    title: "Frontend Intern",
    companyId: "c3",
    companyName: "Creative Studio",
    location: "TP. Hồ Chí Minh",
    salary: "4 - 6 triệu",
    type: "Thực tập",
    workMode: "Onsite",
    experienceLevel: "Junior",
    tags: ["HTML", "CSS", "React"],
    description:
      "Tham gia vào quá trình phát triển giao diện và học hỏi từ team senior.",
  },
];

