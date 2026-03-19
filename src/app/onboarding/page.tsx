"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { updateProfile } from "@/services/user";

function redirectByRole(role?: string) {
  if (role === "CLIENT") return "/jobs/my";
  if (role === "FREELANCER") return "/jobs";
  if (role === "ADMIN") return "/admin";
  return "/";
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const { push } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [freelancerForm, setFreelancerForm] = useState({
    title: "",
    bio: "",
    hourlyRate: "",
  });

  const [clientForm, setClientForm] = useState({
    companyName: "",
    industry: "",
    location: "",
  });

  const isFreelancer = user?.role === "FREELANCER";
  const isClient = user?.role === "CLIENT";

  const isDone = useMemo(() => {
    if (!user) return false;
    if (user.role === "CLIENT") {
      return Boolean(user.clientProfile?.companyName && user.clientProfile?.industry);
    }
    if (user.role === "FREELANCER") {
      return Boolean(user.freelancerProfile?.title && user.freelancerProfile?.bio);
    }
    return true;
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/admin");
      return;
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setFreelancerForm({
      title: user.freelancerProfile?.title || "",
      bio: user.freelancerProfile?.bio || "",
      hourlyRate: user.freelancerProfile?.hourlyRate
        ? String(user.freelancerProfile.hourlyRate)
        : "",
    });
    setClientForm({
      companyName: user.clientProfile?.companyName || "",
      industry: user.clientProfile?.industry || "",
      location: user.clientProfile?.location || "",
    });
  }, [user]);

  useEffect(() => {
    if (!loading && user && isDone) {
      router.replace(redirectByRole(user.role));
    }
  }, [loading, user, isDone, router]);

  if (loading || !user || isDone) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải onboarding...
          </div>
        </Container>
      </div>
    );
  }

  async function submitFreelancer() {
    if (freelancerForm.title.trim().length < 2) {
      push({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập chức danh của bạn.",
        variant: "error",
      });
      return;
    }
    if (freelancerForm.bio.trim().length < 10) {
      push({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mô tả ít nhất 10 ký tự.",
        variant: "error",
      });
      return;
    }

    const hourlyRate = freelancerForm.hourlyRate.trim()
      ? Number.parseFloat(freelancerForm.hourlyRate)
      : undefined;
    if (hourlyRate !== undefined && (!Number.isFinite(hourlyRate) || hourlyRate < 0)) {
      push({
        title: "Đơn giá chưa hợp lệ",
        description: "Vui lòng nhập số hợp lệ cho đơn giá theo giờ.",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({
        title: freelancerForm.title.trim(),
        bio: freelancerForm.bio.trim(),
        hourlyRate,
      });
      await refreshUser();
      push({
        title: "Hoàn tất onboarding",
        description: "Hồ sơ freelancer đã được cập nhật.",
        variant: "success",
      });
      router.push("/jobs");
    } catch (err: any) {
      push({
        title: "Không thể lưu onboarding",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function submitClient() {
    if (clientForm.companyName.trim().length < 2) {
      push({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên công ty.",
        variant: "error",
      });
      return;
    }
    if (clientForm.industry.trim().length < 2) {
      push({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập lĩnh vực hoạt động.",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({
        companyName: clientForm.companyName.trim(),
        industry: clientForm.industry.trim(),
        location: clientForm.location.trim() || undefined,
      });
      await refreshUser();
      push({
        title: "Hoàn tất onboarding",
        description: "Thông tin nhà tuyển dụng đã được cập nhật.",
        variant: "success",
      });
      router.push("/jobs/my");
    } catch (err: any) {
      push({
        title: "Không thể lưu onboarding",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-6 sm:py-8">
      <Container className="max-w-2xl">
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <h1 className="text-xl font-semibold text-slate-900">Thiết lập nhanh hồ sơ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Chỉ 2-3 câu hỏi để hệ thống cá nhân hoá trải nghiệm cho bạn.
          </p>

          {isClient && (
            <div className="mt-6 grid gap-4">
              <Input
                label="Tên công ty"
                value={clientForm.companyName}
                onChange={(e) => setClientForm((v) => ({ ...v, companyName: e.target.value }))}
                placeholder="Ví dụ: Công ty ABC"
              />
              <Input
                label="Lĩnh vực hoạt động"
                value={clientForm.industry}
                onChange={(e) => setClientForm((v) => ({ ...v, industry: e.target.value }))}
                placeholder="Ví dụ: Công nghệ, Marketing, Giáo dục..."
              />
              <Input
                label="Địa điểm (tuỳ chọn)"
                value={clientForm.location}
                onChange={(e) => setClientForm((v) => ({ ...v, location: e.target.value }))}
                placeholder="Ví dụ: TP. Hồ Chí Minh"
              />
              <div className="flex justify-end">
                <Button onClick={submitClient} disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Hoàn tất"}
                </Button>
              </div>
            </div>
          )}

          {isFreelancer && (
            <div className="mt-6 grid gap-4">
              <Input
                label="Chức danh chính"
                value={freelancerForm.title}
                onChange={(e) => setFreelancerForm((v) => ({ ...v, title: e.target.value }))}
                placeholder="Ví dụ: Frontend Developer"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Giới thiệu ngắn</label>
                <textarea
                  value={freelancerForm.bio}
                  onChange={(e) => setFreelancerForm((v) => ({ ...v, bio: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder="Mô tả ngắn kỹ năng và kinh nghiệm nổi bật của bạn."
                />
              </div>
              <Input
                label="Đơn giá theo giờ (tuỳ chọn)"
                value={freelancerForm.hourlyRate}
                onChange={(e) => setFreelancerForm((v) => ({ ...v, hourlyRate: e.target.value }))}
                placeholder="Ví dụ: 300000"
              />
              <div className="flex justify-end">
                <Button onClick={submitFreelancer} disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Hoàn tất"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

