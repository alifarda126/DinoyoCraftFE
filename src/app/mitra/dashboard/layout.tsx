"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Storefront, Package, Receipt, SignOut, ArrowLeft, ChartLineUp,
  X, MapPin, Star, ChartBar, IdentificationCard, ChatCircle, User,
} from "@phosphor-icons/react";
import { clearDemoSession, getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = typeof window !== "undefined" ? getDemoSession() : null;

  const [showProfile, setShowProfile] = useState(false);

  if (pathname === "/mitra/dashboard/registrasi") {
    return <>{children}</>;
  }

  async function handleSignOut() {
    clearDemoSession();
    router.push("/mitra/login");
  }

  const navItems = [
    { href: "/mitra/dashboard/profil", icon: User, label: "Profil Toko" },
    { href: "/mitra/dashboard", icon: Storefront, label: "Beranda Toko" },
    { href: "/mitra/dashboard/katalog", icon: Package, label: "Katalog Produk" },
    { href: "/mitra/dashboard/pesanan", icon: Receipt, label: "Pesanan" },
    { href: "/mitra/dashboard/laporan-keuangan", icon: ChartLineUp, label: "Laporan Keuangan" },
    { href: "/mitra/dashboard/chat", icon: ChatCircle, label: "Live Chat" },
  ];

  const sellerName = session?.profile?.full_name ?? "Mitra";
  const initials = sellerName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ minHeight: "100dvh", display: "flex", background: "var(--surface)", fontFamily: "var(--font-outfit), sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: "260px", background: "var(--surface-dark)", borderRight: "1px solid var(--line)",
        display: "flex", flexDirection: "column", padding: "1.5rem", flexShrink: 0,
      }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "2rem" }}>
          <ArrowLeft size={16} color="rgba(255,255,255,0.6)" />
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#ffffff" }}>
            Dinoyo<span style={{ color: "rgba(255,255,255,0.6)" }}>Craft</span> Mitra
          </span>
        </Link>

        {/* Profil Toko mini */}
        <button
          onClick={() => setShowProfile(true)}
          style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.75rem", padding: "0.75rem", marginBottom: "1.5rem",
            cursor: "pointer", textAlign: "left", transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--clay), #c0673d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "0.8rem", fontWeight: 800, color: "#fff",
          }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {sellerName}
            </p>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>Lihat Profil Toko</p>
          </div>
          <IdentificationCard size={16} color="rgba(255,255,255,0.4)" style={{ marginLeft: "auto", flexShrink: 0 }} />
        </button>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 1rem", borderRadius: "0.5rem",
                textDecoration: "none",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                fontWeight: isActive ? 700 : 500,
                transition: "background 0.2s, color 0.2s",
              }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                  }
                }}
              >
                <item.icon size={20} weight={isActive ? "bold" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button onClick={handleSignOut} style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.75rem 1rem", borderRadius: "0.5rem",
          border: "none", background: "transparent", color: "#ef4444",
          fontWeight: 600, cursor: "pointer", textAlign: "left",
          fontFamily: "var(--font-outfit), sans-serif",
        }}>
          <SignOut size={20} />
          Keluar
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {children}
        </div>
      </main>

      {/* ── Modal Profil Toko ── */}
      {showProfile && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: "1.5rem", width: "100%", maxWidth: 480,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, var(--clay), #a05a3b)",
              padding: "2rem", position: "relative",
            }}>
              <button onClick={() => setShowProfile(false)} style={{
                position: "absolute", top: "1rem", right: "1rem",
                background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
              }}>
                <X size={16} weight="bold" />
              </button>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "1rem",
              }}>
                {initials}
              </div>
              <h2 style={{ color: "#fff", fontSize: "1.35rem", fontWeight: 800, margin: 0 }}>{sellerName}</h2>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Studio Keramik Dinoyo · Mitra Aktif
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <span style={{
                  background: "rgba(255,255,255,0.2)", color: "#fff",
                  fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.6rem",
                  borderRadius: "9999px", letterSpacing: "0.04em",
                }}>
                  ✓ Terverifikasi
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid var(--line)" }}>
              {[
                { icon: Receipt, label: "Total Pesanan", value: "24" },
                { icon: Star, label: "Rating", value: "4.9" },
                { icon: ChartBar, label: "Produk Aktif", value: "12" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "1.25rem", textAlign: "center", borderRight: i < 2 ? "1px solid var(--line)" : "none" }}>
                  <s.icon size={20} color="var(--clay)" style={{ margin: "0 auto 0.4rem" }} />
                  <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--bark)", margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: "0.15rem 0 0" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Info */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: Package, label: "Nama Pemilik", value: sellerName },
                { icon: MapPin, label: "Lokasi", value: "Kampung Keramik Dinoyo, Malang" },
                { icon: Storefront, label: "Nama Toko", value: "Studio Keramik Dinoyo" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "0.5rem",
                    background: "var(--clay-muted, #f5ede0)", color: "var(--clay)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <row.icon size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: 0 }}>{row.label}</p>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--bark)", margin: 0 }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "0 1.5rem 1.5rem" }}>
              <Link
                href="/mitra/dashboard/profil"
                onClick={() => setShowProfile(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "100%", padding: "0.8rem", borderRadius: "0.75rem",
                  background: "var(--clay)", color: "#fff", fontWeight: 700,
                  textDecoration: "none", fontSize: "0.9rem",
                  fontFamily: "var(--font-outfit), sans-serif",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--clay-dark, #8b4a2a)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--clay)")}
              >
                Edit Profil Toko
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
