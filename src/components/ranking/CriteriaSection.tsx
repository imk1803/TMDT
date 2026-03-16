import { CheckCircle2, ClipboardList } from "lucide-react";
import { RANKING_CRITERIA } from "@/lib/ranking";

export function CriteriaSection() {
  return (
    <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100 sm:p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Điều kiện tham gia bảng xếp hạng quý
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Chỉ xét freelancer đạt đủ 4 điều kiện trong quý.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
          <span>
            Hoàn thành tối thiểu{" "}
            <span className="font-semibold">
              {RANKING_CRITERIA.minCompletedJobs} job
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
          <span>
            Thu nhập tối thiểu{" "}
            <span className="font-semibold">
              {RANKING_CRITERIA.minTotalIncome.toLocaleString("vi-VN")} VNĐ
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
          <span>
            Rating tối thiểu{" "}
            <span className="font-semibold">
              {RANKING_CRITERIA.minRating}/5
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
          <span>
            Tỷ lệ đúng hạn tối thiểu{" "}
            <span className="font-semibold">
              {RANKING_CRITERIA.minOnTimeRate}%
            </span>
          </span>
        </li>
      </ul>

      <p className="mt-4 text-xs text-slate-500 sm:text-sm">
        Những freelancer không đạt đủ điều kiện sẽ{" "}
        <span className="font-medium text-slate-700">tự động bị loại</span> khỏi
        bảng xếp hạng quý.
      </p>
    </section>
  );
}

