'use client';

import { SALARY_RANGES } from "@/data/jobs";
import { categories } from "@/data/categories";

interface FilterBarProps {
  category: string;
  salaryRange: string;
  onChange: (field: "category" | "salaryRange", value: string) => void;
}

export function FilterBar({
  category,
  salaryRange,
  onChange,
}: FilterBarProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-medium text-slate-500 sm:text-xs">
          Ngành nghề:
        </label>
        <select
          value={category}
          onChange={(e) => onChange("category", e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:text-sm"
        >
          <option value="">Tất cả ngành nghề</option>
          {categories.map((opt) => (
            <option key={opt.id} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-medium text-slate-500 sm:text-xs">
          Ngân sách:
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
