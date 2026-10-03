"use client";

import { usePathname } from "next/navigation";
import MitraSidebar from "@/components/layout/MitraSidebar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/mitra/dashboard/registrasi") {
    return <>{children}</>;
  }

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", background: "var(--surface)", fontFamily: "var(--font-outfit), sans-serif" }}>
      <MitraSidebar />

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem", overscrollBehaviorY: "contain" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {children}
        </div>
      </main>

    </div>
  );
}
