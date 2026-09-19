"use client";

import { getDemoSession, clearDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = { id: string; email: string };
import {
  CalendarBlank,
  ShoppingBag,
  MapPin,
  ChatCircle,
  User as UserIcon,
  ArrowRight,
  SignOut,
} from "@phosphor-icons/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FAB from "@/components/FAB";

const dashItems = [
  {
    href: "/dashboard/reservasi",
    icon: CalendarBlank,
    title: "Reservasi Kelas",
    desc: "Pesan kelas keramik untuk rombongan",
  },
  {
    href: "/dashboard/katalog",
    icon: ShoppingBag,
    title: "Katalog Keramik",
    desc: "Lihat karya dan pesan kustom",
  },
  {
    href: "/dashboard/peta",
    icon: MapPin,
    title: "Peta Gang",
    desc: "Navigasi ke bengkel pengrajin",
  },
  {
    href: "/dashboard/bantuan",
    icon: ChatCircle,
    title: "Bantuan",
    desc: "Chatbot AI & live chat admin",
  },
  {
    href: "/dashboard/profil",
    icon: UserIcon,
    title: "Profil",
    desc: "Kelola profil & riwayat pesanan",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    async function loadUser() {
      // Check demo session first
      const demo = getDemoSession();
      if (demo) {
        setUser({ id: demo.user.id, email: demo.user.email } as User);
        setLoading(false);
        return;
      }
      
      // If no demo session, create a mock user for frontend dev
      setUser({ id: "mock-user-id", email: "pengguna@dinoyocraft.com" });
      setLoading(false);
    }
    loadUser();
  }, [router]);

  async function handleSignOut() {
    clearDemoSession();
    router.push("/");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "9999px",
              border: "3px solid var(--line-strong)",
              borderTopColor: "var(--clay)",
              animation: "spin 0.75s linear infinite",
            }}
          />
          <span style={{ color: "var(--bark-muted)", fontSize: "0.9rem" }}>Memuat...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const firstName = user?.email?.split("@")[0] ?? "Pengguna";

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface)", color: "var(--bark)" }}>
      <Navbar />

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>
        {/* Greeting */}
        <div
          style={{
            marginBottom: "2.5rem",
            padding: "2rem 2.25rem",
            borderRadius: "1.5rem",
            background: "linear-gradient(135deg, var(--clay) 0%, var(--clay-dark) 100%)",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
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
          <button
            id="dashboard-signout-btn"
            onClick={handleSignOut}
            style={{
              position: "absolute",
              top: "1.25rem",
              right: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.45rem 0.85rem",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)")
            }
          >
            <SignOut size={14} />
            Keluar
          </button>
        </div>

        {/* Nav cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.1rem",
          }}
        >
          {dashItems.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href} className="dash-card" id={`dash-card-${title.toLowerCase().replace(/\s/g, "-")}`}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "0.875rem",
                  background: "var(--clay-muted)",
                  marginBottom: "1rem",
                }}
              >
                <Icon size={24} style={{ color: "var(--clay)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--bark)",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                >
                  {title}
                </h3>
                <ArrowRight size={16} style={{ color: "var(--bark-muted)" }} />
              </div>
              <p style={{ marginTop: "0.35rem", fontSize: "0.875rem", color: "var(--bark-muted)" }}>
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <FAB />
    </div>
  );
}
