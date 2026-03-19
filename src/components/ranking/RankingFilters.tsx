'use client';

import { Filter } from "lucide-react";
import type { FreelancerCategory } from "@/types/freelancer";
import { freelancerCategories } from "@/data/freelancers";
import { cn } from "@/lib/utils";

interface RankingFiltersProps {
  value: FreelancerCategory | "Tất cả";
  onChange: (value: FreelancerCategory | "Tất cả") => void;
}

const allTabs = ["Tất cả", ...freelancerCategories] as const;

export function RankingFilters({ value, onChange }: RankingFiltersProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:mt-8">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Filter className="h-4 w-4 text-sky-500" />
        Lọc theo ngành nghề
      </div>

      <div className="flex flex-wrap gap-2">
        {allTabs.map((tab) => {
          const active = tab === value;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                active
                  ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm shadow-sky-100"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
