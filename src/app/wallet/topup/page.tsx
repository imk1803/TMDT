"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { topUpWallet } from "@/services/wallet";

const topupMethods = [
  {
    id: "QR",
    title: "Nạp số dư tự động bằng quét mã QR",
    fee: "Quét mã QR PAY trên ứng dụng Mobile Banking, phí giao dịch 0.9%",
    icon: "▦",
  },
  {
    id: "ATM",
    title: "Nạp số dư tự động bằng thẻ ngân hàng",
    fee: "Phí 0.9% + 900đ",
    icon: "💳",
  },
  {
    id: "CARD",
    title: "Thanh toán bằng thẻ Master/Visa/JCB",
    fee: "Phí 2.36% + 2.660đ",
    icon: "🪪",
  },
];

export default function WalletTopupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [selectedMethod, setSelectedMethod] = useState("QR");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  const amountNumber = useMemo(() => Number(amount), [amount]);

  async function handleSubmit() {
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      push({
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập số tiền nạp lớn hơn 0.",
        variant: "error",
      });
      return;
    }
    setSubmitting(true);
    try {
      await topUpWallet(amountNumber, selectedMethod);
      push({
        title: "Nạp tiền thành công (demo)",
        description: "Số dư ví đã được cập nhật trong hệ thống.",
        variant: "success",
      });
      router.push("/wallet");
    } catch (err: any) {
      push({
        title: "Không thể nạp tiền",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải...
          </div>
        </Container>
      </div>
    );
  }

  if (!user || user.role === "ADMIN") return null;

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <h1 className="text-3xl font-semibold text-slate-900">Nạp tiền vào tài khoản</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bạn có thể chọn các phương thức thanh toán khả dụng bên dưới.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
            {topupMethods.map((method) => {
              const active = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex w-full items-start gap-3 border-b border-slate-200 px-4 py-4 text-left last:border-b-0 ${
                    active ? "bg-sky-50" : "bg-white"
                  }`}
                >
                  <div className="mt-0.5 text-xl">{method.icon}</div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{method.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{method.fee}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Nhập số tiền cần nạp</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 500000"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <Button type="button" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Đang nạp..." : "Nạp ngay"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Môi trường demo: thao tác nạp sẽ cập nhật trực tiếp dữ liệu ví trong database.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
