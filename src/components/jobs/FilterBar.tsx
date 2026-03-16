'use client';

import { cn } from "@/lib/utils";
import { SALARY_RANGES } from "@/data/jobs";

interface FilterBarProps {
  jobType: string;
  salaryRange: string;
  onChange: (field: "jobType" | "salaryRange", value: string) => void;
}

const jobTypeOptions = [
  { id: "", label: "Tất cả loại công việc" },
  { id: "Toàn thời gian", label: "Toàn thời gian" },
  { id: "Bán thời gian", label: "Bán thời gian" },
  { id: "Thực tập", label: "Thực tập" },
  { id: "Remote", label: "Remote" },
];

export function FilterBar({
  jobType,
  salaryRange,
  onChange,
}: FilterBarProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-slate-400 sm:text-xs">
          Bộ lọc nhanh:
        </span>
        {jobTypeOptions.slice(1).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange("jobType", opt.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              jobType === opt.id
                ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-medium text-slate-500 sm:text-xs">
          Mức lương:
        </label>
        <select
          value={salaryRange}
          onChange={(e) => onChange("salaryRange", e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:text-sm"
        >
          {SALARY_RANGES.map((range) => (
            <option key={range.id} value={range.id}>
              {range.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

