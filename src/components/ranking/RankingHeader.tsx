import { Trophy } from "lucide-react";

interface RankingHeaderProps {
  quarterLabel: string;
}

export function RankingHeader({ quarterLabel }: RankingHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-teal-50 p-6 shadow-xl shadow-sky-100 sm:p-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-gradient-to-tr from-sky-200 to-teal-200 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-16 h-56 w-56 rounded-full bg-gradient-to-tr from-teal-200 to-sky-200 opacity-40 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
            <Trophy className="h-4 w-4 text-sky-600" />
            Top Freelancer theo quý · {quarterLabel}
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Bảng xếp hạng Freelancer theo quý
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Bảng xếp hạng này tôn vinh những freelancer hoạt động hiệu quả trong
            quý. Hệ thống đánh giá dựa trên số lượng công việc hoàn thành,
            thu nhập, rating và tỷ lệ đúng hạn. Bảng xếp hạng được chia theo
            ngành nghề để đảm bảo công bằng.
          </p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 text-xs text-slate-600 shadow-sm sm:w-[260px] sm:text-sm">
          <p className="font-semibold text-slate-800">Điểm khác biệt</p>
          <ul className="mt-2 space-y-1.5">
            <li>• Tạo động lực làm việc hiệu quả hơn</li>
            <li>• Cạnh tranh lành mạnh theo ngành</li>
            <li>• Ưu đãi hoa hồng cho Top 10</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

