"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, DollarSign, RefreshCw, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { fetchAdminTransactions } from "@/services/admin";

export default function AdminFinancesPage() {
  const [q, setQ] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAdminTransactions();
        if (!cancelled) setTransactions(data);
      } catch {
        if (!cancelled) setTransactions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = transactions.filter((t) => {
    if (!q) return true;
    const text = `${t.id} ${t.user?.name} ${t.type} ${t.description}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  return (
    <div>
      <AdminPageHeader
        title="Quản lý Tài chính"
        subtitle="Lịch sử giao dịch và doanh thu dịch vụ toàn nền tảng."
        actions={
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => {
              setLoading(true);
              fetchAdminTransactions().then(setTransactions).finally(() => setLoading(false));
              push({ title: "Đã làm mới", description: "Tải lại lịch sử giao dịch.", variant: "info" });
            }}
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </Button>
        }
      />

      <div className="rounded-3xl border border-zinc-800/40 bg-[#09090B] p-6 sm:p-8 shadow-sm shadow-zinc-950/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div className="w-full max-w-sm">
             <Input label="Tìm kiếm giao dịch" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên User, Lý do, Mã giao dịch..." className="bg-zinc-900 border-zinc-700 text-white" />
          </div>
          <div className="text-sm font-semibold text-zinc-400 mt-2 sm:mt-0">Tổng: {list.length} giao dịch</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#050505]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050505] text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 font-semibold">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Phân loại</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Mã GD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {list.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-300">
                    {new Date(t.createdAt).toLocaleDateString('vi-VN')} {new Date(t.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-200">{t.user?.name || "N/A"}</td>
                  <td className="px-4 py-3">
                     <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        t.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
                     }`}>{t.type}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-zinc-200">
                     <span className={t.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}>
                        {t.type === 'CREDIT' ? '+' : '-'}{Number(t.amount).toLocaleString()} VNĐ
                     </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 max-w-xs truncate" title={t.description}>{t.description}</td>
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{t.id.substring(0, 8)}</td>
                </tr>
              ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500 flex flex-col items-center justify-center">
                    <Wallet className="h-10 w-10 text-zinc-700 mb-3" />
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
