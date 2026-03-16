import { LoginForm } from "@/components/auth/LoginForm";
import { Container } from "@/components/ui/Container";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center py-8 sm:py-10">
      <Container className="flex flex-col items-center justify-center gap-8 md:flex-row">
        <div className="max-w-md space-y-3 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 sm:text-xs">
            Chào mừng trở lại
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Đăng nhập để tiếp tục hành trình sự nghiệp
          </h1>
          <p className="text-sm text-slate-500 sm:text-base">
            Quản lý hồ sơ, theo dõi trạng thái ứng tuyển và nhận gợi ý công việc
            phù hợp với bạn.
          </p>
        </div>
        <LoginForm />
      </Container>
    </div>
  );
}

