import { RegisterForm } from "@/components/auth/RegisterForm";
import { Container } from "@/components/ui/Container";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center py-8 sm:py-10">
      <Container className="flex flex-col items-center justify-center gap-8 md:flex-row-reverse">
        <div className="max-w-md space-y-3 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 sm:text-xs">
            Bắt đầu cùng JobFinder
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Đăng ký tài khoản ứng viên trong 1 phút
          </h1>
          <p className="text-sm text-slate-500 sm:text-base">
            Tạo hồ sơ một lần, ứng tuyển nhiều việc làm chất lượng. Hoàn toàn
            miễn phí cho ứng viên.
          </p>
        </div>
        <RegisterForm />
      </Container>
    </div>
  );
}

