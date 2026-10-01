"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, SignOut, ArrowRight } from "@phosphor-icons/react";
import { getDemoSession, clearDemoSession, DemoSession } from "@/lib/utils/demo";

const navLinks = [
  { href: "/#apa-itu", label: "Apa Itu" },
  { href: "/#cara", label: "Cara Kerja" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    setSession(getDemoSession());
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    clearDemoSession();
    setSession(null);
    router.push("/");
  };

  const isMitra = session?.role === "seller";

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
        <Link href="/" aria-label="DinoyoCraft — Halaman Utama" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-outfit), sans-serif",
            fontWeight: 800, fontSize: "1.15rem",
            letterSpacing: "-0.03em", color: "var(--bark)",
          }}>
            Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center" style={{ flex: 1, justifyContent: "center", gap: 0 }}>
          {navLinks.map(({ href, label }, i) => (
            <span key={href} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <span aria-hidden style={{ color: "rgba(0,0,0,0.18)", fontSize: "0.5rem", margin: "0 0.05rem", userSelect: "none" }}>
                  &bull;
                </span>
              )}
              <Link
                href={href}
                style={{
                  padding: "0.35rem 0.7rem",
                  fontSize: "0.85rem",
                  fontWeight: 400,
                  color: "var(--bark-muted)",
                  textDecoration: "none",
                  transition: "color 0.18s",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--bark)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--bark-muted)"; }}
              >
                {label}
              </Link>
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link
                href={isMitra ? "/mitra/dashboard" : "/admin"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.45rem 1rem",
                  borderRadius: "0.5rem",
                  background: "var(--clay)",
                  color: "#fff",
                  fontWeight: 600, fontSize: "0.875rem",
                  textDecoration: "none",
                  transition: "background 0.2s, transform 0.15s",
                  boxShadow: "0 2px 8px rgba(184,92,60,0.22)",
                }}
              >
                <User size={16} weight="bold" />
                Dasbor
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Keluar"
                style={{
                  background: "transparent", border: "none", color: "var(--bark-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "color 0.2s", cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bark-muted)")}
              >
                <SignOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              href="/mitra/login"
              id="navbar-masuk-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.45rem 1.25rem",
                borderRadius: "0.5rem",
                background: "var(--clay)",
                color: "#fff",
                fontWeight: 600, fontSize: "0.875rem",
                textDecoration: "none", flexShrink: 0,
                letterSpacing: "-0.01em",
                transition: "background 0.2s, transform 0.15s",
                boxShadow: "0 2px 8px rgba(184,92,60,0.22)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--clay-dark)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--clay)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              Masuk Mitra
              <ArrowRight size={14} weight="bold" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}