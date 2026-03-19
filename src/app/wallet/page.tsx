"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import {
  fetchMyWallet,
  withdrawWallet,
  type WalletData,
  type WalletTransaction,
} from "@/services/wallet";

function toMoney(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString("vi-VN");
}

export default function WalletPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("BANK");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || user.role === "ADMIN") return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetchMyWallet();
        if (!cancelled) {
          setWallet(res.wallet);
          setTransactions(res.transactions || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          push({
            title: "Không tải được ví",
            description: err?.message || "Vui lòng thử lại.",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [push, user]);

  const available = useMemo(() => Number(wallet?.availableBalance ?? 0), [wallet?.availableBalance]);
  const held = useMemo(() => Number(wallet?.heldBalance ?? 0), [wallet?.heldBalance]);

  async function handleWithdraw() {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      push({
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập số tiền rút hợp lệ.",
        variant: "error",
      });
      return;
    }
    setWithdrawing(true);
    try {
      const res = await withdrawWallet(amount, withdrawMethod);
      setWallet(res.wallet);
      setTransactions((prev) => [res.transaction, ...prev]);
      setWithdrawAmount("");
      push({
        title: "Rút tiền thành công (demo)",
        description: "Dữ liệu ví đã được cập nhật trên hệ thống.",
        variant: "success",
      });
    } catch (err: any) {
      push({
        title: "Không thể rút tiền",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setWithdrawing(false);
    }
  }

  if (loading || loadingData) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải ví...
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Ví của tôi</h1>
              <p className="text-sm text-slate-500">
                Luồng ví demo: nạp/rút/thanh toán chỉ cập nhật dữ liệu trên database.
              </p>
            </div>
            <Link href="/wallet/topup">
              <Button size="sm">Nạp tiền</Button>
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs text-emerald-700">Số dư khả dụng</p>
              <p className="mt-1 text-xl font-semibold text-emerald-800">{toMoney(available)}đ</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
              <p className="text-xs text-amber-700">Số dư tạm giữ</p>
              <p className="mt-1 text-xl font-semibold text-amber-800">{toMoney(held)}đ</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Rút tiền (demo)</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Số tiền muốn rút"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="BANK">Chuyển khoản ngân hàng</option>
                <option value="EWALLET">Ví điện tử</option>
              </select>
              <Button type="button" onClick={handleWithdraw} disabled={withdrawing}>
                {withdrawing ? "Đang xử lý..." : "Rút tiền"}
              </Button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Lịch sử giao dịch</p>
            <div className="mt-3 space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {toMoney(tx.amount)}đ
                  </p>
                  <p className="text-xs text-slate-500">
                    {tx.description || "Giao dịch ví"} · {new Date(tx.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-sm text-slate-500">Chưa có giao dịch nào.</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
