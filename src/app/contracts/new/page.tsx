"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function CreateContractPage() {
  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Luồng này đã được cập nhật</h1>
          <p className="mt-2 text-sm text-slate-700">
            Hợp đồng sẽ được tạo tự động khi client chấp nhận proposal của freelancer.
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Vui lòng vào trang quản lý đề xuất để chấp nhận proposal.
          </p>

          <div className="mt-5">
            <Link href="/proposals">
              <Button>Đi tới Quản lý đề xuất</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
