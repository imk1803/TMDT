'use client';

import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { categories } from "@/data/categories";
import { SALARY_RANGES } from "@/data/jobs";

interface SearchBarProps {
  keyword: string;
  category: string;
  salaryRange: string;
  popularTags?: string[];
  onChange: (field: "keyword" | "category" | "salaryRange", value: string) => void;
  onSubmit: () => void;
}

export function SearchBar({
  keyword,
  category,
  salaryRange,
  popularTags = [],
  onChange,
  onSubmit,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center w-full rounded-full border border-slate-200 bg-white shadow-sm p-2 hover:shadow-md focus-within:shadow-md focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100/50 transition-all duration-300"
      >
        <div className="flex-1 flex items-center gap-3 px-4 sm:px-5 py-2 text-slate-900 w-full">
          <Search className="h-5 w-5 text-sky-500" />
          <input
            value={keyword}
            onChange={(e) => onChange("keyword", e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[15px] sm:text-[16px] placeholder:text-slate-400 font-medium"
            placeholder="Tìm kiếm kỹ năng, chức danh hoặc dự án..."
          />
        </div>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto px-2">
          <div className="relative group flex-1 sm:flex-none">
            <select
              value={category}
              onChange={(e) => onChange("category", e.target.value)}
              className="w-full sm:w-auto appearance-none bg-transparent hover:bg-slate-50 outline-none text-[14px] font-semibold text-slate-700 px-4 pr-9 py-2.5 rounded-full cursor-pointer transition-colors"
            >
              <option value="">Tất cả lĩnh vực</option>
              {categories.map((opt) => (
                <option key={opt.id} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative group flex-1 sm:flex-none hidden sm:block">
            <select
              value={salaryRange}
              onChange={(e) => onChange("salaryRange", e.target.value)}
              className="w-full sm:w-auto appearance-none bg-transparent hover:bg-slate-50 outline-none text-[14px] font-medium text-slate-600 px-4 pr-9 py-2.5 rounded-full cursor-pointer transition-colors"
            >
              <option value="all">Mọi ngân sách</option>
              {SALARY_RANGES.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <Button type="submit" className="rounded-full px-8 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[15px] shadow-sm transition-all hover:shadow ml-1 w-full sm:w-auto mt-2 sm:mt-0">
            Tìm kiếm
          </Button>
        </div>
      </form>

      {popularTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 mt-5 ml-2">
          <span className="text-[13px] font-medium text-slate-500 mr-1">Gợi ý:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onChange("keyword", tag)}
              className="rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors shadow-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
