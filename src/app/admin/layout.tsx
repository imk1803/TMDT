import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </AdminAuthProvider>
  );
}

