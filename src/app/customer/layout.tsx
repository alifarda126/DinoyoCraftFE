"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getDemoSession, getDemoProfile, clearDemoSession } from "@/lib/demo";
import Navbar from "@/components/Navbar";
import FAB from "@/components/FAB";
import {
  CalendarBlank,
  ShoppingBag,
  MapPin,
  ChatCircle,
  User as UserIcon,
  SignOut,
  Receipt,
  ArrowLeft
} from "@phosphor-icons/react";

const dashItems = [
  {
    href: "/customer/pesanan",
    icon: Receipt,
    title: "Pesanan Saya",
  },
  {
    href: "/customer/reservasi",
    icon: CalendarBlank,
    title: "Reservasi Kelas",
  },
  {
    href: "/customer/katalog",
    icon: ShoppingBag,
    title: "Katalog Keramik",
  },
  {
    href: "/customer/peta",
    icon: MapPin,
    title: "Peta Gang",
  },
  {
    href: "/customer/bantuan",
    icon: ChatCircle,
    title: "Bantuan",
  },
  {
    href: "/customer/profil",
    icon: UserIcon,
    title: "Profil",
  },
];

type User = { id: string; email: string };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      const demo = getDemoSession();
      if (demo) {
        setUser({ id: demo.user.id, email: demo.user.email });
        setLoading(false);
        return;
      }
      // If no demo session, create a mock user for frontend dev
      setUser({ id: "mock-user-id", email: "pengguna@dinoyocraft.com" });
      setLoading(false);
    }
    loadUser();
  }, []);

  async function handleSignOut() {
    clearDemoSession();
    router.push("/");
  }

  // Some routes (like payment flow or full-page interactions) shouldn't show the sidebar.
  // E.g. /customer/pembayaran/xxx
  const isNoSidebarRoute = pathname.includes("/pembayaran");

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: "9999px", border: "3px solid var(--line-strong)", borderTopColor: "var(--clay)", animation: "spin 0.75s linear infinite" }} />
          <span style={{ color: "var(--bark-muted)", fontSize: "0.9rem" }}>Memuat...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isNoSidebarRoute) {
    return <>{children}</>;
  }

  const profile = getDemoProfile();
  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Pelanggan";

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface)", color: "var(--bark)", fontFamily: "var(--font-outfit), sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>
        {/* Greeting Card */}
        <div
          style={{
            marginBottom: "2rem",
            padding: "2rem 2.25rem",
            borderRadius: "1.5rem",
            background: "linear-gradient(135deg, var(--clay) 0%, var(--clay-dark) 100%)",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(184, 92, 60, 0.2)"
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.08)",
              filter: "blur(40px)",
            }}
          />
          <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: "0.35rem" }}>
            Selamat datang,
          </p>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              fontFamily: "var(--font-outfit), sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {firstName}
          </h1>
          <p style={{ marginTop: "0.35rem", opacity: 0.7, fontSize: "0.85rem" }}>{user?.email}</p>
        </div>

        {/* Page Content */}
        <div style={{ minWidth: 0 }}>
          {children}
        </div>
      </main>

      <FAB />
    </div>
  );
}
