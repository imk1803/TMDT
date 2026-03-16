import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-white/80">
      <Container className="flex flex-col gap-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <div>
          <p className="font-medium text-slate-700">
            JobFinder &copy; {new Date().getFullYear()}
          </p>
          <p className="text-[11px] sm:text-xs">
            Nền tảng kết nối ứng viên và nhà tuyển dụng hiện đại tại Việt Nam.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="hover:text-slate-700">Điều khoản</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="hover:text-slate-700">Chính sách bảo mật</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="hover:text-slate-700">Hỗ trợ</span>
        </div>
      </Container>
    </footer>
  );
}

