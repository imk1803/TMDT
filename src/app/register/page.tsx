import { RegisterForm } from "@/components/auth/RegisterForm";
import { Container } from "@/components/ui/Container";

export default function RegisterPage() {
  return (
    <div className="relative overflow-hidden py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-200/25 blur-3xl" />
      </div>

      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 space-y-5 text-center lg:order-1 lg:text-left">
            <p className="inline-flex rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
              Bắt đầu cùng JobFinder
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Đăng ký tài khoản trong 1 phút
            </h1>
            <p className="max-w-xl text-sm text-slate-600 sm:text-base">
              Chọn vai trò phù hợp để hệ thống cá nhân hoá trải nghiệm ngay từ đầu. Sau khi đăng ký,
              bạn sẽ có onboarding ngắn để hoàn thiện hồ sơ thông minh.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Dành cho Nhà tuyển dụng</p>
                <p className="mt-1 text-xs text-slate-600">
                  Đăng tin nhanh, quản lý đề xuất tập trung và tạo hợp đồng chỉ vài thao tác.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Dành cho Freelancer</p>
                <p className="mt-1 text-xs text-slate-600">
                  Tối ưu hồ sơ, tìm job phù hợp và gửi đề xuất với quy trình rõ ràng.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <RegisterForm />
          </div>
        </div>
      </Container>
    </div>
  );
}

