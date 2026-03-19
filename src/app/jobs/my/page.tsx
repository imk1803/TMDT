"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { fetchMyJobs } from "@/services/jobs";
import type { Job } from "@/types/job";

export default function MyJobsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const isClient = useMemo(() => user?.role === "CLIENT", [user?.role]);

  useEffect(() => {
    if (!loading && (!user || !isClient)) {
      router.replace("/login");
    }
  }, [loading, user, isClient, router]);

  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;

    async function load() {
      try {
        const myJobs = await fetchMyJobs();
        if (!cancelled) setJobs(myJobs);
      } catch (err: any) {
        if (!cancelled) {
          setJobs([]);
          push({
            title: "Không tải được job",
            description: err?.message || "Vui lòng thử lại.",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isClient, push]);

  if (loading || loadingData) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải danh sách tin tuyển dụng...
          </div>
        </Container>
      </div>
    );
  }

  if (!user || !isClient) return null;

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Tin tuyển dụng của tôi</h1>
              <p className="text-sm text-slate-500">
                Chọn một tin để xem chi tiết và danh sách freelancer đã đề xuất.
              </p>
            </div>
            <Link href="/jobs/new">
              <Button size="sm">Đăng job mới</Button>
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-sky-200 hover:bg-sky-50/70"
              >
                <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {job.location} · {job.workMode} · {job.salary}
                </p>
              </Link>
            ))}

            {jobs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                Bạn chưa đăng tin tuyển dụng nào.
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

