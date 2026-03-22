"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { apiFetch } from "@/services/api";
import { motion } from "framer-motion";
import { MapPin, Briefcase, Users, Calendar, Star, MessageSquareQuote, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";

interface ClientDetail {
  id: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  clientProfile?: {
    companyName?: string | null;
    companyLogoUrl?: string | null;
    companySize?: string | null;
    industry?: string | null;
    location?: string | null;
    tagline?: string | null;
    avgRating?: number;
    totalReviews?: number;
  } | null;
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const clientId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await apiFetch<{ user: ClientDetail }>(`/api/users/${clientId}`);
        if (!cancelled) setClient(res.user);
      } catch {
        if (!cancelled) setClient(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="py-6 sm:py-8 min-h-screen">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải thông tin...
          </div>
        </Container>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-6 sm:py-8 min-h-screen">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Không tìm thấy hồ sơ nhà tuyển dụng.
          </div>
        </Container>
      </div>
    );
  }

  const profile = client.clientProfile || {};
  const companyName = profile.companyName || client.name || "Nhà tuyển dụng";
  const logoUrl = profile.companyLogoUrl || client.avatarUrl || "https://i.pravatar.cc/150?img=8";
  
  const formattedDate = client.createdAt
    ? new Date(client.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
    : "Gần đây";

  return (
    <div className="py-8 sm:py-12 min-h-screen">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto space-y-6"
        >
          {/* Header Profile */}
          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-r from-sky-500/10 to-indigo-500/10"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.5rem] shadow-sm ring-4 ring-white bg-slate-100 flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={companyName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              
              <div className="flex flex-1 flex-col items-center sm:items-start text-center sm:text-left mt-2 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{companyName}</h1>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-100 px-3 py-1 text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Client
                  </span>
                </div>
                
                {profile.tagline && (
                  <p className="mt-2 text-[15px] font-medium text-slate-600 max-w-2xl">
                    {profile.tagline}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            {/* Main Content Area: Basic Info block */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm h-fit"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                Thông tin cơ bản
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Nơi làm việc</p>
                    <p className="mt-0.5 text-sm text-slate-600">{profile.location || "Không công khai"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Lĩnh vực</p>
                    <p className="mt-0.5 text-sm text-slate-600">{profile.industry || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Quy mô công ty</p>
                    <p className="mt-0.5 text-sm text-slate-600">{profile.companySize || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Thành viên từ</p>
                    <p className="mt-0.5 text-sm text-slate-600">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar Stats Area */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-bold tracking-wide text-slate-400 uppercase ml-2 pt-2">Độ uy tín</h2>
              <MetricCard
                title="Đánh giá trung bình"
                value={typeof profile.avgRating === 'number' && profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "Chưa có"}
                icon={<Star className="h-5 w-5 fill-amber-400 text-amber-400" />}
                subtext="Chất lượng làm việc"
              />
              <MetricCard
                title="Lượt đánh giá"
                value={profile.totalReviews || 0}
                icon={<MessageSquareQuote className="h-5 w-5 text-sky-500" />}
                subtext="Từ freelancer"
              />
            </motion.div>
          </div>
          
        </motion.div>
      </Container>
    </div>
  );
}
