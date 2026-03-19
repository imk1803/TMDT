"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { createJob } from "@/services/jobs";

export default function NewJobPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    location: "",
    workMode: "Remote",
    experienceLevel: "Mid",
    deadlineAt: "",
  });

  const isClient = useMemo(() => user?.role === "CLIENT", [user?.role]);

  useEffect(() => {
    if (!loading && (!user || !isClient)) {
      router.replace("/login");
    }
  }, [loading, user, isClient, router]);

  if (!loading && (!user || !isClient)) return null;

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

    setSubmitting(true);
    try {
      await createJob({
        title,
        description,
        budget,
        location: form.location.trim() || undefined,
        workMode: form.workMode,
        experienceLevel: form.experienceLevel,
        deadlineAt: form.deadlineAt ? new Date(form.deadlineAt).toISOString() : undefined,
      });
      push({
        title: "Đăng job thành công",
        description: "Tin tuyển dụng đã được tạo.",
        variant: "success",
      });
      router.push("/jobs/my");
    } catch (err: any) {
      push({
        title: "Không thể đăng job",
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
          <h1 className="text-xl font-semibold text-slate-900">Đăng job mới</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo tin tuyển dụng để nhận đề xuất từ freelancer.</p>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <Input
              label="Tiêu đề"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="VD: Xây dựng landing page Next.js"
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Mô tả công việc</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={5}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="Mô tả chi tiết phạm vi công việc, yêu cầu và đầu ra mong muốn."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Ngân sách"
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                placeholder="VD: 15000000"
              />
              <Input
                label="Địa điểm (tuỳ chọn)"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="VD: Remote / Hà Nội"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mức kinh nghiệm</label>
                <select
                  value={form.experienceLevel}
                  onChange={(e) => setForm((f) => ({ ...f, experienceLevel: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <Input
                label="Deadline (tuỳ chọn)"
                type="date"
                value={form.deadlineAt}
                onChange={(e) => setForm((f) => ({ ...f, deadlineAt: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang đăng..." : "Đăng job"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}

