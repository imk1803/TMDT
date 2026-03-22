"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  targetName: string;
  onSuccess?: () => void;
}

export function ReviewModal({ isOpen, onClose, contractId, targetName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const { apiFetch } = await import("@/services/api");
      const { getAccessToken } = await import("@/services/storage");
      const token = getAccessToken();
      
      const res = await apiFetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ contractId, rating, comment })
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md p-8 overflow-hidden bg-white border border-slate-100 rounded-[24px] shadow-2xl"
        >
          {/* Close Button */}
          {!submitted && (
             <button 
               onClick={onClose}
               className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
          )}

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 ring-2 ring-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cảm ơn bạn!</h3>
              <p className="text-slate-500 text-sm">Đánh giá của bạn đã được ghi nhận.</p>
            </motion.div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Đánh giá đối tác</h2>
                <p className="text-sm text-slate-500">
                  Phản hồi của bạn giúp <strong>{targetName}</strong> xây dựng uy tín trên nền tảng.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                            : "fill-slate-100 text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-medium text-amber-500 h-5">
                   {rating === 1 && "Rất tệ"}
                   {rating === 2 && "Tệ"}
                   {rating === 3 && "Tạm ổn"}
                   {rating === 4 && "Tốt"}
                   {rating === 5 && "Tuyệt vời!"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nhận xét (không bắt buộc)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm làm việc của bạn..."
                    className="w-full h-28 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="w-full h-12 text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg shadow-sky-500/20 transition-all"
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
