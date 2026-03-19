"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Wallet } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { fetchJobs } from "@/services/jobs";
import type { Job } from "@/types/job";

export function FeaturedJobs() {
  const [featured, setFeatured] = useState<Job[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchJobs();
        if (!cancelled) setFeatured(data.slice(0, 4));
      } catch {
        if (!cancelled) setFeatured([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-sky-50/80 py-10 sm:py-12">
      <Container>
        <SectionTitle
          title="Việc làm nổi bật"
          subtitle="Một số cơ hội hấp dẫn được tuyển dụng nhiều trong tuần này."
          actions={
            <Link href="/jobs">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <span>Xem tất cả việc làm</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((job) => (
            <article
              key={job.id}
              className="group flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md sm:p-5"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                      {job.title}
                    </h3>
                    <p className="text-xs font-medium text-sky-600 sm:text-sm">
                      {job.companyName}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium capitalize text-emerald-600">
                    {job.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 sm:text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location} · {job.workMode}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5" />
                    {job.salary}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-slate-500 sm:text-sm">
                  {job.description}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {job.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 sm:text-xs">
                  Cập nhật gần đây · Ưu tiên ứng viên nộp sớm
                </p>
                <Link href="/jobs">
                  <Button size="sm" className="gap-1.5">
                    <span>Ứng tuyển ngay</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
