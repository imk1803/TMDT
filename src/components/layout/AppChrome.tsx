'use client';

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-sky-50 to-cyan-50">
      <Navbar />
      <main className="flex-1 pb-10 pt-4 sm:pb-12 sm:pt-6">{children}</main>
      <Footer />
    </div>
  );
}

