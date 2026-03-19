export type JobType =
  | "Toàn thời gian"
  | "Bán thời gian"
  | "Thực tập"
  | "Freelance"
  | "Remote";

export type WorkMode = "Onsite" | "Remote" | "Hybrid";

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  categoryName?: string;
  location: string;
  salary: string;
  salaryValue?: number | null;
  type: JobType;
  workMode: WorkMode;
  experienceLevel: "Junior" | "Mid" | "Senior";
  tags: string[];
  description: string;
}
