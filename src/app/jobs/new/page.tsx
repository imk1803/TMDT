"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { createJob } from "@/services/jobs";
import { categories } from "@/data/categories";

const DURATION_PRESETS = [
  { id: "lt_1_month", label: "Ít hơn 1 tháng", days: 30 },
  { id: "1_3_months", label: "1 - 3 tháng", days: 90 },
  { id: "over_3_months", label: "Trên 3 tháng", days: 120 },
  { id: "not_sure", label: "Chưa xác định", days: null },
];

const PERCENT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function NewJobPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<
    { title: string; percent: number; dueDate?: string }[]
  >([]);
  const [milestoneDraft, setMilestoneDraft] = useState({
    title: "",
    percent: 10,
    dueDate: "",
  });
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    location: "",
    workMode: "Remote",
    experienceLevel: "Mid",
    categoryName: "",
    durationPreset: "lt_1_month",
  });

  const isClient = useMemo(() => user?.role === "CLIENT", [user?.role]);

  useEffect(() => {
    if (!loading && (!user || !isClient)) {
      router.replace("/login");
    }
  }, [loading, user, isClient, router]);

  useEffect(() => {
    let active = true;
    async function loadLocations() {
      try {
        const res = await fetch("/api/locations/provinces");
        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as { locations?: string[] };
        if (active && Array.isArray(data.locations)) setLocations(data.locations);
      } catch {
        if (active) setLocations([]);
      }
    }
    loadLocations();
    return () => {
      active = false;
    };
  }, []);

  if (!loading && (!user || !isClient)) return null;

  function addSkill(value: string) {
    const cleaned = value.trim();
    if (!cleaned) return;
    if (skills.includes(cleaned)) return;
    setSkills((prev) => [...prev, cleaned]);
  }

  function handleSkillKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput("");
    }
  }

  function computeDeadline() {
    const preset = DURATION_PRESETS.find((d) => d.id === form.durationPreset);
    if (!preset || !preset.days) return undefined;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + preset.days);
    return deadline.toISOString();
  }

  const budgetNumber = Number.parseFloat(form.budget);
  const safeBudget = Number.isFinite(budgetNumber) && budgetNumber > 0 ? budgetNumber : 0;
  const totalMilestonePercent = milestones.reduce((sum, item) => sum + item.percent, 0);
  const remainingPercent = 100 - totalMilestonePercent;

  function calcMilestoneAmount(percent: number) {
    return Math.round((safeBudget * percent) / 100);
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
        ? milestones.map((item, idx) => (idx === editingMilestoneIndex ? payload : item))
        : [...milestones, payload];

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
    const target = milestones[index];
    if (!target) return;
    setEditingMilestoneIndex(index);
    setMilestoneDraft({
      title: target.title,
      percent: target.percent,
      dueDate: target.dueDate || "",
    });
  }

  function handleRemoveMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, idx) => idx !== index));
    if (editingMilestoneIndex === index) {
      resetMilestoneDraft();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    const budget = Number.parseFloat(form.budget);

    if (title.length < 3) {
      push({
        title: "Tiêu đề quá ngắn",
        description: "Tiêu đề phải có ít nhất 3 ký tự.",
        variant: "error",
      });
      return;
    }

    if (description.length < 10) {
      push({
        title: "Mô tả quá ngắn",
        description: "Mô tả công việc phải có ít nhất 10 ký tự.",
        variant: "error",
      });
      return;
    }

    if (!Number.isFinite(budget) || budget < 0) {
      push({
        title: "Ngân sách chưa hợp lệ",
        description: "Vui lòng nhập ngân sách là số hợp lệ.",
        variant: "error",
      });
      return;
    }

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
        description: "Vui lòng phân bổ lại % các milestone.",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createJob({
        title,
        description,
        budget,
        location: form.location.trim() || undefined,
        workMode: form.workMode,
        experienceLevel: form.experienceLevel,
        deadlineAt: computeDeadline(),
        categoryName: form.categoryName || undefined,
        milestones: milestones.map((m) => ({
          title: m.title.trim(),
          percent: m.percent,
          dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined,
        })),
      });
      push({
        title: "Đăng công việc thành công",
        description: "Tin tuyển dụng đã được tạo.",
        variant: "success",
      });
      router.push("/jobs/my");
    } catch (err: any) {
      push({
        title: "Không thể đăng công việc",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <h1 className="text-2xl font-semibold text-slate-900">Tạo dự án của bạn</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cung cấp tiêu đề và mô tả rõ ràng để thu hút nhân tài chất lượng cao.
          </p>

          <form className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <Input
                label="Tên dự án"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="VD: Senior Full-Stack Developer cho FinTech Dashboard"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Lĩnh vực</label>
                  <select
                    value={form.categoryName}
                    onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Chọn lĩnh vực</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Thời hạn dự án</label>
                  <select
                    value={form.durationPreset}
                    onChange={(e) => setForm((f) => ({ ...f, durationPreset: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    {DURATION_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Địa điểm (tuỳ chọn)</label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Chọn địa điểm</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Hình thức làm việc</label>
                  <select
                    value={form.workMode}
                    onChange={(e) => setForm((f) => ({ ...f, workMode: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mô tả chi tiết</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder="Mô tả mục tiêu dự án, yêu cầu và kỳ vọng..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kỹ năng yêu cầu</label>
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                        className="text-white/80 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKey}
                    placeholder="Thêm kỹ năng..."
                    className="min-w-[140px] flex-1 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Thiết lập milestone</p>
                <p className="mt-1 text-xs text-slate-500">
                  Chia dự án thành các giai đoạn để dễ quản lý và thanh toán.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_0.7fr_0.7fr_auto]">
                  <input
                    value={milestoneDraft.title}
                    onChange={(e) =>
                      setMilestoneDraft((prev) => ({ ...prev, title: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setMilestoneDraft((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddOrUpdateMilestone}
                  >
                    {editingMilestoneIndex !== null ? "Cập nhật" : "Thêm"}
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  {milestones.map((milestone, index) => (
                    <div
                      key={`${milestone.title}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{milestone.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Tỷ lệ: {milestone.percent}%
                        </p>
                        {milestone.dueDate && (
                          <p className="text-[11px] text-slate-500">
                            Hạn: {new Date(milestone.dueDate).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sky-700">
                          {calcMilestoneAmount(milestone.percent).toLocaleString("vi-VN")}đ
                        </span>
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
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-center text-xs text-slate-500">
                      Chưa có milestone nào.
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs font-medium text-slate-600">
                  Tổng phân bổ: {totalMilestonePercent}% / 100% · Còn lại: {Math.max(0, remainingPercent)}%
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Thông tin ngân sách</p>
                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-600">Ngân sách dự án</label>
                  <input
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    placeholder="VD: 80000000"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Xem trước các giai đoạn</p>
                <div className="mt-3 space-y-2">
                  {milestones.map((milestone, index) => (
                    <div
                      key={`${milestone.title}-preview-${index}`}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {milestone.title} ({milestone.percent}%)
                        </span>
                        <span className="font-semibold text-sky-700">
                          {calcMilestoneAmount(milestone.percent).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      {milestone.dueDate && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Hạn: {new Date(milestone.dueDate).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-center text-xs text-slate-500">
                      Chưa có giai đoạn nào.
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? "Đang đăng..." : "Đăng công việc"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
