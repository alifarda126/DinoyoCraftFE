"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Storefront, Package, Receipt, SignOut, ArrowLeft, ChartLineUp,
  IdentificationCard, ChatCircle, User, List
} from "@phosphor-icons/react";
import { clearDemoSession, getDemoSession } from "@/lib/utils/demo";

// ─── Badge notifikasi mock (angka nyata akan dari API) ───────────────────────
const NAV_BADGES: Record<string, number> = {
  "/mitra/dashboard/pesanan": 4,   // 4 pesanan baru menunggu
  "/mitra/dashboard/chat": 2,      // 2 pesan belum dibaca
};

function NavBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span style={{
      marginLeft: "auto",
      minWidth: 20,
      height: 20,
      borderRadius: 999,
      background: "#ef4444",
      color: "#fff",
      fontSize: "0.68rem",
      fontWeight: 800,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 5px",
      lineHeight: 1,
      flexShrink: 0,
      boxShadow: "0 1px 4px rgba(239,68,68,0.4)",
    }}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function MitraSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setSession(getDemoSession());
  }, []);

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
    <aside style={{
      width: isCollapsed ? "80px" : "250px", 
      background: "var(--surface-dark)", 
      borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column", padding: "1.5rem 1rem", flexShrink: 0,
      overflowY: "auto", overflowX: "hidden", overscrollBehavior: "none",
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", marginBottom: "2rem" }}>
        {!isCollapsed && (
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <ArrowLeft size={16} color="rgba(255,255,255,0.6)" />
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#ffffff", whiteSpace: "nowrap" }}>
              Dinoyo<span style={{ color: "rgba(255,255,255,0.6)" }}>Craft</span> Mitra
            </span>
          </Link>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.25rem", flexShrink: 0 }}
        >
          <List size={24} weight="bold" />
        </button>
      </div>

      {/* Profil Toko mini */}
      <Link
        href="/mitra/dashboard/toko-saya"
        style={{
          display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: isCollapsed ? "center" : "flex-start",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.75rem", padding: isCollapsed ? "0.75rem 0" : "0.75rem", marginBottom: "1.5rem",
          cursor: "pointer", textAlign: "left", transition: "background 0.2s",
          textDecoration: "none",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)")}
      >
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--clay), #c0673d)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: "0.8rem", fontWeight: 800, color: "#fff",
        }}>
          {initials}
        </div>
        {!isCollapsed && (
          <>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {sellerName}
              </p>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", margin: 0, whiteSpace: "nowrap" }}>Toko Saya</p>
            </div>
            <IdentificationCard size={16} color="rgba(255,255,255,0.4)" style={{ marginLeft: "auto", flexShrink: 0 }} />
          </>
        )}
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0.75rem 0" : "0.75rem 1rem", borderRadius: "0.5rem",
              textDecoration: "none", position: "relative",
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
            <item.icon size={20} weight={isActive ? "bold" : "regular"} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>}
              {!isCollapsed && <NavBadge count={NAV_BADGES[item.href] ?? 0} />}
              {isCollapsed && (NAV_BADGES[item.href] ?? 0) > 0 && (
                <div style={{ position: "absolute", top: 4, right: 12, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
              )}
            </Link>
          );
        })}
      </nav>

      <button onClick={handleSignOut} style={{
        display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: isCollapsed ? "center" : "flex-start",
        padding: isCollapsed ? "0.75rem 0" : "0.75rem 1rem", borderRadius: "0.5rem",
        border: "none", background: "transparent", color: "#ef4444",
        fontWeight: 600, cursor: "pointer", textAlign: "left",
        fontFamily: "var(--font-outfit), sans-serif",
      }}>
        <SignOut size={20} style={{ flexShrink: 0 }} />
        {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>Keluar</span>}
      </button>
    </aside>
  );
}
