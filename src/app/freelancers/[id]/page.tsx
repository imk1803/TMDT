"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { apiFetch } from "@/services/api";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { getCategoryBadge } from "@/lib/categoryBadge";

interface FreelancerDetail {
  id: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  freelancerProfile?: {
    title?: string | null;
    bio?: string | null;
    hourlyRate?: number | string | null;
    avgRating?: number | null;
    completedJobs?: number | null;
    totalIncome?: number | string | null;
    onTimeRate?: number | null;
    categories?: { category?: { name?: string | null } }[] | null;
  } | null;
}

function formatVnd(amount?: number | string | null) {
  if (!amount) return "—";
  const num = Number(amount);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("vi-VN") + " VNĐ";
}

export default function FreelancerDetailPage() {
  const { id } = useParams();
  const freelancerId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const [freelancer, setFreelancer] = useState<FreelancerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!freelancerId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await apiFetch<{ freelancer: FreelancerDetail }>(`/api/freelancers/${freelancerId}`);
        if (!cancelled) setFreelancer(res.freelancer);
      } catch {
        if (!cancelled) setFreelancer(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [freelancerId]);

  if (loading) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải freelancer...
          </div>
        </Container>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Không tìm thấy freelancer.
          </div>
        </Container>
      </div>
    );
  }

  const profile = freelancer.freelancerProfile || {};
  const profileCategories =
    profile.categories?.map((c) => c.category?.name).filter((x): x is string => Boolean(x)) ||
    [];

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-2 ring-sky-100">
              <Image
                src={freelancer.avatarUrl || "https://i.pravatar.cc/150?img=1"}
                alt={freelancer.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{freelancer.name}</h1>
              <p className="text-sm text-slate-500">{profile.title || "Freelancer"}</p>
              {freelancer.email && (
                <p className="text-sm text-slate-500">{freelancer.email}</p>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="mt-4 text-sm text-slate-600">
              {profile.bio}
            </div>
          )}

          {profileCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profileCategories.map((name) => {
                const badge = getCategoryBadge(name);
                return (
                  <span
                    key={name}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                  >
                    <CategoryIcon name={badge.icon} className="h-3.5 w-3.5" />
                    {name}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            <div><span className="font-semibold">Rating:</span> {typeof profile.avgRating === 'number' ? profile.avgRating.toFixed(1) : "—"}</div>
            <div><span className="font-semibold">Đúng hạn:</span> {profile.onTimeRate ?? "—"}%</div>
            <div><span className="font-semibold">Job hoàn thành:</span> {profile.completedJobs ?? "—"}</div>
            <div><span className="font-semibold">Tổng thu nhập:</span> {formatVnd(profile.totalIncome)}</div>
          </div>
        </div>
      </Container>
    </div>
  );
}
