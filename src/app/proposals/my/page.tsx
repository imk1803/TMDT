"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { fetchMyProposals } from "@/services/proposals";

interface MyProposal {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  bidAmount: number | string;
  coverLetter?: string | null;
  createdAt?: string;
  job: {
    id: string;
    title: string;
    location?: string | null;
    workMode?: string | null;
    client?: {
      id: string;
      name?: string | null;
      clientProfile?: {
        companyName?: string | null;
      } | null;
    } | null;
  };
}

function proposalStatusMeta(status: MyProposal["status"]) {
  if (status === "ACCEPTED") {
    return {
      label: "Đã chấp nhận",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    };
  }
  if (status === "REJECTED") {
    return {
      label: "Đã từ chối",
      className: "bg-rose-50 text-rose-700 border border-rose-100",
    };
  }
  if (status === "WITHDRAWN") {
    return {
      label: "Đã rút đề xuất",
      className: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }
  return {
    label: "Đang chờ",
    className: "bg-amber-50 text-amber-700 border border-amber-100",
  };
}

export default function MyProposalsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [proposals, setProposals] = useState<MyProposal[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const isFreelancer = useMemo(() => user?.role === "FREELANCER", [user?.role]);

  useEffect(() => {
    if (!loading && (!user || !isFreelancer)) {
      router.replace("/login");
    }
  }, [loading, user, isFreelancer, router]);

  useEffect(() => {
    if (!isFreelancer) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchMyProposals();
        if (!cancelled) setProposals((res.proposals || []) as MyProposal[]);
      } catch (err: any) {
        if (!cancelled) {
          setProposals([]);
          push({
            title: "Không tải được đề xuất",
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
  }, [isFreelancer, push]);

  if (loading || loadingData) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải đề xuất...
          </div>
        </Container>
      </div>
    );
  }

  if (!user || !isFreelancer) return null;

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <h1 className="text-xl font-semibold text-slate-900">Đề xuất của tôi</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái các job bạn đã ứng tuyển.</p>

          <div className="mt-5 space-y-3">
            {proposals.map((proposal) => {
              const statusMeta = proposalStatusMeta(proposal.status);
              const companyName =
                proposal.job?.client?.clientProfile?.companyName ||
                proposal.job?.client?.name ||
                "Doanh nghiệp";

              return (
                <div key={proposal.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link href={`/jobs/${proposal.job.id}`} className="text-sm font-semibold text-slate-900 hover:text-sky-700">
                        {proposal.job.title}
                      </Link>
                      <p className="text-xs text-slate-500">{companyName} · {proposal.job.location || "Remote"} · {proposal.job.workMode || "Remote"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${statusMeta.className}`}> 
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600">
                    Bid: <span className="font-semibold text-slate-900">{Number(proposal.bidAmount).toLocaleString("vi-VN")} VNĐ</span>
                  </p>
                  {proposal.coverLetter && (
                    <p className="mt-2 text-sm text-slate-600">{proposal.coverLetter}</p>
                  )}
                </div>
              );
            })}

            {proposals.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                Bạn chưa gửi đề xuất nào.
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
