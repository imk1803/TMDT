"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { fetchJobProposals, submitProposal, updateProposalStatus } from "@/services/proposals";
import { updateJob } from "@/services/jobs";
import { getAccessToken } from "@/services/storage";
import { Flag, MapPin, Briefcase, CalendarDays, CheckCircle2, Target, Star } from "lucide-react";
import { motion } from "framer-motion";

const PERCENT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface JobDetail {
  id: string;
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  title: string;
  description?: string | null;
  budget?: number | string | null;
  budgetType?: string | null;
  durationText?: string | null;
  location?: string | null;
  workMode?: string | null;
  experienceLevel?: string | null;
  deadlineAt?: string | null;
  categoryName?: string;
  tags?: string[];
  clientId?: string;
  client?: {
    id: string;
    name?: string | null;
    clientProfile?: {
      companyName?: string | null;
      avgRating?: number | null;
    } | null;
  } | null;
  milestones?: {
    id?: string;
    title: string;
    amount: number | string;
    dueDate?: string | null;
  }[];
}

interface ProposalRow {
  id: string;
  coverLetter?: string | null;
  bidAmount: number | string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt?: string;
  contractId?: string;
  freelancer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    freelancerProfile?: {
      title?: string | null;
      bio?: string | null;
      hourlyRate?: number | string | null;
      avgRating?: number | null;
      completedJobs?: number | null;
      onTimeRate?: number | null;
    } | null;
  } | null;
}

