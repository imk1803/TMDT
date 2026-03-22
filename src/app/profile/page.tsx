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
import { Award, Bolt, Flame, History, Paintbrush2, ShieldCheck, Star, Tag, Wand2, Mail, Briefcase, Camera, ChevronRight, CheckCircle2 } from "lucide-react";
import { fetchMyGamification } from "@/services/gamification";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { getCategoryBadge } from "@/lib/categoryBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { motion } from "framer-motion";
import { Target, TrendingUp, Clock, FileCheck } from "lucide-react";

const LEVEL_COLORS: Record<string, string> = {
  BRONZE: "bg-amber-100 text-amber-800 border-amber-200",
  SILVER: "bg-slate-200 text-slate-700 border-slate-300",
  GOLD: "bg-yellow-100 text-yellow-700 border-yellow-300",
  PLATINUM: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

function getNextLevelInfo(points: number, level: string) {
  if (level === "PLATINUM" || points >= 15000) return { max: points, pct: 100, next: "Max" };
  if (level === "GOLD" || points >= 5000) return { max: 15000, pct: (points / 15000) * 100, next: "PLATINUM" };
  if (level === "SILVER" || points >= 1000) return { max: 5000, pct: (points / 5000) * 100, next: "GOLD" };
  return { max: 1000, pct: (points / 1000) * 100, next: "SILVER" };
}

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]"
        >
          
          {/* Main Left Column: Profile Info & Form */}
          <div className="space-y-8">
            
            {/* Header Card */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-sky-500 to-indigo-600 opacity-10"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[2rem] shadow-md ring-4 ring-white bg-slate-100 flex items-center justify-center group cursor-pointer transition-transform hover:scale-105">
                  {form.avatarUrl || user.avatarUrl ? (
                    <img src={form.avatarUrl || user.avatarUrl!} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-10 w-10 text-slate-300 group-hover:text-sky-500 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col items-center sm:items-start text-center sm:text-left mt-2 sm:mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight">{user.name}</h1>
                    <span className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="flex items-center justify-center sm:justify-start gap-2 text-[15px] font-medium text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {user.email}
                    </p>
                    {isFreelancer && form.title && (
                      <p className="flex items-center justify-center sm:justify-start gap-2 text-[15px] font-medium text-slate-800">
                        <Briefcase className="h-4 w-4 text-sky-500" />
                        {form.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reputation Overview Section */}
            {isFreelancer && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  Tổng quan uy tín
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricCard
                    title="Đánh giá"
                    value={user?.freelancerProfile?.avgRating ? Number(user.freelancerProfile.avgRating).toFixed(1) : "Chưa có"}
                    icon={<Star className="h-5 w-5" />}
                    subtext={`${user?.freelancerProfile?.totalReviews || 0} bài đánh giá`}
                  />
                  <MetricCard
                    title="Thu nhập"
                    value={user?.freelancerProfile?.totalIncome ? Number(user.freelancerProfile.totalIncome).toLocaleString("vi-VN") + "đ" : "0đ"}
                    icon={<TrendingUp className="h-5 w-5" />}
                    subtext="Tổng doanh thu"
                  />
                  <MetricCard
                    title="Công việc"
                    value={user?.freelancerProfile?.completedJobs || 0}
                    icon={<FileCheck className="h-5 w-5" />}
                    subtext="Dự án đã hoàn thành"
                  />
                  <MetricCard
                    title="Hiệu suất"
                    value={user?.freelancerProfile?.onTimeRate ? Number(user.freelancerProfile.onTimeRate).toFixed(0) + "%" : "N/A"}
                    icon={<Clock className="h-5 w-5" />}
                    subtext="Tỷ lệ đúng hạn"
                  />
                </div>
              </div>
            )}

            {/* Form Section */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 Chỉnh sửa thông tin
              </h2>
              
              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Họ và tên</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Đường dẫn Avatar (URL)</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                      value={form.avatarUrl}
                      onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {isFreelancer && (
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold tracking-wide text-slate-400 uppercase">Hồ sơ năng lực (Freelancer)</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Chức danh chuyên môn</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="VD: Senior React Developer"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Giới thiệu bản thân</label>
                      <textarea
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                        rows={5}
                        value={form.bio}
                        onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                        placeholder="Mô tả ngắn gọn về kinh nghiệm, kỹ năng và tóm tắt quá trình làm việc của bạn..."
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-sky-500" />
                        Ngành nghề & Lĩnh vực
                      </label>
                      <div className="flex flex-wrap gap-2.5">
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
                              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold mb-1 transition-all duration-200 ${
                                active
                                  ? `border-transparent shadow-sm ${badge.className}`
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <CategoryIcon name={badge.icon} className="h-4 w-4" />
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-sm shadow-sky-500/30 ring-1 ring-sky-600/50 hover:bg-sky-500 hover:shadow-md hover:shadow-sky-500/40 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:opacity-60 transition-all"
                  >
                    {saving ? (
                       <span className="flex items-center gap-2">
                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                         Đang lưu...
                       </span>
                    ) : (
                       "Lưu thay đổi"
                    )}
                  </button>
                </div>
              </form>
            </div>
            
          </div>

          {/* Gamification Sidebar */}
          <div className="space-y-6">
             {loadingGamification ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
                  Đang tải dữ liệu Gamification...
                </div>
             ) : gamification ? (
                <>
                  {/* Progress & Level Card */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-all hover:border-sky-200 duration-500">
                     <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                       <Award className="w-32 h-32" />
                     </div>
                     <h3 className="text-sm font-bold tracking-wide text-slate-400 uppercase mb-6 relative z-10">Thành tích & Cấp độ</h3>
                     
                     <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${LEVEL_COLORS[gamification.level] || LEVEL_COLORS.BRONZE}`}>
                          <Award className="h-4 w-4" />
                          {gamification.level}
                        </span>
                        
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                           {Number(gamification.points || 0).toLocaleString("vi-VN")} <span className="text-sm font-bold text-slate-400 uppercase">pts</span>
                        </span>
                     </div>
                     
                     {(() => {
                        const { max, pct, next } = getNextLevelInfo(gamification.points || 0, gamification.level);
                        return (
                          <div className="mt-6 relative z-10">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                               <span>Tiến trình</span>
                               <span>{next === "Max" ? "Cấp độ tối đa" : `Cần đạt ${max.toLocaleString()} pts`}</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }}
                                 className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
                               />
                            </div>
                          </div>
                        )
                     })()}
                  </div>

                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <motion.div whileHover={{ y: -4 }} className="rounded-3xl border border-orange-100 bg-orange-50/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-default">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                           <Flame className="w-24 h-24 text-orange-600" />
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-orange-100/80 text-orange-600 flex items-center justify-center mb-4 relative z-10">
                           <Flame className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-orange-600/70 uppercase tracking-wide mb-1 relative z-10">Streak Hiện tại</p>
                        <p className="text-3xl font-black text-slate-900 relative z-10">{gamification.currentStreak ?? 0}</p>
                     </motion.div>
                     <motion.div whileHover={{ y: -4 }} className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-default">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                           <ShieldCheck className="w-24 h-24 text-emerald-600" />
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-4 relative z-10">
                           <ShieldCheck className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wide mb-1 relative z-10">Kỷ lục Streak</p>
                        <p className="text-3xl font-black text-slate-900 relative z-10">{gamification.longestStreak ?? 0}</p>
                     </motion.div>
                  </div>

                  {/* Badges Section */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                     <h3 className="text-sm font-bold tracking-wide text-slate-400 uppercase mb-6 flex items-center justify-between">
                       Bộ sưu tập Huy hiệu
                       <span className="text-xs bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full">{(gamification.badges || []).length}</span>
                     </h3>
                     
                     {(gamification.badges || []).length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                         <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mb-3">
                           <Star className="h-6 w-6" />
                         </div>
                         <p className="text-sm font-semibold text-slate-600 mb-1">Chưa có huy hiệu</p>
                         <p className="text-xs text-slate-400 max-w-[200px]">Hoàn thành nhiều dự án để mở khóa các danh hiệu độc quyền.</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-2 gap-3">
                         {gamification.badges.map((badge: string) => {
                           const badgeMeta: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
                             "Design Hero": { icon: <Paintbrush2 className="h-4 w-4" />, color: "text-pink-600", bg: "bg-pink-50" },
                             "IT Hero": { icon: <Bolt className="h-4 w-4" />, color: "text-indigo-600", bg: "bg-indigo-50" },
                             "Marketing Hero": { icon: <Wand2 className="h-4 w-4" />, color: "text-amber-600", bg: "bg-amber-50" },
                             "Content Hero": { icon: <Star className="h-4 w-4" />, color: "text-emerald-600", bg: "bg-emerald-50" },
                             "Top Performer": { icon: <Award className="h-4 w-4" />, color: "text-sky-600", bg: "bg-sky-50" },
                             "Fast Responder": { icon: <ShieldCheck className="h-4 w-4" />, color: "text-slate-700", bg: "bg-slate-100" },
                           };
                           const meta = badgeMeta[badge] || { icon: <Award className="h-4 w-4" />, color: "text-sky-600", bg: "bg-sky-50" };

                           return (
                             <motion.div whileHover={{ y: -4, scale: 1.02 }} key={badge} className={`flex flex-col gap-2 rounded-2xl p-4 transition-colors ${meta.bg} shadow-sm hover:shadow-md cursor-default`}>
                               <div className={`h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm ${meta.color}`}>
                                 {meta.icon}
                               </div>
                               <span className={`text-xs font-bold leading-tight ${meta.color}`}>
                                 {badge}
                               </span>
                             </motion.div>
                           );
                         })}
                       </div>
                     )}
                  </div>

                  {/* Timeline History */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                     <h3 className="text-sm font-bold tracking-wide text-slate-400 uppercase mb-6 flex items-center gap-2">
                       <History className="h-4 w-4" /> Lịch sử hoạt động
                     </h3>
                     
                     <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
                       {history.length === 0 && (
                         <p className="text-xs font-medium text-slate-500 text-center py-4">Chưa có hoạt động nào được ghi nhận.</p>
                       )}
                       
                       {history.slice(0, 5).map((item, i) => (
                         <motion.div 
                           initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ duration: 0.5, delay: i * 0.1 }}
                           key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group select-none"
                         >
                           <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm border-[3px] border-emerald-100 text-emerald-500 z-10 transition-transform group-hover:scale-110">
                             <CheckCircle2 className="h-4 w-4" />
                           </div>
                           
                           <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors group-hover:bg-slate-100 group-hover:border-slate-200">
                             <div className="flex items-center justify-between mb-1">
                               <span className="text-xs font-bold text-slate-400 uppercase">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                               <span className="text-sm font-black text-emerald-600 px-2 py-0.5 bg-emerald-100/50 rounded-lg">+{item.points} pt</span>
                             </div>
                             <p className="text-[13px] font-semibold text-slate-700 leading-snug">{item.reason}</p>
                           </div>
                         </motion.div>
                       ))}
                       
                       {history.length > 5 && (
                         <div className="text-center pt-2">
                           <span className="text-xs font-bold text-slate-400 uppercase cursor-pointer hover:text-sky-500">Xem tất cả</span>
                         </div>
                       )}
                     </div>
                  </div>
                </>
             ) : (
                <div className="rounded-3xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-500">
                  Không thể tải Gamification Data.
                </div>
             )}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
