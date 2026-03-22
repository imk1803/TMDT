"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageSquare, AlertCircle, RefreshCw, Filter, ShieldAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { getAdminSupportTickets, SupportTicket } from "@/services/support";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const { push } = useToast();

  useEffect(() => {
    load();
  }, [statusFilter, typeFilter]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminSupportTickets({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setTickets(res.tickets || []);
    } catch {
      push({ title: "Lỗi", description: "Không thể tải danh sách ticket.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "OPEN": return "text-blue-400 bg-blue-500/10 ring-blue-500/20";
      case "IN_PROGRESS": return "text-amber-400 bg-amber-500/10 ring-amber-500/20";
      case "RESOLVED": return "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20";
      default: return "text-zinc-400 bg-zinc-500/10 ring-zinc-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "HIGH": return "text-rose-400";
      case "MEDIUM": return "text-amber-400";
      default: return "text-zinc-400";
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý Hỗ trợ & Khiếu nại"
        subtitle="Tiếp nhận, xử lý và phân xử các khiếu nại tranh chấp hợp đồng."
        actions={
          <Button
            variant="secondary" size="sm" className="gap-2"
            onClick={() => load()}
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </Button>
        }
      />

      <div className="rounded-3xl border border-zinc-800/40 bg-[#09090B] p-6 sm:p-8 shadow-sm shadow-zinc-950/50">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-sm outline-none w-full sm:w-auto"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="OPEN">Đang mở (Mới)</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-sm outline-none w-full sm:w-auto"
            >
              <option value="">Tất cả loại</option>
              <option value="SUPPORT">Hỗ trợ thông thường</option>
              <option value="DISPUTE">Khiếu nại hợp đồng (Dispute)</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#050505]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050505] text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 font-semibold">
              <tr>
                <th className="px-4 py-3">Mã Ticket</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Người Gửi</th>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thời gian tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-800/40 transition-colors group">
                  <td className="px-4 py-3 font-mono text-zinc-400">
                    <Link href={`/admin/support/${t.id}`} className="hover:text-blue-400">#{t.id.slice(-8).toUpperCase()}</Link>
                  </td>
                  <td className="px-4 py-3">
                    {t.type === "DISPUTE" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
                        <ShieldAlert className="h-3 w-3" /> Khiếu nại
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20">
                        <MessageSquare className="h-3 w-3" /> Hỗ trợ
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{t.sender?.name}</td>
                  <td className="px-4 py-3 font-medium text-zinc-200 truncate max-w-[200px]">
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-bold ${getPriorityColor(t.priority)} truncate`}>[{t.priority}]</span>
                       <Link href={`/admin/support/${t.id}`} className="hover:underline">{t.title}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ring-1 ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {format(new Date(t.createdAt), "dd/MM/yyyy HH:mm")}
                  </td>
                </tr>
              ))}
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                    Không tìm thấy yêu cầu nào.
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
