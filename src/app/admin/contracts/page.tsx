"use client";

import { useEffect, useState } from "react";
import { Briefcase, CreditCard, RefreshCw, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { fetchAdminContracts } from "@/services/admin";

export default function AdminContractsPage() {
  const [q, setQ] = useState("");
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAdminContracts();
        if (!cancelled) setContracts(data);
      } catch {
        if (!cancelled) setContracts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = contracts.filter((c) => {
    if (!q) return true;
    const text = `${c.id} ${c.client?.name} ${c.freelancer?.name} ${c.status}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  return (
    <div>
      <AdminPageHeader
        title="Quản lý Hợp đồng"
        subtitle="Theo dõi tiến độ và trạng thái các hợp đồng trên nền tảng."
        actions={
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => {
              setLoading(true);
              fetchAdminContracts().then(setContracts).finally(() => setLoading(false));
              push({ title: "Đã làm mới", description: "Tải lại danh sách hợp đồng.", variant: "info" });
            }}
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </Button>
        }
      />

      <div className="rounded-3xl border border-zinc-800/40 bg-[#09090B] p-6 sm:p-8 shadow-sm shadow-zinc-950/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div className="w-full max-w-sm">
             <Input label="Tìm kiếm hợp đồng" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên Client, Freelancer, Status..." className="bg-zinc-900 border-zinc-700 text-white" />
          </div>
          <div className="text-sm font-semibold text-zinc-400 mt-2 sm:mt-0">Tổng: {list.length} hợp đồng</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#050505]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050505] text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 font-semibold">
              <tr>
                <th className="px-4 py-3">ID Hợp đồng</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Freelancer</th>
                <th className="px-4 py-3">Giá trị</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-200">
                    <span className="font-mono text-xs text-zinc-400">{c.id.substring(0, 8)}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-indigo-400">{c.client?.name || "N/A"}</td>
                  <td className="px-4 py-3 font-medium text-teal-400">{c.freelancer?.name || "N/A"}</td>
                  <td className="px-4 py-3 font-bold text-zinc-200">{Number(c.price).toLocaleString()} VNĐ</td>
                  <td className="px-4 py-3">
                     <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        c.status === 'ACTIVE' ? 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20' :
                        c.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
                     }`}>{c.status}</span>
                  </td>
                </tr>
              ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                    Không tìm thấy hợp đồng nào.
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
