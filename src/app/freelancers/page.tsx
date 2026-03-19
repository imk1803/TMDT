"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { fetchFreelancers } from "@/services/freelancers";
import type { Freelancer, FreelancerCategory } from "@/types/freelancer";
import { categories } from "@/data/categories";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { getCategoryBadge } from "@/lib/categoryBadge";
import { useToast } from "@/components/ui/Toast";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function FreelancersPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [category, setCategory] = useState<FreelancerCategory | "Tất cả">("Tất cả");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchFreelancers();
        if (!cancelled) setFreelancers(data);
      } catch (err: any) {
        if (!cancelled) {
          setFreelancers([]);
          push({
            title: "Không tải được freelancer",
            description: err?.message || "Vui lòng thử lại.",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [push]);

  const filtered = useMemo(() => {
    if (category === "Tất cả") return freelancers;
    return freelancers.filter((f) => f.category === category);
  }, [freelancers, category]);

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="space-y-6 sm:space-y-8">
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
            <h1 className="text-2xl font-semibold text-slate-900">Danh sách Freelancer</h1>
            <p className="mt-1 text-sm text-slate-600">
              Lọc nhanh theo ngành nghề để tìm freelancer phù hợp.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("Tất cả")}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  category === "Tất cả"
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                }`}
              >
                <span className="text-[11px] font-semibold">Tất cả</span>
              </button>
              {categories.map((cat) => {
                const active = category === (cat.name as FreelancerCategory);
                const badge = getCategoryBadge(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name as FreelancerCategory)}
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
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-center text-sm text-slate-600">
              Đang tải danh sách freelancer...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Chưa có freelancer phù hợp trong nhóm này.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((f) => {
                const badge = getCategoryBadge(f.category);
                return (
                  <Link
                    key={f.id}
                    href={`/freelancers/${f.id}`}
                    className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-sky-100">
                        <Image
                          src={f.avatar}
                          alt={f.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{f.name}</p>
                        <span
                          className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                        >
                          <CategoryIcon name={badge.icon} className="h-3.5 w-3.5" />
                          {f.category}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <span>Rating: <strong className="text-slate-900">{f.rating.toFixed(1)}</strong></span>
                      <span>Đúng hạn: <strong className="text-slate-900">{f.onTimeRate}%</strong></span>
                      <span>Job hoàn thành: <strong className="text-slate-900">{f.completedJobs}</strong></span>
                      <span>Thu nhập: <strong className="text-slate-900">{formatVnd(f.totalIncome)}</strong></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
