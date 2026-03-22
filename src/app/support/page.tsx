"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MessageSquare, AlertCircle, Clock, CheckCircle, ChevronRight, Inbox } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getMyTickets, SupportTicket } from "@/services/support";
import { CreateTicketModal } from "@/components/support/CreateTicketModal";

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMyTickets();
      setTickets(res.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10"><Clock className="mr-1 h-3 w-3" /> Mở</span>;
      case "IN_PROGRESS":
        return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-700/10"><RefreshCw className="mr-1 h-3 w-3 animate-spin" /> Đang xử lý</span>;
      case "RESOLVED":
        return <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-700/10"><CheckCircle className="mr-1 h-3 w-3" /> Đã giải quyết</span>;
      case "CLOSED":
        return <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-700/10">Đã đóng</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "DISPUTE" ? (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800"><AlertCircle className="mr-1 h-3 w-3" /> Khiếu nại</span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800"><MessageSquare className="mr-1 h-3 w-3" /> Hỗ trợ</span>
    );
  };

  return (
    <Container className="py-8 lg:py-12 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trung tâm Hỗ trợ</h1>
          <p className="mt-2 text-slate-500">Quản lý các yêu cầu hỗ trợ và khiếu nại của bạn.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Gửi yêu cầu mới
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : tickets.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/support/${t.id}`} className="block hover:bg-slate-50 transition-colors p-4 sm:p-6 group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        {getTypeBadge(t.type)}
                        {getStatusBadge(t.status)}
                        <span className="text-xs text-slate-500 hidden sm:inline-block">
                          {format(new Date(t.createdAt), "dd MMM yyyy, HH:mm", { locale: vi })}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {t.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 truncate">{t.description}</p>
                      {t.contract && (
                        <p className="mt-2 text-xs font-medium text-slate-600 bg-slate-100 inline-flex px-2 py-1 rounded-md">
                          Hợp đồng: {t.contract.job.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex flex-col items-end text-sm text-slate-500">
                        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {t._count?.messages || 0}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <Inbox className="h-8 w-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có yêu cầu nào</h3>
             <p className="text-slate-500 mb-6 max-w-sm">Bạn hiện không có yêu cầu hỗ trợ hoặc khiếu nại nào. Bạn có thể tạo mới nếu cần trợ giúp.</p>
             <Button variant="outline" onClick={() => setIsModalOpen(true)}>Tạo yêu cầu</Button>
          </div>
        )}
      </div>

      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          load();
        }} 
      />
    </Container>
  );
}

// Dummy RefreshCw icon just in case
const RefreshCw = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);
