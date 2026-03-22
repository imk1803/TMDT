"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { fetchMyContracts } from "@/services/contracts";

interface ContractRow {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  price: number | string;
  dueAt?: string | null;
  job?: {
    id: string;
    title?: string | null;
  } | null;
  freelancer?: {
    id: string;
    name?: string | null;
  } | null;
  client?: {
    id: string;
    name?: string | null;
    clientProfile?: {
      companyName?: string | null;
    } | null;
  } | null;
}

export default function ContractsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [activeContracts, setActiveContracts] = useState<ContractRow[]>([]);
  const [completedContracts, setCompletedContracts] = useState<ContractRow[]>([]);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || user.role === "ADMIN") return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchMyContracts();
        if (!cancelled) {
          const all = (res.contracts || []) as ContractRow[];
          setActiveContracts(all.filter((c) => c.status === "ACTIVE"));
          setCompletedContracts(all.filter((c) => c.status === "COMPLETED"));
        }
      } catch (err: any) {
        if (!cancelled) {
          setActiveContracts([]);
          setCompletedContracts([]);
          push({
            title: "Không tải được hợp đồng",
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
  }, [push, user]);

  const title = useMemo(() => "Hợp đồng của tôi", []);

  if (loading || loadingData) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải hợp đồng...
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
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem và quản lý các hợp đồng dự án của bạn trên nền tảng.
          </p>

          <div className="mt-6 flex gap-2 border-b border-slate-100 pb-4">
             <button
                onClick={() => setActiveTab("ACTIVE")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "ACTIVE" ? "bg-blue-100 text-blue-700 shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
             >
                Đang thực hiện ({activeContracts.length})
             </button>
             <button
                onClick={() => setActiveTab("COMPLETED")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "COMPLETED" ? "bg-emerald-100 text-emerald-700 shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
             >
                Đã hoàn thành ({completedContracts.length})
             </button>
          </div>

          <div className="mt-5 space-y-3">
            {(activeTab === "ACTIVE" ? activeContracts : completedContracts).map((contract) => {
              const partnerName =
                user.role === "CLIENT"
                  ? contract.freelancer?.name || contract.freelancer?.id || "Freelancer"
                  : contract.client?.clientProfile?.companyName ||
                    contract.client?.name ||
                    contract.client?.id ||
                    "Client";

              return (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${activeTab === "COMPLETED" ? "border-slate-100 bg-slate-50/50 hover:border-slate-300 opacity-80 grayscale-[20%]" : "border-blue-100 bg-white hover:border-blue-300 shadow-sm"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-bold ${activeTab === "COMPLETED" ? "text-slate-700" : "text-slate-900"}`}>
                        {contract.job?.title || `Hợp đồng ${contract.id}`}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        Đối tác: <span className="text-slate-700">{partnerName}</span>
                      </p>
                    </div>
                    {activeTab === "COMPLETED" ? (
                      <span className="rounded bg-emerald-100/80 px-2.5 py-1 text-xs font-bold uppercase text-emerald-600">Đã kết thúc</span>
                    ) : (
                      <span className="rounded bg-blue-100/80 px-2.5 py-1 text-xs font-bold uppercase text-blue-600">Đang triển khai</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <p className="font-semibold text-slate-700">
                      Ngân sách: <span className={activeTab === "COMPLETED" ? "text-slate-500" : "text-blue-600"}>{Number(contract.price).toLocaleString("vi-VN")}đ</span>
                    </p>
                    {contract.dueAt && (
                      <p className="text-slate-500 font-medium">Hạn chót: {new Date(contract.dueAt).toLocaleDateString("vi-VN")}</p>
                    )}
                  </div>
                </Link>
              );
            })}

            {(activeTab === "ACTIVE" ? activeContracts : completedContracts).length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 font-medium">
                {activeTab === "ACTIVE" ? "Hiện chưa có hợp đồng đang thực hiện." : "Bạn chưa có hợp đồng nào được lưu trữ hoàn thành."}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
