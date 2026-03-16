import { Sparkles, Trophy } from "lucide-react";

const benefits = [
  { label: "Top 1", value: "Miễn 10% phí hoa hồng", tone: "gold" },
  { label: "Top 2–3", value: "Giảm 7% phí hoa hồng", tone: "silver" },
  { label: "Top 4–6", value: "Giảm 5% phí hoa hồng", tone: "bronze" },
  { label: "Top 7–10", value: "Giảm 3% phí hoa hồng", tone: "sky" },
] as const;

function toneClass(tone: (typeof benefits)[number]["tone"]) {
  if (tone === "gold") return "from-amber-200 to-amber-50 text-amber-800";
  if (tone === "silver") return "from-slate-200 to-white text-slate-800";
  if (tone === "bronze") return "from-orange-200 to-orange-50 text-orange-800";
  return "from-sky-200 to-sky-50 text-sky-800";
}

export function BenefitSection() {
  return (
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-teal-50 p-5 shadow-sm shadow-sky-100 sm:p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Quyền lợi Top 10 (bảng tổng)
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Những freelancer thuộc Top 10 ở tab{" "}
            <span className="font-semibold text-slate-700">Tất cả</span> sẽ nhận
            ưu đãi giảm phí hoa hồng theo thứ hạng. Bảng theo ngành chỉ áp dụng
            badge thành tích, không áp dụng ưu đãi phí.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {benefits.map((b) => (
          <div
            key={b.label}
            className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClass(
                  b.tone
                )}`}
              >
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{b.label}</p>
                <p className="text-xs text-slate-500">
                  Ưu đãi theo thứ hạng quý (bảng tổng)
                </p>
              </div>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              {b.value}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-600 sm:text-sm">
        Ví dụ: Nền tảng thu <span className="font-semibold">10%</span> phí hoa
        hồng mỗi đơn. Nếu freelancer là{" "}
        <span className="font-semibold">Top 1 quý</span> (bảng tổng) thì được
        miễn toàn bộ 10% đó; Top 2–3 giảm 7%, Top 4–6 giảm 5%, Top 7–10 giảm 3%.
      </p>
    </section>
  );
}

