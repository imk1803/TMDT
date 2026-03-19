'use client';

import { useEffect, useState } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  keyword: string;
  location: string;
  workMode: string;
  onChange: (field: "keyword" | "location" | "workMode", value: string) => void;
  onSubmit: () => void;
}

export function SearchBar({
  keyword,
  location,
  workMode,
  onChange,
  onSubmit,
}: SearchBarProps) {
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    async function loadLocations() {
      try {
        const res = await fetch("/api/locations/provinces");
        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as { locations?: string[] };
        if (active && Array.isArray(data.locations)) setLocations(data.locations);
      } catch {
        if (active) setLocations([]);
      }
    }
    loadLocations();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-3 shadow-sm shadow-sky-100 sm:flex-row sm:items-center sm:p-4"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => onChange("keyword", e.target.value)}
            className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Tìm theo vị trí, kỹ năng hoặc công ty..."
          />
        </div>
      </div>
      <div className="grid flex-none grid-cols-2 gap-2 sm:w-[340px]">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm">
          <MapPin className="h-4 w-4 text-slate-400" />
          <select
            value={location}
            onChange={(e) => onChange("location", e.target.value)}
            className={cn(
              "w-full border-none bg-transparent text-xs outline-none sm:text-sm",
              !location && "text-slate-400"
            )}
          >
            <option value="">Tất cả địa điểm</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm">
          <Briefcase className="h-4 w-4 text-slate-400" />
          <select
            value={workMode}
            onChange={(e) => onChange("workMode", e.target.value)}
            className={cn(
              "w-full border-none bg-transparent text-xs outline-none sm:text-sm",
              !workMode && "text-slate-400"
            )}
          >
            <option value="">Hình thức làm việc</option>
            <option value="Onsite">Onsite</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>
      <div className="flex-none sm:w-32">
        <Button type="submit" fullWidth className="gap-1.5">
          Tìm việc
        </Button>
      </div>
    </form>
  );
}
