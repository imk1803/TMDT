import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtext?: string;
  className?: string;
  isLoading?: boolean;
}

export function MetricCard({ title, value, icon, subtext, className, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse", className)}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100"></div>
          <div className="h-4 w-20 bg-slate-100 rounded"></div>
        </div>
        <div>
          <div className="h-8 w-16 bg-slate-100 rounded mb-2"></div>
          {subtext && <div className="h-3 w-24 bg-slate-100 rounded"></div>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-slate-600">{title}</h3>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
      </div>
    </div>
  );
}
