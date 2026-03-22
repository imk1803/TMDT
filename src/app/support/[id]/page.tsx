"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Clock, CheckCircle, RefreshCw, Send, AlertCircle, MessageSquare } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getTicketDetail, replyToTicket, SupportTicket, SupportMessage } from "@/services/support";
import { useAuth } from "@/components/auth/AuthProvider";

export default function TicketDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();
  const { push } = useToast();
  
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getTicketDetail(id);
      setTicket(res.ticket);
    } catch (err: any) {
      push({ title: "Lỗi", description: "Không thể tải nội dung khiếu nại.", variant: "error" });
      router.push("/support");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;

    setSending(true);
    try {
      const res = await replyToTicket(ticket.id, replyText);
      const newMsg = res.message;
      setTicket(prev => prev ? { 
        ...prev, 
        messages: [...(prev.messages || []), newMsg] 
      } : null);
      setReplyText("");
    } catch (err: any) {
      push({ title: "Lỗi gửi tin", description: err.message, variant: "error" });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10"><Clock className="mr-1.5 h-3.5 w-3.5" /> Mở</span>;
      case "IN_PROGRESS": return <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-700/10"><RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Đang xử lý</span>;
      case "RESOLVED": return <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-700/10"><CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Đã giải quyết</span>;
      case "CLOSED": return <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-700/10">Đã đóng</span>;
      default: return <span>{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "DISPUTE" ? (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800"><AlertCircle className="mr-1.5 h-3.5 w-3.5" /> Khiếu nại</span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Hỗ trợ</span>
    );
  };

  if (loading) return <div className="min-h-screen flex text-center justify-center p-20 text-slate-500">Đang tải...</div>;
  if (!ticket) return null;

  const isClosed = ticket.status === "CLOSED" || ticket.status === "RESOLVED";

  return (
    <Container className="py-8 lg:py-12 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
         <Link href="/support" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Trung tâm
         </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Chat Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
           <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
             <div className="flex items-start justify-between gap-4">
               <div>
                  <h1 className="text-xl font-bold text-slate-900">{ticket.title}</h1>
                  <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">Ticket #{ticket.id.slice(-8).toUpperCase()} • Tạo lúc {format(new Date(ticket.createdAt), "HH:mm, dd/MM/yyyy")}</p>
               </div>
               <div className="flex flex-col gap-2 items-end">
                 {getStatusBadge(ticket.status)}
                 {getTypeBadge(ticket.type)}
               </div>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="space-y-6">
                {/* Original Ticket Description as first message */}
                <div className="flex flex-col gap-1 items-start">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">{ticket.sender?.name || "Người dùng"}</span>
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 rounded-full">Chủ ticket</span>
                   </div>
                   <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                     {ticket.description}
                   </div>
                </div>

                {/* Messages Loop */}
                {ticket.messages?.map((msg) => {
                  const isMe = msg.sender?.id === user?.id;
                  const isAdmin = msg.sender?.role === "ADMIN";
                  
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                       <div className="flex items-center gap-2 mb-1">
                          {!isMe && <span className="text-xs font-semibold text-slate-700">{msg.sender?.name || "Người dùng"}</span>}
                          {isAdmin && <span className="text-[10px] text-indigo-50 font-semibold bg-indigo-500 px-2 rounded-full">Quản trị viên FastJob</span>}
                          <span className="text-[10px] text-slate-400">{format(new Date(msg.createdAt), "HH:mm, dd/MM")}</span>
                          {isMe && <span className="text-xs font-semibold text-blue-700">Bạn</span>}
                       </div>
                       <div className={`px-4 py-3 max-w-[85%] text-[15px] whitespace-pre-wrap leading-relaxed shadow-sm ${
                         isMe ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" : 
                         isAdmin ? "bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-2xl rounded-tl-sm shadow-indigo-100" :
                         "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm"
                       }`}>
                         {msg.message}
                       </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
           </div>

           <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
             {isClosed ? (
               <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-500">
                 Ticket này đã được giải quyết hoặc đóng. Bạn không thể gửi thêm tin nhắn.
               </div>
             ) : (
               <form onSubmit={handleReply} className="flex gap-3">
                 <input 
                   className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                   placeholder="Nhập tin nhắn để phản hồi..."
                   value={replyText}
                   onChange={e => setReplyText(e.target.value)}
                   disabled={sending}
                 />
                 <Button type="submit" disabled={!replyText.trim() || sending} className="px-6 rounded-xl shrink-0 gap-2">
                   {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Gửi</>}
                 </Button>
               </form>
             )}
           </div>
        </div>

        {/* Right Sidebar Meta */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
           {ticket.contract && (
             <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3">Thông tin Hợp đồng</h3>
               <Link href={`/contracts/${ticket.contract.id}`} className="block group">
                 <div className="text-[15px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                   {ticket.contract.job.title}
                 </div>
                 <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium bg-slate-50 rounded-md p-2">
                    Nhấp để mở chi tiết hợp đồng
                 </div>
               </Link>
             </div>
           )}

           <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3">Mức độ ưu tiên</h3>
             <div>
               {ticket.priority === "HIGH" && <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 tracking-wide">KHẨN CẤP CAO</span>}
               {ticket.priority === "MEDIUM" && <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 tracking-wide">TRUNG BÌNH</span>}
               {ticket.priority === "LOW" && <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 tracking-wide">THẤP</span>}
             </div>
           </div>
        </div>
      </div>
    </Container>
  );
}
