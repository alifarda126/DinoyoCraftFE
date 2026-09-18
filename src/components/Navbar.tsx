"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "@/store/cartStore";

const navLinks = [
  { href: "/",                 label: "Beranda" },
  { href: "/produk",           label: "Produk" },
  { href: "/daftar-toko",      label: "Daftar Toko" },
  { href: "/workshop",         label: "Workshop & Wisata" },
  { href: "/dashboard/bantuan",label: "Bantuan" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      role="navigation"
      aria-label="Navigasi utama"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: `1px solid ${scrolled ? "rgba(184,92,60,0.12)" : "rgba(184,92,60,0.07)"}`,
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
        boxShadow: scrolled ? "0 1px 20px rgba(61,43,31,0.06)" : "none",
      }}
      className="navbar-glass"
    >
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-6">

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <Link href="/" aria-label="DinoyoCraft — Halaman Utama" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-outfit), sans-serif",
            fontWeight: 800, fontSize: "1.15rem",
            letterSpacing: "-0.03em", color: "var(--bark)",
          }}>
            Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span>
          </span>
        </Link>

        {/* ── Inline text nav — dot-separated ──────────────────────── */}
        <div className="hidden lg:flex items-center" style={{ flex: 1, justifyContent: "center", gap: 0 }}>
          {navLinks.map(({ href, label }, i) => {
            const active = isActive(href);
            return (
              <span key={href} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span aria-hidden style={{ color: "rgba(0,0,0,0.18)", fontSize: "0.5rem", margin: "0 0.05rem", userSelect: "none" }}>
                    &bull;
                  </span>
                )}
                <Link
                  href={href}
                  style={{
                    position: "relative",
                    padding: "0.35rem 0.7rem",
                    fontSize: "0.85rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--bark)" : "var(--bark-muted)",
                    textDecoration: "none",
                    transition: "color 0.18s",
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--bark)"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--bark-muted)"; }}
                >
                  {label}
                  {active && (
                    <span style={{
                      position: "absolute", bottom: 0,
                      left: "0.7rem", right: "0.7rem",
                      height: "1.5px", borderRadius: "9999px",
                      background: "var(--clay)",
                    }} />
                  )}
                </Link>
              </span>
            );
          })}
        </div>

        {/* ── Action Buttons ────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Cart Icon */}
          <Link
            href="/keranjang"
            style={{
              position: "relative",
              color: "var(--bark)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bark)")}
          >
            <ShoppingCart size={24} weight="regular" />
            {totalItems > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-8px",
                  background: "#e53e3e", // Red badge
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* Masuk — pojok kanan, kotak berbackground */}
          <Link
            href="/auth"
            id="navbar-masuk-btn"
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "0.45rem 1.25rem",
              borderRadius: "0.5rem",
              background: "var(--clay)",
              color: "#fff",
              fontWeight: 600, fontSize: "0.875rem",
              textDecoration: "none", flexShrink: 0,
              letterSpacing: "-0.01em",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              boxShadow: "0 2px 8px rgba(184,92,60,0.22)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--clay-dark)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(184,92,60,0.32)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--clay)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(184,92,60,0.22)";
            }}
          >
            Masuk
          </Link>
        </div>
      </div>
    </nav>
  );
}