function proposalStatusMeta(status: ProposalRow["status"]) {
  if (status === "ACCEPTED") {
    return {
      label: "Đã chấp nhận",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    };
  }
  if (status === "REJECTED") {
    return {
      label: "Đã từ chối",
      className: "bg-rose-50 text-rose-700 border border-rose-100",
    };
  }
  if (status === "WITHDRAWN") {
    return {
      label: "Đã rút đề xuất",
      className: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }
  return {
    label: "Đang chờ",
    className: "bg-amber-50 text-amber-700 border border-amber-100",
  };
}

function formatVnd(amount?: number | string | null) {
  if (!amount) return "Thỏa thuận";
  const num = Number(amount);
  if (!Number.isFinite(num)) return "Thỏa thuận";
  return num.toLocaleString("vi-VN") + " VND";
}

export default function JobDetailPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const { id } = useParams();
  const jobId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [bidAmount, setBidAmount] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const [milestoneDraft, setMilestoneDraft] = useState({
    title: "",
    percent: 10,
    dueDate: "",
  });
  const [milestones, setMilestones] = useState<
    Array<{ title: string; percent: number; dueDate?: string | null }>
  >([]);
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null);
  const [savingMilestones, setSavingMilestones] = useState(false);
  const [showBoostConfirm, setShowBoostConfirm] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await apiFetch<{ job: any }>(`/api/jobs/${jobId}`);
        if (!cancelled) {
          const mappedJob = {
            ...res.job,
            tags: res.job.skills?.map((s: any) => s.skill?.name).filter(Boolean) || [],
            categoryName: res.job.category?.name || "Chưa phân loại",
          };
          setJob(mappedJob);
          const budget = Number(res.job?.budget || 0);
          const mapped = (res.job?.milestones || []).map((milestone: any) => ({
            title: milestone.title,
            percent: percentFromAmount(Number(milestone.amount || 0), budget),
            dueDate: milestone.dueDate || "",
          }));
          setMilestones(mapped);
        }
      } catch {
        if (!cancelled) setJob(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const canApply = user?.role === "FREELANCER" && user.id !== job?.client?.id;
  const canManageProposals = user?.role === "CLIENT" && !!job && job.clientId === user.id;
  const canViewProposals = !!user && (user.role === "CLIENT" || user.role === "FREELANCER" || user.role === "ADMIN");
  const canEditMilestones = user?.role === "CLIENT" && !!job && job.clientId === user.id;

  useEffect(() => {
    if (!jobId || !canViewProposals) {
      setProposals([]);
      return;
    }
    const stableJobId = jobId;
    let cancelled = false;
    async function loadProposals() {
      try {
        setLoadingProposals(true);
        const res = await fetchJobProposals(stableJobId);
        if (!cancelled) setProposals((res.proposals || []) as ProposalRow[]);
      } catch (err: any) {
        if (!cancelled) {
          setProposals([]);
          push({
            title: "Không tải được đề xuất",
            description: err?.message || "Vui lòng thử lại.",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoadingProposals(false);
      }
    }
    loadProposals();
    return () => {
      cancelled = true;
    };
  }, [jobId, canViewProposals, push]);

  if (loading) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải công việc...
          </div>
        </Container>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Không tìm thấy công việc.
          </div>
        </Container>
      </div>
    );
  }

  if (user?.role === "FREELANCER" && job.status && job.status !== "OPEN") {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800 shadow-sm sm:p-8 sm:text-base">
            Công việc này đã chuyển sang trạng thái đang thực hiện và không còn mở
            cho freelancer truy cập.
          </div>
        </Container>
      </div>
    );
  }

  const companyName = job.client?.clientProfile?.companyName || job.client?.name || "Doanh nghiệp";
  const jobBudget = Number(job.budget || 0);
  const safeBudget = Number.isFinite(jobBudget) && jobBudget > 0 ? jobBudget : 0;
  const totalMilestonePercent = milestones.reduce((sum, item) => sum + item.percent, 0);

  function amountFromPercent(percent: number) {
    return Math.round((safeBudget * percent) / 100);
  }

  function percentFromAmount(amount: number, budget: number) {
    if (!budget || budget <= 0) return 10;
    const raw = Math.round((amount / budget) * 100);
    const snapped = Math.round(raw / 10) * 10;
    return Math.min(100, Math.max(10, snapped));
  }

  function resetMilestoneDraft() {
    setMilestoneDraft({ title: "", percent: 10, dueDate: "" });
    setEditingMilestoneIndex(null);
  }

  function handleAddOrUpdateMilestone() {
    const title = milestoneDraft.title.trim();
    const percent = Number(milestoneDraft.percent);
    if (title.length < 3) {
      push({
        title: "Tiêu đề milestone quá ngắn",
        description: "Vui lòng nhập tiêu đề tối thiểu 3 ký tự.",
        variant: "error",
      });
      return;
    }
    if (!PERCENT_OPTIONS.includes(percent)) {
      push({
        title: "Phần trăm milestone chưa hợp lệ",
        description: "Chỉ chấp nhận các mức 10% đến 100%.",
        variant: "error",
      });
      return;
    }
    if (editingMilestoneIndex === null && milestones.length >= 5) {
      push({
        title: "Tối đa 5 milestone",
        description: "Bạn không thể thêm nhiều hơn 5 milestone.",
        variant: "error",
      });
      return;
    }

    const payload = {
      title,
      percent,
      dueDate: milestoneDraft.dueDate || "",
    };

    const nextMilestones =
      editingMilestoneIndex !== null
        ? (milestones || []).map((item, idx) => (idx === editingMilestoneIndex ? payload : item))
        : [...(milestones || []), payload];
    const nextTotal = nextMilestones.reduce((sum, item) => sum + item.percent, 0);
    if (nextTotal > 100) {
      push({
        title: "Tổng phần trăm vượt quá 100%",
        description: "Vui lòng giảm % để tổng milestone không vượt 100%.",
        variant: "error",
      });
      return;
    }
    setMilestones(nextMilestones);
    resetMilestoneDraft();
  }

  function handleEditMilestone(index: number) {
    const target = milestones?.[index];
    if (!target) return;
    setEditingMilestoneIndex(index);
    setMilestoneDraft({
      title: target.title,
      percent: target.percent,
      dueDate: target.dueDate ? new Date(target.dueDate).toISOString().slice(0, 10) : "",
    });
  }

  function handleRemoveMilestone(index: number) {
    setMilestones((prev) => (prev || []).filter((_, idx) => idx !== index));
    if (editingMilestoneIndex === index) {
      resetMilestoneDraft();
    }
  }

  async function handleSaveMilestones() {
    if (!job) return;
    if (milestones.length < 1 || milestones.length > 5) {
      push({
        title: "Số milestone chưa hợp lệ",
        description: "Mỗi dự án cần từ 1 đến 5 milestone.",
        variant: "error",
      });
      return;
    }
    if (totalMilestonePercent !== 100) {
      push({
        title: "Tổng phần trăm milestone phải bằng 100%",
        description: "Vui lòng phân bổ lại % trước khi lưu.",
        variant: "error",
      });
      return;
    }

    try {
      setSavingMilestones(true);
      await updateJob(job.id, {
        milestones: (milestones || []).map((m) => ({
          title: m.title.trim(),
          percent: m.percent,
          dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined,
        })),
      });
      try {
        const refreshed = await apiFetch<{ job: JobDetail }>(`/api/jobs/${job.id}`);
        setJob(refreshed.job);
        const refreshedBudget = Number(refreshed.job?.budget || 0);
        const mapped = (refreshed.job?.milestones || []).map((milestone) => ({
          title: milestone.title,
          percent: percentFromAmount(Number(milestone.amount || 0), refreshedBudget),
          dueDate: milestone.dueDate || "",
        }));
        setMilestones(mapped);
      } catch {
        // best effort refresh
      }
      push({
        title: "Đã cập nhật milestone",
        description: "Template giai đoạn đã được lưu.",
        variant: "success",
      });
    } catch (err: any) {
      push({
        title: "Không thể cập nhật milestone",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setSavingMilestones(false);
    }
  }

  async function handleSubmitProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;
    const bid = Number.parseFloat(bidAmount);
    if (!Number.isFinite(bid) || bid < 0) {
      push({
        title: "Bid chưa hợp lệ",
        description: "Vui lòng nhập giá đề xuất hợp lệ.",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitProposal({
        jobId: job.id,
        bidAmount: bid,
        coverLetter: coverLetter.trim() || undefined,
      });
      const created = (res?.proposal || {}) as Partial<ProposalRow>;
      const optimistic: ProposalRow = {
        id: created.id || `local-${Date.now()}`,
        coverLetter: created.coverLetter ?? (coverLetter.trim() || null),
        bidAmount: created.bidAmount ?? bid,
        status: (created.status as ProposalRow["status"]) || "PENDING",
        createdAt: created.createdAt || new Date().toISOString(),
        freelancer: {
          id: user?.id || "",
          name: user?.name || user?.email || "Bạn",
          email: user?.email || "",
          freelancerProfile: null,
        },
      };
      setProposals((prev) => [optimistic, ...prev.filter((p) => p.id !== optimistic.id)]);

      try {
        const latest = await fetchJobProposals(job.id);
        setProposals((latest.proposals || []) as ProposalRow[]);
      } catch {
        // keep optimistic item if sync fails
      }
      push({
        title: "Gửi đề xuất thành công",
        description: "Nhà tuyển dụng sẽ xem xét đề xuất của bạn.",
        variant: "success",
      });
      setBidAmount("");
      setCoverLetter("");
    } catch (err: any) {
      push({
        title: "Không thể gửi đề xuất",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProposalStatus(proposalId: string, status: "ACCEPTED" | "REJECTED") {
    try {
      const res = await updateProposalStatus(proposalId, status);
      const contractId = res.contract?.id;

      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === proposalId) {
            return {
              ...p,
              status,
              contractId: contractId || p.contractId,
            };
          }
          if (status === "ACCEPTED" && p.status === "PENDING") {
            return { ...p, status: "REJECTED" };
          }
          return p;
        })
      );

      push({
        title: status === "ACCEPTED" ? "Đã chấp nhận đề xuất" : "Đã từ chối đề xuất",
        description:
          status === "ACCEPTED"
            ? "Hợp đồng đã được tạo tự động."
            : "Trạng thái đề xuất đã được cập nhật.",
        variant: "success",
      });
    } catch (err: any) {
      push({
        title: "Không thể cập nhật đề xuất",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    }
  }

  async function executeBoostJob() {
    if (!job) return;
    try {
      setSubmitting(true);
      setShowBoostConfirm(false);
      const token = getAccessToken();
      await apiFetch(`/api/jobs/${job.id}/boost`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      push({
        title: "Đẩy tin thành công",
        description: "Tin tuyển dụng của bạn đã được xuất hiện ưu tiên.",
        variant: "success",
      });
    } catch (err: any) {
      push({
        title: "Thao tác thất bại",
        description: err?.message || "Không thể đẩy tin. Vui lòng kiểm tra số dư ví.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <Container>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN (70%) */}
          <div className="w-full lg:w-[70%] space-y-6">
            
            {/* Header & Description Card */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
                {job.title}
              </h1>
              <p className="text-[15px] font-medium text-sky-700 mb-6 flex items-center gap-2">
                {companyName}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5" /> {job.location || "Từ xa"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  <Briefcase className="w-3.5 h-3.5" /> {job.workMode || "Linh hoạt"}
                </span>
                {job.categoryName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    <Target className="w-3.5 h-3.5" /> {job.categoryName}
                  </span>
                )}
              </div>

              <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-slate-600">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Mô tả dự án</h3>
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.tags && job.tags.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-[15px] font-bold text-slate-900 mb-3">Kỹ năng yêu cầu</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700 cursor-default hover:bg-slate-50 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Milestones Card */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Giai đoạn dự kiến (Milestones)</h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  Lộ trình thanh toán và công việc của dự án.
                </p>
              </div>
              {canEditMilestones && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleSaveMilestones}
                  disabled={savingMilestones}
                >
                  {savingMilestones ? "Đang lưu..." : "Lưu giai đoạn"}
                </Button>
              )}
            </div>

            {job.status === "IN_PROGRESS" && canEditMilestones && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Công việc đang ở trạng thái <span className="font-semibold">IN_PROGRESS</span>,
                không thể chỉnh sửa milestone template.
              </div>
            )}

            <div className="mt-4 space-y-3">
              {(milestones || []).map((milestone, index) => (
                <div
                  key={`${milestone.title}-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                        <Flag className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{milestone.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Tỷ lệ: {milestone.percent}%
                        </p>
                        {milestone.dueDate && (
                          <p className="text-[11px] text-slate-500">
                            Hạn: {new Date(milestone.dueDate).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-sky-700">
                      {amountFromPercent(milestone.percent).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="mt-3 h-px w-full bg-slate-100" />
                  {canEditMilestones && (
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditMilestone(index)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(index)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {(milestones || []).length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center py-12">
                  <CalendarDays className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-[15px] font-medium text-slate-600">Chưa có lộ trình cụ thể</p>
                  <p className="text-[13px] text-slate-500 mt-1 max-w-sm">Dự án này chưa được phân bổ milestone. Cả hai bên có thể thương lượng thêm trong quá trình trao đổi.</p>
                </div>
              )}
            </div>

            {canEditMilestones && job.status !== "IN_PROGRESS" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_0.7fr_0.7fr_auto]">
                <input
                  value={milestoneDraft.title}
                  onChange={(e) => setMilestoneDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Tên milestone"
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                />
                <select
                  value={milestoneDraft.percent}
                  onChange={(e) =>
                    setMilestoneDraft((prev) => ({ ...prev, percent: Number(e.target.value) }))
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                >
                  {PERCENT_OPTIONS.map((percent) => (
                    <option key={percent} value={percent}>
                      {percent}%
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={milestoneDraft.dueDate}
                  onChange={(e) => setMilestoneDraft((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                />
                <Button type="button" size="sm" onClick={handleAddOrUpdateMilestone}>
                  {editingMilestoneIndex !== null ? "Cập nhật" : "Thêm"}
                </Button>
              </div>
            )}
            <p className="mt-3 text-xs font-medium text-slate-600">
              Tổng phân bổ: {totalMilestonePercent}% / 100%
            </p>
            </motion.div>

            {/* Proposals List (Full width inside left col) */}
            {canViewProposals && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Đề xuất ứng tuyển ({proposals.length})</h3>
                    <p className="mt-1 text-[13px] text-slate-500">Danh sách freelancer đã nộp báo giá.</p>
                  </div>
                {canManageProposals ? (
                  <Link href="/jobs/my" className="text-xs font-medium text-sky-700 hover:text-sky-800">
                    Quay lại Tin tuyển dụng của tôi
                  </Link>
                ) : null}
              </div>

              <div className="mt-4 space-y-3">
                {loadingProposals && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    Đang tải đề xuất...
                  </div>
                )}

                {!loadingProposals && proposals.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    Chưa có freelancer nào ứng tuyển công việc này.
                  </div>
                )}

                {!loadingProposals &&
                  proposals.map((proposal) => {
                    const profile = proposal.freelancer?.freelancerProfile;
                    const freelancerName = proposal.freelancer?.name || "Freelancer";
                    const statusMeta = proposalStatusMeta(proposal.status);
                    const isOwnProposal = user?.role === "FREELANCER" && proposal.freelancer?.id === user.id;

                    return (
                      <div
                        key={proposal.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{freelancerName}</p>
                            <p className="text-xs text-slate-500">{proposal.freelancer?.email || ""}</p>
                            {profile?.title && (
                              <p className="mt-1 text-xs font-medium text-sky-700">{profile.title}</p>
                            )}
                            {isOwnProposal && (
                              <span className="mt-2 inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                                Đề xuất của bạn
                              </span>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                          <p>
                            Giá đề xuất:{" "}
                            <span className="font-semibold text-slate-900">
                              {Number(proposal.bidAmount).toLocaleString("vi-VN")} VND
                            </span>
                          </p>
                          <p>
                            Đánh giá:{" "}
                            <span className="font-semibold text-slate-900">
                              {typeof profile?.avgRating === 'number' ? profile.avgRating.toFixed(1) : "N/A"}
                            </span>
                          </p>
                          <p>
                            Job đã hoàn thành:{" "}
                            <span className="font-semibold text-slate-900">
                              {profile?.completedJobs ?? 0}
                            </span>
                          </p>
                          <p>
                            On-time rate:{" "}
                            <span className="font-semibold text-slate-900">
                              {typeof profile?.onTimeRate === "number" ? `${Math.round(profile.onTimeRate)}%` : "N/A"}
                            </span>
                          </p>
                          <p>
                            Giá theo giờ:{" "}
                            <span className="font-semibold text-slate-900">
                              {formatVnd(profile?.hourlyRate ?? null)}
                            </span>
                          </p>
                        </div>

                        {profile?.bio && <p className="mt-3 text-sm text-slate-600">{profile.bio}</p>}

                        {proposal.coverLetter && (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-xs font-semibold text-slate-700">Cover letter</p>
                            <p className="mt-1 text-sm text-slate-600">{proposal.coverLetter}</p>
                          </div>
                        )}

                        {proposal.contractId && (
                          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
                            <p className="text-sm font-semibold text-emerald-800">
                              Khu vực làm việc đã sẵn sàng
                            </p>
                            <p className="mt-1 text-xs text-emerald-700">
                              Hai bên có thể bắt đầu phối hợp trực tiếp trong không gian hợp đồng.
                            </p>
                            <div className="mt-2">
                              <Link
                                href={`/contracts/${proposal.contractId}`}
                                className="inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Mở khu vực làm việc
                              </Link>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex flex-col items-end gap-2">
                          {canManageProposals && !proposal.contractId && proposal.status === "PENDING" && (
                            <>
                              <p className="text-xs text-slate-500">
                                * Lập hợp đồng hệ thống thu phí <span className="font-semibold text-rose-600">5% giá trị hợp đồng</span>.
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleProposalStatus(proposal.id, "REJECTED")}
                                >
                                  Từ chối
                                </Button>
                                <Button size="sm" onClick={() => handleProposalStatus(proposal.id, "ACCEPTED")}>
                                  Chấp nhận
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}
          
        </div>

          {/* RIGHT COLUMN (30%) */}
          <div className="w-full lg:w-[30%] space-y-6 lg:sticky lg:top-24">
            
            {/* Budget & Action Card */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
               <div className="mb-6">
                 <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{job.budgetType || "Ngân sách cố định"}</p>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">{formatVnd(job.budget)}</h2>
                 {job.durationText && (
                   <p className="text-[14px] font-medium text-slate-600 mt-2 flex items-center gap-1.5">
                     <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Dự kiến: {job.durationText}
                   </p>
                 )}
               </div>

               {canApply ? (
                 <div className="pt-6 border-t border-slate-100">
                   <h3 className="text-[15px] font-bold text-slate-900 mb-4">Gửi báo giá ngay</h3>
                   <form className="grid gap-4" onSubmit={handleSubmitProposal}>
                     <div>
                       <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Ngân sách (VNĐ)</label>
                       <input
                         value={bidAmount}
                         onChange={(e) => setBidAmount(e.target.value)}
                         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[14px] text-slate-900 outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all font-semibold"
                         placeholder="VD: 15000000"
                       />
                     </div>
                     <div>
                       <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Cover letter</label>
                       <textarea
                         value={coverLetter}
                         onChange={(e) => setCoverLetter(e.target.value)}
                         rows={3}
                         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all resize-none"
                         placeholder="Thuyết phục khách hàng..."
                       />
                     </div>
                     <Button type="submit" disabled={submitting} className="w-full h-11 text-[15px] font-bold shadow-sm">
                       {submitting ? "Đang gửi..." : "Gửi báo giá"}
                     </Button>
                     <p className="text-[11px] text-center text-slate-500 font-medium mt-1">
                       * Quota: 5 đề xuất miễn phí.
                     </p>
                   </form>
                 </div>
               ) : (
                 <div className="pt-4">
                   {user?.role === "FREELANCER" && job.status === "OPEN" ? (
                     <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                       <p className="text-[13px] text-amber-700 font-medium">Bạn đã nộp đề xuất hoặc không thể ứng tuyển.</p>
                     </div>
                   ) : canEditMilestones && job.status === "OPEN" ? (
                     <Button className="w-full h-11 text-[15px] font-bold" onClick={() => setShowBoostConfirm(true)} disabled={submitting}>
                       Đẩy tin ưu tiên
                     </Button>
                   ) : (
                     <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                       <p className="text-[13px] text-slate-600 font-medium">Trạng thái: <span className="font-bold text-slate-900">{job.status}</span></p>
                     </div>
                   )}
                 </div>
               )}
            </motion.div>

            {/* Client Info Card */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-slate-900 mb-4">Thông tin khách hàng</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[13px] text-slate-500 font-medium">Tên khách hàng</p>
                  <p className="text-[15px] font-bold text-slate-900 mt-0.5">{companyName}</p>
                </div>
                <div className="h-px bg-slate-100 w-full" />
                <div className="flex items-center gap-2">
                   <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                   <p className="text-[14px] font-bold text-slate-900">
                     {typeof job.client?.clientProfile?.avgRating === 'number' 
                        ? `${job.client.clientProfile.avgRating.toFixed(1)} / 5.0`
                        : "Chưa có đánh giá"}
                   </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Boost Job Confirm Modal */}
        {showBoostConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowBoostConfirm(false)}>
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-slate-900">Xác nhận đẩy tin</h3>
              <p className="mt-2 text-sm text-slate-600">Bạn có muốn đẩy tin tuyển dụng <strong>{job.title}</strong> lên ưu tiên với phí <span className="font-semibold text-amber-600">20.000 VNĐ</span> không? Số dư ví sẽ tự động bị trừ.</p>
              <div className="mt-6 flex gap-3">
                <Button className="flex-1" onClick={executeBoostJob} disabled={submitting}>{submitting ? "Đang đẩy..." : "Xác nhận"}</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setShowBoostConfirm(false)} disabled={submitting}>Hủy</Button>
              </div>
            </div>
          </div>
        )}

      </Container>
    </div>
  );
}
