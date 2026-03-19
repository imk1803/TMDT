"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProposalsRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "CLIENT") {
      router.replace("/jobs/my");
      return;
    }

    if (user.role === "FREELANCER") {
      router.replace("/proposals/my");
      return;
    }

    router.replace("/admin");
  }, [loading, user, router]);

  return (
    <div className="py-6 sm:py-8">
      <Container>
        <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm sm:p-8 sm:text-base">
          Đang chuyển hướng...
        </div>
      </Container>
    </div>
  );
}
