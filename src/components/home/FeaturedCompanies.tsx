"use client";

import { Building2, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { fetchCompanies } from "@/services/companies";
import type { Company } from "@/types/company";

export function FeaturedCompanies() {
  const [featured, setFeatured] = useState<Company[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchCompanies();
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
    <section className="bg-white py-10 sm:py-12">
      <Container>
        <SectionTitle
          title="Công ty tuyển dụng hàng đầu"
          subtitle="Kết nối với những doanh nghiệp có môi trường làm việc chuyên nghiệp, đãi ngộ tốt."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((company) => (
            <article
              key={company.id}
              className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:shadow-md sm:p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-base font-semibold text-white shadow-md shadow-sky-200">
                {company.logoText}
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Building2 className="h-4 w-4 text-sky-500" />
                  <p className="font-semibold">{company.name}</p>
                </div>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  {company.tagline}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 sm:text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {company.employees} nhân viên
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                    {company.jobsOpen} vị trí đang tuyển
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
