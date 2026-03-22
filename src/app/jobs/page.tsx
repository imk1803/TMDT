"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/jobs/SearchBar";
import { JobCard } from "@/components/jobs/JobCard";
import { fetchJobs } from "@/services/jobs";
import type { Job } from "@/types/job";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function normalizeLocation(value: string) {
  return normalizeText(value)
    .replace(/^tp\.?\s*/g, "")
    .replace(/^thanh pho\s+/g, "")
    .replace(/^tinh\s+/g, "")
    .trim();
}

function toSalaryMillions(job: Job): number | null {
  if (typeof job.salaryValue === "number") {
    if (job.salaryValue >= 1_000_000) return job.salaryValue / 1_000_000;
    return job.salaryValue;
  }
  const numeric = parseInt(job.salary.replace(/\D/g, ""), 10);
  if (!Number.isFinite(numeric)) return null;
  if (numeric >= 1_000_000) return numeric / 1_000_000;
  return numeric;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [salaryRange, setSalaryRange] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchJobs();
        if (!cancelled) {
          setJobs(data);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setJobs([]);
          const message = err?.message || "Không thể tải danh sách công việc.";
          setError(message);
          push({
            title: "Không tải được công việc",
            description: message,
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [push]);

  const filteredJobs = useMemo(() => {
    const kw = normalizeText(keyword.trim());

    return jobs.filter((job) => {
      if (kw) {
        const text = normalizeText(
          `${job.title} ${job.companyName} ${job.description} ${job.tags.join(" ")} ${
            job.categoryName || ""
          }`
        );
        if (!text.includes(kw)) return false;
      }

      if (category && normalizeText(job.categoryName || "") !== normalizeText(category))
        return false;

      if (salaryRange !== "all") {
        const salaryMillions = toSalaryMillions(job);
        if (salaryMillions === null) return true;
        if (salaryRange === "under-15" && salaryMillions >= 15) return false;
        if (salaryRange === "15-25" && (salaryMillions < 15 || salaryMillions > 25))
          return false;
        if (salaryRange === "25-40" && (salaryMillions < 25 || salaryMillions > 40))
          return false;
        if (salaryRange === "over-40" && salaryMillions <= 40) return false;
      }

      return true;
    });
  }, [category, keyword, salaryRange, jobs]);

  // Compute top 5 most frequent tags from currently loaded jobs
  const popularTags = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      job.tags.forEach(tag => {
        const t = tag.toUpperCase();
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }, [jobs]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const catName = job.categoryName || "Khác";
      counts[catName] = (counts[catName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const handleSearchChange = (
    field: "keyword" | "category" | "salaryRange",
    value: string
  ) => {
    if (field === "keyword") setKeyword(value);
    if (field === "category") setCategory(value);
    if (field === "salaryRange") setSalaryRange(value);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header Topic */}
      <div className="pt-12 sm:pt-16 pb-6 sm:pb-10">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div className="max-w-2xl">
              <h1 className="text-[32px] sm:text-[44px] leading-tight font-black tracking-tight text-slate-900 mb-3">
                Tìm kiếm <br className="hidden sm:block" /> cơ hội.
              </h1>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
                Khám phá hàng ngàn dự án chất lượng cao từ các doanh nghiệp<br className="hidden sm:block" /> hàng đầu tại Việt Nam.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
               <div className="h-px bg-slate-200 w-12"></div>
               <span className="text-sky-600 font-bold tracking-wide uppercase text-sm">{jobs.length} Dự án mới</span>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar (25%) */}
          <div className="w-full lg:w-[25%] shrink-0 space-y-6 lg:sticky lg:top-24 hidden lg:block">
            <div>
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-4">Danh mục</h3>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => handleSearchChange("category", "")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] transition-all ${!category ? 'bg-sky-50 text-sky-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                >
                  <span className="truncate">Tất cả dự án</span>
                  <span className={`text-[12px] rounded-md px-2 py-0.5 border ${!category ? 'bg-sky-100 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {jobs.length}
                  </span>
                </button>
                {categories.map(([catName, count]) => (
                  <button
                    key={catName}
                    onClick={() => handleSearchChange("category", catName)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] transition-all ${category === catName ? 'bg-sky-50 text-sky-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                  >
                    <span className="truncate pr-2">{catName}</span>
                    <span className={`text-[12px] rounded-md px-2 py-0.5 border ${category === catName ? 'bg-sky-100 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Job List (75%) */}
          <div className="w-full lg:w-[75%] space-y-6">
            <SearchBar
              keyword={keyword}
              category={category}
              salaryRange={salaryRange}
              popularTags={popularTags}
              onChange={handleSearchChange}
              onSubmit={() => {}}
            />

            <div className="grid gap-6">
              {loading && (
                <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-8 text-center text-[15px] font-medium text-sky-700">
                  Đang tải dữ liệu...
                </div>
              )}

              {!loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid gap-6"
                >
                  <AnimatePresence>
                    {filteredJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <JobCard job={job} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {!loading && filteredJobs.length === 0 && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.3 }}
                   className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm"
                >
                  <p className="text-lg font-bold text-slate-900 mb-2">
                    {error || "Chưa tìm thấy dự án phù hợp."}
                  </p>
                  <p className="text-[15px] text-slate-500 max-w-sm mx-auto">
                    Bạn thử chọn một danh mục khác hoặc điều chỉnh lại ngân sách mong muốn xem sao nhé.
                  </p>
                  <button onClick={() => {
                    handleSearchChange("keyword", "");
                    handleSearchChange("category", "");
                    handleSearchChange("salaryRange", "all");
                  }} className="mt-6 font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-5 py-2.5 rounded-full transition-colors">
                    Xóa tất cả bộ lọc
                  </button>
                </motion.div>
              )}
            </div>

            {/* Pagination / Load More */}
            {!loading && filteredJobs.length > 0 && (
              <div className="pt-8 pb-4 flex justify-center mt-2">
                <button className="rounded-full border border-slate-200 bg-white px-8 py-3 text-[14px] font-bold text-slate-600 shadow-sm hover:border-sky-300 hover:text-sky-600 transition-all hover:-translate-y-0.5">
                  Xem thêm dự án
                </button>
              </div>
            )}
          </div>
          
        </div>
      </Container>
    </div>
  );
}
