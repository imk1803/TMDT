"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { apiFetch } from "@/services/api";

interface ClientDetail {
  id: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  clientProfile?: {
    companyName?: string | null;
    companyLogoUrl?: string | null;
    companySize?: string | null;
    industry?: string | null;
    location?: string | null;
    tagline?: string | null;
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
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Đang tải thông tin công ty...
          </div>
        </Container>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-6 sm:py-8">
        <Container>
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
            Không tìm thấy công ty.
          </div>
        </Container>
      </div>
    );
  }

  const profile = client.clientProfile || {};
  const companyName = profile.companyName || client.name || "Công ty";
  const logoUrl = profile.companyLogoUrl || client.avatarUrl || "https://i.pravatar.cc/150?img=8";

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-2 ring-sky-100">
              <Image
                src={logoUrl}
                alt={companyName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{companyName}</h1>
              {client.email && (
                <p className="text-sm text-slate-500">{client.email}</p>
              )}
              {profile.tagline && (
                <p className="text-sm text-slate-500">{profile.tagline}</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            {profile.industry && (
              <div><span className="font-semibold">Ngành:</span> {profile.industry}</div>
            )}
            {profile.location && (
              <div><span className="font-semibold">Địa điểm:</span> {profile.location}</div>
            )}
            {profile.companySize && (
              <div><span className="font-semibold">Quy mô:</span> {profile.companySize}</div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
