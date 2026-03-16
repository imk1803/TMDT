import Image from "next/image";
import { ArrowUpRight, Clock, DollarSign, Star, Timer } from "lucide-react";
import type { QuarterHighlights } from "@/lib/ranking";

function formatVnd(n: number | undefined) {
  if (!n) return "—";
  return n.toLocaleString("vi-VN") + " VNĐ";
}

interface QuarterHighlightsProps {
  data: QuarterHighlights;
}

export function QuarterHighlightsSection({ data }: QuarterHighlightsProps) {
  const { highestIncome, bestRating, bestOnTime, mostJobs } = data;

  const items = [
    {
      key: "income",
      title: "Thu nhập cao nhất",
      icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
      freelancer: highestIncome,
      value: highestIncome && formatVnd(highestIncome.totalIncome),
      hint: "Tổng thu nhập từ job trong quý",
    },
    {
      key: "rating",
      title: "Rating cao nhất",
      icon: <Star className="h-4 w-4 text-amber-500" />,
      freelancer: bestRating,
      value: bestRating && `${bestRating.rating.toFixed(2)}/5`,
      hint: "Điểm đánh giá trung bình từ khách hàng",
    },
    {
      key: "onTime",
      title: "Đúng hạn tốt nhất",
      icon: <Timer className="h-4 w-4 text-sky-500" />,
      freelancer: bestOnTime,
      value: bestOnTime && `${bestOnTime.onTimeRate}%`,
      hint: "Tỷ lệ hoàn thành đúng thời hạn",
    },
    {
      key: "jobs",
      title: "Hoàn thành nhiều job nhất",
      icon: <Clock className="h-4 w-4 text-indigo-500" />,
      freelancer: mostJobs,
      value: mostJobs && `${mostJobs.completedJobs} job`,
      hint: "Số lượng job đã hoàn thành trong quý",
    },
  ];

  return (
    <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Freelancer nổi bật quý này
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Danh hiệu dựa trên dữ liệu hiệu suất theo từng tiêu chí cụ thể.
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-sky-500" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-sm shadow-sm"
          >
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              {item.icon}
            </div>
            {item.freelancer ? (
              <>
                <div className="relative h-9 w-9 flex-none overflow-hidden rounded-2xl ring-2 ring-sky-100">
                  <Image
                    src={item.freelancer.avatar}
                    alt={item.freelancer.name}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.freelancer.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {item.title} ·{" "}
                    <span className="font-medium text-slate-700">
                      {item.value}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">{item.hint}</p>
                </div>
              </>
            ) : (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Chưa có dữ liệu
                </p>
                <p className="text-[11px] text-slate-500">{item.hint}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

