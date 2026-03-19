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
  const [contracts, setContracts] = useState<ContractRow[]>([]);
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
          const active = ((res.contracts || []) as ContractRow[]).filter(
            (c) => c.status === "ACTIVE"
          );
          setContracts(active);
        }
      } catch (err: any) {
        if (!cancelled) {
          setContracts([]);
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

  const title = useMemo(
    () =>
      user?.role === "FREELANCER"
        ? "Hợp đồng đang thực hiện của tôi"
        : "Hợp đồng đang thực hiện",
    [user?.role]
  );

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
            Danh sách các hợp đồng đang ở trạng thái hoạt động.
          </p>

          <div className="mt-5 space-y-3">
            {contracts.map((contract) => {
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
                  className="block rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-sky-200 hover:bg-sky-50/70"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {contract.job?.title || `Hợp đồng ${contract.id}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Đối tác: {partnerName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Giá trị: {Number(contract.price).toLocaleString("vi-VN")} VNĐ
                    {contract.dueAt
                      ? ` · Deadline: ${new Date(contract.dueAt).toLocaleDateString("vi-VN")}`
                      : ""}
                  </p>
                </Link>
              );
            })}

            {contracts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                Hiện chưa có hợp đồng đang thực hiện.
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
