'use client';

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SearchBar } from "@/components/jobs/SearchBar";
import { FilterBar } from "@/components/jobs/FilterBar";
import { JobCard } from "@/components/jobs/JobCard";
import { jobs } from "@/data/jobs";

export default function JobsPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryRange, setSalaryRange] = useState("all");

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const kw = keyword.trim().toLowerCase();
      if (kw) {
        const text =
          `${job.title} ${job.companyName} ${job.description} ${job.tags.join(
            " "
          )}`.toLowerCase();
        if (!text.includes(kw)) return false;
      }

      if (location && job.location !== location) return false;
      if (workMode && job.workMode !== workMode) return false;
      if (jobType && job.type !== jobType) return false;

      if (salaryRange !== "all") {
        const numeric = parseInt(job.salary.replace(/\D/g, ""), 10);
        if (!Number.isFinite(numeric)) return true;
        if (salaryRange === "under-15" && numeric >= 15) return false;
        if (salaryRange === "15-25" && (numeric < 15 || numeric > 25))
          return false;
        if (salaryRange === "25-40" && (numeric < 25 || numeric > 40))
          return false;
        if (salaryRange === "over-40" && numeric <= 40) return false;
      }

      return true;
    });
  }, [jobType, keyword, location, salaryRange, workMode]);

  const handleSearchChange = (
    field: "keyword" | "location" | "workMode",
    value: string
  ) => {
    if (field === "keyword") setKeyword(value);
    if (field === "location") setLocation(value);
    if (field === "workMode") setWorkMode(value);
  };

  const handleFilterChange = (field: "jobType" | "salaryRange", value: string) => {
    if (field === "jobType") setJobType(value);
    if (field === "salaryRange") setSalaryRange(value);
  };

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <SectionTitle
          title="Tìm kiếm việc làm"
          subtitle="Lọc theo địa điểm, mức lương và hình thức làm việc để tìm được cơ hội phù hợp nhất."
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
          jobType={jobType}
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
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {filteredJobs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-center text-sm text-slate-500 sm:p-8 sm:text-base">
              <p className="font-medium text-slate-700">
                Chưa tìm thấy việc làm phù hợp với bộ lọc hiện tại.
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

