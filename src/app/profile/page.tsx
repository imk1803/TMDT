"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateProfile } from "@/services/user";

interface FormState {
  name: string;
  avatarUrl: string;
  title: string;
  bio: string;
}

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    avatarUrl: "",
    title: "",
    bio: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      avatarUrl: user.avatarUrl || "",
      title: user.freelancerProfile?.title || "",
      bio: user.freelancerProfile?.bio || "",
    });
  }, [user]);

  const isFreelancer = useMemo(() => user?.role === "FREELANCER", [user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.name.trim()) {
      push({
        title: "Thiếu thông tin",
        description: "Họ và tên là bắt buộc.",
        variant: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        avatarUrl: form.avatarUrl.trim() || undefined,
      };

      if (isFreelancer) {
        payload.title = form.title.trim() || undefined;
        payload.bio = form.bio.trim() || undefined;
      }

      await updateProfile(payload);
      await refreshUser();

      push({
        title: "Cập nhật thành công",
        description: "Thông tin hồ sơ đã được lưu.",
        variant: "success",
      });
    } catch (err: any) {
      push({
        title: "Không thể cập nhật",
        description: err?.message || "Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải dữ liệu...
          </div>
        </Container>
      </div>
    );
  }

  if (!user || user.role === "ADMIN") return null;

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Hồ sơ cá nhân
              </h1>
              <p className="text-sm text-slate-500">
                Cập nhật thông tin cơ bản để hiển thị tốt hơn.
              </p>
            </div>
            {user && (
              <div className="text-xs text-slate-500 sm:text-sm">
                <p>
                  <span className="font-semibold text-slate-700">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Vai trò:</span> {user.role}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Họ và tên"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="VD: Nguyễn Văn A"
              />
              <Input
                label="Avatar URL"
                value={form.avatarUrl}
                onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            {isFreelancer && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Thông tin freelancer
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Chức danh"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="VD: Full-stack Developer"
                  />
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Giới thiệu</label>
                    <textarea
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      rows={4}
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      placeholder="Mô tả ngắn về kinh nghiệm, kỹ năng nổi bật..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
