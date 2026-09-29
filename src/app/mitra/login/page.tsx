"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { setDemoSession } from "@/lib/demo";
import { ArrowLeft, ArrowRight, Storefront, Leaf } from "@phosphor-icons/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function MitraLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (mode === "signup") {
        toast.success("Akun berhasil dibuat! Silakan lengkapi profil toko.");
        router.push("/seller/registrasi");
        return;
      }
      setDemoSession("seller");
      toast.success("Login Mitra berhasil!");
      router.push("/seller");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    setDemoSession("seller");
    toast.success("Masuk sebagai Mitra (Demo)");
    router.push("/seller");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        fontFamily: pjs.style.fontFamily,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f5ede0 0%, #ede5d8 40%, #e8dcc8 100%)",
      }}
    >
      {/* ── Ceramic-themed background decoration ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Large organic blob left */}
        <svg style={{ position: "absolute", top: "-10%", left: "-8%", width: "55vw", opacity: 0.18 }} viewBox="0 0 600 600" fill="none">
          <ellipse cx="300" cy="300" rx="300" ry="260" fill="var(--clay)" transform="rotate(-20 300 300)" />
        </svg>
        {/* Clay circle right */}
        <svg style={{ position: "absolute", bottom: "-12%", right: "-10%", width: "50vw", opacity: 0.14 }} viewBox="0 0 500 500" fill="none">
          <ellipse cx="250" cy="250" rx="250" ry="210" fill="var(--moss)" transform="rotate(15 250 250)" />
        </svg>
        {/* Ceramic pot silhouette left */}
        <svg style={{ position: "absolute", top: "20%", left: "3%", width: "220px", opacity: 0.09 }} viewBox="0 0 200 300" fill="none">
          <path d="M60 20 Q40 80 30 140 Q20 200 60 240 Q100 280 140 240 Q180 200 170 140 Q160 80 140 20 Z" fill="var(--bark)" />
          <ellipse cx="100" cy="20" rx="40" ry="10" fill="var(--bark)" />
        </svg>
        {/* Ceramic pot silhouette right */}
        <svg style={{ position: "absolute", bottom: "10%", right: "5%", width: "180px", opacity: 0.08 }} viewBox="0 0 200 300" fill="none">
          <path d="M60 20 Q40 80 30 140 Q20 200 60 240 Q100 280 140 240 Q180 200 170 140 Q160 80 140 20 Z" fill="var(--clay)" />
          <ellipse cx="100" cy="20" rx="40" ry="10" fill="var(--clay)" />
        </svg>
        {/* Top-right swirl ornament */}
        <svg style={{ position: "absolute", top: "5%", right: "8%", width: "260px", opacity: 0.1 }} viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="var(--bark)" strokeWidth="3" strokeDasharray="14 8" />
          <circle cx="100" cy="100" r="60" stroke="var(--clay)" strokeWidth="2" strokeDasharray="8 6" />
          <circle cx="100" cy="100" r="30" stroke="var(--moss)" strokeWidth="2" />
        </svg>
        {/* Bottom-left swirl */}
        <svg style={{ position: "absolute", bottom: "8%", left: "6%", width: "200px", opacity: 0.08 }} viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="var(--clay)" strokeWidth="3" strokeDasharray="12 8" />
          <circle cx="100" cy="100" r="55" stroke="var(--bark)" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
        {/* Scattered dots pattern — top */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            top: `${8 + (i % 3) * 12}%`,
            left: `${15 + i * 6}%`,
            width: 6 + (i % 3) * 4,
            height: 6 + (i % 3) * 4,
            borderRadius: "50%",
            background: i % 2 === 0 ? "var(--clay)" : "var(--moss)",
            opacity: 0.12,
          }} />
        ))}
        {/* Wavy line decoration */}
        <svg style={{ position: "absolute", top: "35%", left: 0, width: "30vw", opacity: 0.06 }} viewBox="0 0 300 100" fill="none">
          <path d="M0 50 Q30 20 60 50 Q90 80 120 50 Q150 20 180 50 Q210 80 240 50 Q270 20 300 50" stroke="var(--bark)" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <svg style={{ position: "absolute", bottom: "30%", right: 0, width: "28vw", opacity: 0.06 }} viewBox="0 0 300 100" fill="none">
          <path d="M0 50 Q30 80 60 50 Q90 20 120 50 Q150 80 180 50 Q210 20 240 50 Q270 80 300 50" stroke="var(--clay)" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Header ── */}
      <header style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "0.875rem 2rem",
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <ArrowLeft size={16} style={{ color: "var(--bark-muted)" }} />
            <span style={{ fontWeight: 700, color: "var(--bark)", fontSize: "0.9rem" }}>Kembali ke Beranda</span>
          </Link>

          {/* DinoyoCraft Mitra + logo icon */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "var(--bark)" }}>
              Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span> Mitra
            </span>
            <div style={{
              width: 34, height: 34, borderRadius: "0.625rem",
              background: "linear-gradient(135deg, var(--clay), #c0673d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(180,90,50,0.3)",
            }}>
              <Storefront size={18} weight="fill" color="#fff" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ padding: "3rem 2rem", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}>
          <div style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            border: "1.5px solid rgba(255,255,255,0.8)",
            borderRadius: "1.75rem",
            padding: "2.5rem 2.25rem",
            boxShadow: "0 8px 40px rgba(120,70,30,0.12), 0 1px 2px rgba(0,0,0,0.04)",
          }}>

            {/* ① Switch Masuk / Daftar — PALING ATAS, ukuran besar */}
            <div style={{ display: "flex", borderRadius: "0.875rem", border: "1.5px solid var(--line-strong)", overflow: "hidden", marginBottom: "2rem" }}>
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "0.85rem 1rem",
                    fontSize: "0.95rem",
                    fontWeight: mode === m ? 700 : 500,
                    color: mode === m ? "#fff" : "var(--bark-muted)",
                    background: mode === m
                      ? "linear-gradient(135deg, var(--clay), #c0673d)"
                      : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.22s ease",
                    fontFamily: pjs.style.fontFamily,
                    letterSpacing: mode === m ? "-0.01em" : 0,
                  }}
                >
                  {m === "signin" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

            {/* ② Logo Mitra — di bawah switch */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "1rem",
                background: "linear-gradient(135deg, var(--clay), #c0673d)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(180,90,50,0.25)",
                flexShrink: 0,
              }}>
                <Storefront size={26} weight="fill" color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bark)", margin: 0 }}>
                  {mode === "signin" ? "Masuk Mitra" : "Daftar Mitra"}
                </h1>
                <p style={{ fontSize: "0.82rem", color: "var(--bark-muted)", margin: "0.2rem 0 0", lineHeight: 1.5 }}>
                  {mode === "signin"
                    ? "Kelola toko, katalog, dan pesananmu."
                    : "Mulai bisnis dropship keramik Dinoyo."}
                </p>
              </div>
            </div>

            {/* ③ Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label htmlFor="mitra-email" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>
                  Email
                </label>
                <input
                  id="mitra-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="input-earthy"
                  required
                />
              </div>
              <div>
                <label htmlFor="mitra-password" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>
                  Password{mode === "signup" && <span style={{ color: "var(--error, #e53e3e)", marginLeft: 2 }}>*</span>}
                </label>
                <input
                  id="mitra-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="input-earthy"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.85rem",
                  borderRadius: "0.75rem",
                  background: loading
                    ? "var(--clay-light, #d4956a)"
                    : "linear-gradient(135deg, var(--bark), #2d2a26)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                  marginTop: "0.25rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {loading ? (
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "9999px", animation: "spin 0.75s linear infinite" }} />
                ) : (
                  <>
                    {mode === "signin" ? "Masuk ke Dashboard" : "Buat Akun"}
                    <ArrowRight size={16} weight="bold" />
                  </>
                )}
              </button>
            </form>

            {/* Demo */}
            <button
              onClick={handleDemoLogin}
              style={{
                width: "100%",
                marginTop: "1rem",
                padding: "0.8rem",
                borderRadius: "0.75rem",
                border: "1.5px solid var(--line-strong)",
                background: "transparent",
                color: "var(--bark)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
                fontFamily: pjs.style.fontFamily,
              }}
            >
              Masuk sebagai Mitra Demo
            </button>

            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--bark-muted)", textAlign: "center", lineHeight: 1.6 }}>
              Belum jadi mitra?{" "}
              <button
                onClick={() => setMode("signup")}
                style={{
                  fontWeight: 700,
                  color: "var(--clay)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  padding: 0,
                  fontFamily: pjs.style.fontFamily,
                  textDecoration: "underline",
                }}
              >
                Daftar Sekarang
              </button>{" "}
              — cukup Rp350.000 sekali.
            </p>
          </div>

          {/* Badge bawah card */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem", opacity: 0.6 }}>
            <Leaf size={14} color="var(--moss)" />
            <span style={{ fontSize: "0.72rem", color: "var(--bark-muted)", fontWeight: 500 }}>
              Platform kerajinan keramik lokal Dinoyo, Malang
            </span>
            <Leaf size={14} color="var(--moss)" />
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
