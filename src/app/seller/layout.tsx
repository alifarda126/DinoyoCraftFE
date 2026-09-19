"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Storefront, Package, Receipt, SignOut, Handshake, ArrowLeft, ChartLineUp } from "@phosphor-icons/react";
import { clearDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/seller/registrasi") {
    return <>{children}</>;
  }

  async function handleSignOut() {
    clearDemoSession();
    router.push("/auth");
  }

  const navItems = [
    { href: "/seller", icon: Storefront, label: "Beranda Toko" },
    { href: "/seller/katalog", icon: Package, label: "Katalog Produk" },
    { href: "/seller/pesanan", icon: Receipt, label: "Pesanan" },
    { href: "/seller/laporan-keuangan", icon: ChartLineUp, label: "Laporan Keuangan" },
  ];

  return (
    <div style={{ minHeight: "100dvh", display: "flex", background: "var(--surface)", fontFamily: "var(--font-outfit), sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: "260px", background: "var(--surface-dark)", borderRight: "1px solid var(--line)",
        display: "flex", flexDirection: "column", padding: "1.5rem"
      }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "2rem" }}>
          <ArrowLeft size={16} color="rgba(255,255,255,0.6)" />
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#ffffff" }}>
            Dinoyo<span style={{ color: "rgba(255,255,255,0.6)" }}>Craft</span> Mitra
          </span>
        </Link>

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
                transition: "background 0.2s"
              }}>
                <item.icon size={20} weight={isActive ? "bold" : "regular"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button onClick={handleSignOut} style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.75rem 1rem", borderRadius: "0.5rem",
          border: "none", background: "transparent", color: "#ef4444",
          fontWeight: 600, cursor: "pointer", textAlign: "left"
        }}>
          <SignOut size={20} />
          Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
