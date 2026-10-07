"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ChartLineUp, 
  Storefront, 
  ShieldCheck, 
  ChatCircle,
  Robot,
  SignOut, 
  ArrowLeft,
  List
} from "@phosphor-icons/react";
import { clearDemoSession } from "@/lib/utils/demo";

// ─── Badge notifikasi mock (angka nyata akan dari API) ───────────────────────
const NAV_BADGES: Record<string, number> = {
  "/admin/verifikasi": 2,   // 2 pengajuan toko menunggu
  "/admin/moderasi": 5,     // 5 laporan belum ditangani
  "/admin/chat": 3,         // 3 pesan belum dibaca
};

// ─── Komponen badge angka kecil ───────────────────────────────────────────────
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  async function handleSignOut() {
    clearDemoSession();
    router.push("/admin/login");
  }

  const navItems = [
    { href: "/admin", icon: ChartLineUp, label: "Dasbor Admin" },
    { href: "/admin/transaksi", icon: Storefront, label: "Transaksi Lintas Toko" },
    { href: "/admin/verifikasi", icon: ShieldCheck, label: "Verifikasi Toko" },
    { href: "/admin/moderasi", icon: ShieldCheck, label: "Moderasi & Keamanan" },
    { href: "/admin/chat", icon: ChatCircle, label: "Live Chat" },
    { href: "/admin/pengaturan-ai", icon: Robot, label: "Pengaturan AI" },
  ];

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
              Dinoyo<span style={{ color: "rgba(255,255,255,0.6)" }}>Craft</span> Admin
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

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const badge = NAV_BADGES[item.href] ?? 0;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0.75rem 0" : "0.75rem 1rem", borderRadius: "0.5rem",
              textDecoration: "none", position: "relative",
              background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
              color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
              fontWeight: isActive ? 700 : 500,
              transition: "background 0.2s",
            }}>
              <item.icon size={20} weight={isActive ? "bold" : "regular"} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>}
              {!isCollapsed && <NavBadge count={badge} />}
              {isCollapsed && badge > 0 && (
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
