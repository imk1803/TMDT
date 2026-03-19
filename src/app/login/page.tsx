import { LoginForm } from "@/components/auth/LoginForm";
import { Container } from "@/components/ui/Container";

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-200/25 blur-3xl" />
      </div>

      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 space-y-5 text-center lg:order-1 lg:text-left">
            <p className="inline-flex rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
              Chào mừng trở lại
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Đăng nhập để tiếp tục hành trình nghề nghiệp
            </h1>
            <p className="max-w-xl text-sm text-slate-600 sm:text-base">
              Quản lý hồ sơ, theo dõi trạng thái ứng tuyển và làm việc hiệu quả với hệ sinh thái
              tuyển dụng hiện đại của JobFinder.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Quản lý tập trung</p>
                <p className="mt-1 text-xs text-slate-600">
                  Theo dõi job, đề xuất, hợp đồng và các thông báo trong một nơi duy nhất.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Bảo mật cao</p>
                <p className="mt-1 text-xs text-slate-600">
                  Hệ thống xác thực token an toàn và phân quyền rõ ràng theo vai trò.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <LoginForm />
          </div>
        </div>
      </Container>
    </div>
  );
}

