import { MapPin, Wallet, Briefcase, ArrowRight } from "lucide-react";
import type { Job } from "@/types/job";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md sm:p-5">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
              {job.title}
            </h3>
            <p className="text-xs font-medium text-sky-600 sm:text-sm">
              {job.companyName}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
              job.type === "Toàn thời gian"
                ? "bg-emerald-50 text-emerald-700"
                : job.type === "Bán thời gian"
                ? "bg-amber-50 text-amber-700"
                : job.type === "Thực tập"
                ? "bg-sky-50 text-sky-700"
                : "bg-slate-50 text-slate-700"
            )}
          >
            {job.type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {job.location} · {job.workMode}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            {job.salary}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            {job.experienceLevel} level
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-slate-500 sm:text-sm">
          {job.description}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-slate-400 sm:text-xs">
          Ứng tuyển nhanh · Phản hồi trong 3 ngày
        </p>
        <Button size="sm" className="gap-1.5">
          <span>Ứng tuyển</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}

