import { Star } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
}

function timeSince(dateString?: string) {
  if (!dateString) return "gần đây";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) {
    if (Math.floor(interval) === 1) return "hôm qua";
    return Math.floor(interval) + " ngày trước";
  }
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "vừa xong";
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="flex flex-col md:flex-row justify-between gap-6 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-md hover:border-sky-300 transition-all duration-300 cursor-pointer">
      
      {/* Left Column */}
      <div className="flex-1 w-full md:pr-8">
        <div className="flex items-center gap-3 mb-3 relative -top-1">
          <span className="text-slate-500 text-[13px] font-medium flex items-center gap-1.5">
            Đăng {timeSince(job.createdAt)}
          </span>
          {job.categoryName && (
            <>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span className="text-sky-600 text-[13px] font-semibold">{job.categoryName}</span>
            </>
          )}
        </div>

        <Link href={`/jobs/${job.id}`} className="block group">
          <h3 className="text-xl sm:text-[22px] font-bold text-slate-900 leading-tight group-hover:text-sky-600 transition-colors">
            {job.title}
          </h3>
        </Link>

        <p className="line-clamp-2 text-[15px] leading-relaxed text-slate-500 max-w-3xl">
          {job.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 pt-2">
          {job.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500">
              +{job.tags.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col md:items-end justify-between md:min-w-[220px] shrink-0 mt-4 md:mt-0 border-t md:border-t-0 border-slate-100 pt-5 md:pt-0">
        
        <div className="md:text-right mb-5 md:mb-0">
          <p className="text-[22px] sm:text-[26px] font-bold text-slate-900 tracking-tight">
            {job.salary}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {job.budgetType}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-[auto_auto] gap-x-6 gap-y-2 w-full md:w-auto mt-4 md:mt-auto mb-5 md:mb-6 text-sm md:ml-auto items-center">
           <span className="text-slate-500 text-left md:text-right">Thời gian:</span>
           <span className="font-semibold text-slate-900 text-right">{job.durationText || "Theo thỏa thuận"}</span>

           <span className="text-slate-500 text-left md:text-right">Khách hàng:</span>
           <span className="font-semibold text-slate-900 flex items-center justify-end gap-1">
             {job.clientRating && job.clientRating > 0 ? job.clientRating.toFixed(1) : "Chưa có"}
             <Star className="h-4 w-4 fill-amber-400 text-amber-400 -mt-0.5" />
           </span>
        </div>

        <Link href={`/jobs/${job.id}`} className="block w-full mt-4">
          <button className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[15px] py-3 shadow-sm hover:shadow transition-all hover:-translate-y-0.5">
            Gửi báo giá
          </button>
        </Link>
      </div>
      
    </article>
  );
}
