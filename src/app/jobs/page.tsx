"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/jobs/SearchBar";
import { FilterBar } from "@/components/jobs/FilterBar";
import { JobCard } from "@/components/jobs/JobCard";
import { fetchJobs } from "@/services/jobs";
import type { Job } from "@/types/job";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";

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
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
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
    const locationFilter = normalizeLocation(location.trim());
    const workModeFilter = normalizeText(workMode.trim());

    return jobs.filter((job) => {
      if (kw) {
        const text = normalizeText(
          `${job.title} ${job.companyName} ${job.description} ${job.tags.join(" ")} ${
            job.categoryName || ""
          }`
        );
        if (!text.includes(kw)) return false;
      }

      if (locationFilter && normalizeLocation(job.location) !== locationFilter) return false;
      if (workModeFilter && normalizeText(job.workMode) !== workModeFilter) return false;
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
  }, [category, keyword, location, salaryRange, workMode, jobs]);

  const handleSearchChange = (
    field: "keyword" | "location" | "workMode",
    value: string
  ) => {
    if (field === "keyword") setKeyword(value);
    if (field === "location") setLocation(value);
    if (field === "workMode") setWorkMode(value);
  };

  const handleFilterChange = (field: "category" | "salaryRange", value: string) => {
    if (field === "category") setCategory(value);
    if (field === "salaryRange") setSalaryRange(value);
  };

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <SectionTitle
          title="Tìm kiếm việc làm"
          subtitle="Lọc theo địa điểm, mức lương và hình thức làm việc để tìm được cơ hội phù hợp nhất."
          actions={
            user?.role === "CLIENT" ? (
              <Link href="/jobs/new">
                <Button size="sm">Đăng job mới</Button>
              </Link>
            ) : undefined
          }
        />

        <SearchBar
          keyword={keyword}
          location={location}
          workMode={workMode}
          onChange={handleSearchChange}
          onSubmit={() => {
            /* lọc đã chạy tự động */
          }}
        />

        <FilterBar
          category={category}
          salaryRange={salaryRange}
          onChange={handleFilterChange}
        />

        <div className="mt-5 flex items-center justify-between text-xs text-slate-500 sm:mt-6 sm:text-sm">
          <p>
            Tìm thấy{" "}
            <span className="font-semibold text-slate-800">
              {filteredJobs.length}
            </span>{" "}
            việc làm phù hợp
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:mt-5">
          {loading && (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-center text-sm text-slate-500 sm:p-8 sm:text-base">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {!loading && filteredJobs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-center text-sm text-slate-500 sm:p-8 sm:text-base">
              <p className="font-medium text-slate-700">
                {error || "Chưa tìm thấy việc làm phù hợp với bộ lọc hiện tại."}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Hãy thử xoá bớt điều kiện lọc hoặc tìm với từ khóa khác.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
