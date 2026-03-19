"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateProfile } from "@/services/user";
import { categories } from "@/data/categories";
import { Award, Bolt, Flame, History, Paintbrush2, ShieldCheck, Star, Tag, Wand2 } from "lucide-react";
import { fetchMyGamification } from "@/services/gamification";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { getCategoryBadge } from "@/lib/categoryBadge";

interface FormState {
  name: string;
  avatarUrl: string;
  title: string;
  bio: string;
  categories: string[];
}

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingGamification, setLoadingGamification] = useState(true);
  const [gamification, setGamification] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [limits, setLimits] = useState<{ dailyPointsCap?: number } | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    avatarUrl: "",
    title: "",
    bio: "",
    categories: [],
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
      categories:
        user.freelancerProfile?.categories
          ?.map((c) => c.category?.name)
          .filter((x): x is string => Boolean(x)) || [],
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function loadGamification() {
      if (!user) return;
      try {
        const res = await fetchMyGamification();
        if (!cancelled) {
          setGamification(res.gamification);
          setHistory(res.history || []);
          setLimits(res.limits || null);
        }
      } catch {
        if (!cancelled) {
          setGamification(null);
          setHistory([]);
        }
      } finally {
        if (!cancelled) setLoadingGamification(false);
      }
    }
    loadGamification();
    return () => {
      cancelled = true;
    };
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
    if (isFreelancer && form.categories.length === 0) {
      push({
        title: "Thiếu ngành nghề",
        description: "Vui lòng chọn ít nhất một ngành nghề.",
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
        payload.categories = form.categories;
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
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Tag className="h-4 w-4 text-sky-600" />
                      Ngành nghề
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const active = form.categories.includes(cat.name);
                        const badge = getCategoryBadge(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                categories: f.categories.includes(cat.name)
                                  ? f.categories.filter((x) => x !== cat.name)
                                  : [...f.categories, cat.name],
                              }))
                            }
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                              active
                                ? `border-transparent ${badge.className}`
                                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                            }`}
                          >
                            <CategoryIcon name={badge.icon} className="h-3.5 w-3.5" />
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500">
                      Bạn có thể chọn một hoặc nhiều ngành nghề phù hợp.
                    </p>
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

          <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Gamification</p>
                <p className="text-xs text-slate-500">
                  Điểm, level, streak và huy hiệu cá nhân.
                </p>
              </div>
              {!loadingGamification && gamification && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  <Award className="h-3.5 w-3.5" />
                  {gamification.level}
                </span>
              )}
            </div>

            {loadingGamification ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
                Đang tải dữ liệu gamification...
              </div>
            ) : gamification ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                      <p className="text-xs text-slate-500">Tổng điểm</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">
                        {Number(gamification.points || 0).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                      <p className="text-xs text-slate-500">Streak hiện tại</p>
                      <p className="mt-1 flex items-center gap-1 text-xl font-semibold text-amber-700">
                        <Flame className="h-4 w-4" />
                        {gamification.currentStreak ?? 0} ngày
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                      <p className="text-xs text-slate-500">Streak dài nhất</p>
                      <p className="mt-1 flex items-center gap-1 text-xl font-semibold text-emerald-700">
                        <ShieldCheck className="h-4 w-4" />
                        {gamification.longestStreak ?? 0} ngày
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                      <Star className="h-3.5 w-3.5 text-sky-600" />
                      Điểm trong ngày: {gamification.dailyPoints ?? 0}/{limits?.dailyPointsCap ?? 200}
                    </span>
                    {gamification.lastDailyLoginAt && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">
                        Đăng nhập gần nhất:{" "}
                        {new Date(gamification.lastDailyLoginAt).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Huy hiệu
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(gamification.badges || []).length === 0 ? (
                        <span className="text-xs text-slate-500">Chưa có huy hiệu.</span>
                      ) : (
                        gamification.badges.map((badge: string) => {
                          const badgeMeta: Record<
                            string,
                            {
                              icon: JSX.Element;
                              className: string;
                            }
                          > = {
                            "Design Hero": {
                              icon: <Paintbrush2 className="h-3.5 w-3.5" />,
                              className: "bg-pink-50 text-pink-700",
                            },
                            "IT Hero": {
                              icon: <Bolt className="h-3.5 w-3.5" />,
                              className: "bg-indigo-50 text-indigo-700",
                            },
                            "Marketing Hero": {
                              icon: <Wand2 className="h-3.5 w-3.5" />,
                              className: "bg-amber-50 text-amber-700",
                            },
                            "Content Hero": {
                              icon: <Star className="h-3.5 w-3.5" />,
                              className: "bg-emerald-50 text-emerald-700",
                            },
                            "Top Performer": {
                              icon: <Award className="h-3.5 w-3.5" />,
                              className: "bg-sky-50 text-sky-700",
                            },
                            "Fast Responder": {
                              icon: <ShieldCheck className="h-3.5 w-3.5" />,
                              className: "bg-slate-100 text-slate-700",
                            },
                          };
                          const meta = badgeMeta[badge] || {
                            icon: <Award className="h-3.5 w-3.5" />,
                            className: "bg-sky-50 text-sky-700",
                          };

                          return (
                            <span
                              key={badge}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
                            >
                              {meta.icon}
                              {badge}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">Lịch sử điểm</p>
                    <History className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {history.length === 0 && (
                      <p className="text-xs text-slate-500">Chưa có hoạt động nào.</p>
                    )}
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">
                            +{item.points} điểm
                          </span>
                          <span className="text-slate-400">
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-slate-500">Lý do: {item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
                Không tải được dữ liệu gamification.
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
