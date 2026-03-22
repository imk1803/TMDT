"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createSupportTicket, SupportType, SupportPriority } from "@/services/support";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultContractId?: string;
  defaultType?: SupportType;
}

export function CreateTicketModal({ isOpen, onClose, onSuccess, defaultContractId, defaultType }: CreateTicketModalProps) {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: defaultType || "SUPPORT",
    priority: "MEDIUM" as SupportPriority,
    contractId: defaultContractId || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      push({ title: "Lỗi", description: "Vui lòng nhập đủ tiêu đề và nội dung.", variant: "error" });
      return;
    }
    
    setLoading(true);
    try {
      await createSupportTicket({
        title: formData.title,
        description: formData.description,
        type: formData.type as SupportType,
        priority: formData.priority,
        contractId: formData.contractId || undefined,
      });
      push({ title: "Thành công", description: "Đã gửi yêu cầu hỗ trợ.", variant: "success" });
      onSuccess();
    } catch (err: any) {
      push({ title: "Lỗi", description: err?.message || "Không thể gửi yêu cầu.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm relative animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative z-10">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            {formData.type === "DISPUTE" ? "Tạo Khiếu nại" : "Tạo Yêu cầu hỗ trợ"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Loại yêu cầu <span className="text-rose-500">*</span></label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value as SupportType})}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-700"
              >
                <option value="SUPPORT">Hỗ trợ thông thường</option>
                <option value="DISPUTE">Khiếu nại hợp đồng</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Mức độ ưu tiên</label>
              <select 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value as SupportPriority})}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-700"
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao / Khẩn cấp</option>
              </select>
            </div>
          </div>

          {formData.type === "DISPUTE" && (
            <div className="space-y-1.5">
               <Input 
                 label="Mã hợp đồng (Bắt buộc cho Khiếu nại)" 
                 placeholder="Ví dụ: clxyz..." 
                 value={formData.contractId} 
                 onChange={e => setFormData({...formData, contractId: e.target.value})} 
               />
               <p className="text-[11px] text-amber-600 font-medium">Lưu ý: Bạn phải cung cấp đúng ID hợp đồng để hệ thống đóng băng thanh toán liên quan.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Input 
              label="Tiêu đề yêu cầu *" 
              placeholder="Tóm tắt vấn đề của bạn..." 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Mô tả chi tiết <span className="text-rose-500">*</span></label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400 min-h-[120px] resize-none"
              placeholder="Mô tả cụ thể vấn đề bạn đang gặp phải để chúng tôi có thể hỗ trợ tốt nhất..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gửi yêu cầu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
