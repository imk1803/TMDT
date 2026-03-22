"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Send, CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getTicketDetail, replyToTicket, updateAdminSupportTicket, SupportTicket, SupportStatus, SupportPriority } from "@/services/support";

export default function AdminTicketDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { push } = useToast();
  
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
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
    } catch {
      push({ title: "Lỗi", description: "Không thể tải ticket.", variant: "error" });
      router.push("/admin/support");
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
      setTicket(prev => prev ? { 
        ...prev, 
        messages: [...(prev.messages || []), res.message] 
      } : null);
      setReplyText("");
    } catch (err: any) {
      push({ title: "Lỗi", description: err.message, variant: "error" });
    } finally {
      setSending(false);
    }
  };

  const handleUpdate = async (updates: { status?: SupportStatus, priority?: SupportPriority }) => {
    if (!ticket) return;
    setUpdating(true);
    try {
      await updateAdminSupportTicket(ticket.id, updates);
      setTicket(prev => prev ? { ...prev, ...updates } : null);
      push({ title: "Cập nhật thành công", description: "Trạng thái đã được lưu.", variant: "success" });
    } catch (err: any) {
      push({ title: "Lỗi", description: err.message, variant: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return <div className="text-zinc-500 py-12 text-center">Đang tải...</div>;
  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
         <Link href="/admin/support" className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 transition">
            <ArrowLeft className="h-5 w-5" />
         </Link>
         <div>
            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
               Ticket #{ticket.id.slice(-8).toUpperCase()}
               {ticket.type === "DISPUTE" && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-md tracking-wider">KHIẾU NẠI</span>}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">{ticket.title}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col h-[calc(100vh-200px)] bg-[#09090B] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
           <div className="flex-1 overflow-y-auto p-6 bg-[#050505]/50">
             <div className="space-y-6">
                <div className="flex flex-col gap-1 items-start">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-zinc-300">{ticket.sender?.name}</span>
                      <span className="text-[10px] text-zinc-500 font-medium">Báo cáo ban đầu</span>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-[15px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
                     {ticket.description}
                   </div>
                </div>

                {ticket.messages?.map((msg) => {
                  const isAdmin = msg.sender?.role === "ADMIN";
                  
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                       <div className="flex items-center gap-2 mb-1">
                          {!isAdmin && <span className="text-xs font-semibold text-zinc-300">{msg.sender?.name}</span>}
                          {isAdmin && <span className="text-[10px] text-blue-400 font-semibold">FastJob Admin (Bạn)</span>}
                          <span className="text-[10px] text-zinc-600">{format(new Date(msg.createdAt), "HH:mm, dd/MM")}</span>
                       </div>
                       <div className={`px-4 py-3 max-w-[85%] text-[15px] whitespace-pre-wrap leading-relaxed ${
                         isAdmin ? "bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-2xl rounded-tr-sm" : 
                         "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl rounded-tl-sm"
                       }`}>
                         {msg.message}
                       </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
             </div>
           </div>

           <div className="p-4 border-t border-zinc-800 bg-[#09090B] flex-shrink-0">
               <form onSubmit={handleReply} className="flex gap-3">
                 <input 
                   className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:bg-zinc-900/50 focus:ring-1 focus:ring-blue-500 transition-all text-zinc-200 placeholder:text-zinc-500"
                   placeholder="Nhập tin nhắn phản hồi cho người dùng..."
                   value={replyText}
                   onChange={e => setReplyText(e.target.value)}
                   disabled={sending}
                 />
                 <Button type="submit" disabled={!replyText.trim() || sending} className="px-6 rounded-xl shrink-0 gap-2 bg-blue-600 hover:bg-blue-500 text-white">
                   {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Gửi</>}
                 </Button>
               </form>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#09090B] border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest mb-4">Quản lý Ticket</h3>
              
              <div className="space-y-5">
                <div>
                   <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Trạng thái hiện tại</label>
                   <select 
                     value={ticket.status} 
                     onChange={(e) => handleUpdate({ status: e.target.value as SupportStatus })}
                     disabled={updating}
                     className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                   >
                      <option value="OPEN">Mở (Chưa xử lý)</option>
                      <option value="IN_PROGRESS">Đang xử lý</option>
                      <option value="RESOLVED">Đã giải quyết</option>
                      <option value="CLOSED">Đóng (Hủy)</option>
                   </select>
                </div>

                <div>
                   <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Cấp độ ưu tiên</label>
                   <select 
                     value={ticket.priority} 
                     onChange={(e) => handleUpdate({ priority: e.target.value as SupportPriority })}
                     disabled={updating}
                     className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                   >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Khẩn cấp (Cao)</option>
                   </select>
                </div>
              </div>

              {ticket.type === "DISPUTE" && (
                <div className="mt-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                   <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
                     <AlertTriangle className="h-4 w-4" /> CẢNH BÁO DISPUTE
                   </div>
                   <p className="text-xs text-rose-300 leading-relaxed">
                     Hợp đồng và thanh toán (Milestones) liên quan đến khiếu nại này sẻ bị khoá. Vui lòng CHỈ chuyển trạng thái về "Đã giải quyết" hoặc "Đóng" sau khi đạt được thỏa thuận cuối cùng.
                   </p>
                </div>
              )}
           </div>

           {ticket.contract && (
             <div className="bg-[#09090B] border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest mb-4">Thông tin Hợp đồng</h3>
                <Link href={`/admin/contracts/${ticket.contract.id}`} className="block group">
                  <div className="text-[15px] font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors leading-tight">
                    {ticket.contract.job.title}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2 font-medium bg-zinc-900 border border-zinc-800 rounded-md p-2">
                     <span className="text-zinc-400">Trạng thái:</span> {ticket.contract.status}
                  </div>
                </Link>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
