import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-sky-50 to-teal-50 pb-12 pt-10 sm:pb-16 sm:pt-14">
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-1/2 aspect-[1108/632] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-sky-200 via-cyan-200 to-sky-100 opacity-70" />
      </div>

      <Container className="relative flex flex-col items-stretch gap-10 sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/70 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm shadow-sky-100 backdrop-blur">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
              ✔
            </span>
            Hơn 1.000+ cơ hội việc làm chất lượng
          </span>

          <div className="space-y-3">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Tìm công việc{" "}
              <span className="bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                phù hợp nhất
              </span>{" "}
              cho sự nghiệp của bạn.
            </h1>
            <p className="max-w-xl text-sm text-slate-600 sm:text-base">
              Khám phá hàng trăm cơ hội từ các công ty hàng đầu. Ứng tuyển chỉ
              với vài cú nhấp chuột, theo dõi trạng thái hồ sơ dễ dàng.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/80 p-3 shadow-xl shadow-sky-100 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    className="h-6 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Vị trí, kỹ năng hoặc công ty mong muốn..."
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:w-40 sm:flex-none">
                <Button size="lg" className="w-full gap-2">
                  <span>Tìm việc ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-xs text-slate-500 sm:text-[11px]">
                  Gợi ý dành cho bạn dựa trên kỹ năng và địa điểm.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-[11px] font-semibold text-sky-700">
                IT
              </span>
              <span>Việc làm IT, Product, Design, Marketing...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Cập nhật tin tuyển dụng mới mỗi ngày</span>
            </div>
          </div>
        </div>

        <div className="relative hidden h-full sm:block">
          <div className="absolute inset-0 -left-4 flex items-center justify-center">
            <div className="h-[320px] w-full max-w-sm rounded-3xl bg-white/90 p-4 shadow-2xl shadow-sky-100 ring-1 ring-sky-100 backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-slate-500">
                    Gợi ý cho bạn
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    128 vị trí phù hợp
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-600">
                  Đang tuyển gấp
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-2xl border border-sky-50 bg-sky-50/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-500">
                    Frontend Developer
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    VietTech Solutions · TP. HCM
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Lương 25 - 35 triệu · Hybrid · React, TypeScript
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-2.5">
                    <p className="text-[11px] font-semibold text-slate-800">
                      UI/UX Designer
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Đà Nẵng · 18 - 25 triệu
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-2.5">
                    <p className="text-[11px] font-semibold text-slate-800">
                      Data Analyst
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      TP. HCM · 20 - 30 triệu
                    </p>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 p-3 text-[11px] text-white shadow-lg shadow-sky-200">
                  <div>
                    <p className="font-semibold">Tạo hồ sơ của bạn</p>
                    <p className="text-[10px] text-sky-50">
                      Hơn 50+ nhà tuyển dụng có thể xem CV của bạn mỗi ngày.
                    </p>
                  </div>
                  <Link
                    href="/register"
                    className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium"
                  >
                    Bắt đầu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

