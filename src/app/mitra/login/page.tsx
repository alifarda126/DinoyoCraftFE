"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { setDemoSession } from "@/lib/demo";
import { ArrowLeft, ArrowRight, Storefront } from "@phosphor-icons/react";

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
        toast.success("Akun mitra berhasil dibuat (Mock)");
        return;
      }
      setDemoSession("seller");
      toast.success("Login Mitra berhasil (Mock)");
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
        background: "var(--surface)",
        fontFamily: "var(--font-outfit), sans-serif",
      }}
    >
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "1rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <ArrowLeft size={16} style={{ color: "var(--bark-muted)" }} />
            <span style={{ fontWeight: 700, color: "var(--bark)" }}>Kembali ke Beranda</span>
          </Link>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "var(--bark)" }}>
            Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span> Mitra
          </span>
        </div>
      </header>

      <main style={{ padding: "3rem 2rem" }}>
        <div style={{ width: "100%", maxWidth: 440, margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              border: "1.5px solid var(--line)",
              borderRadius: "1.5rem",
              padding: "2.5rem 2.25rem",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "1rem",
                background: "var(--surface-raised)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <Storefront size={26} weight="duotone" style={{ color: "var(--clay)" }} />
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bark)", marginBottom: "0.35rem" }}>
              {mode === "signin" ? "Masuk Mitra" : "Daftar Mitra"}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--bark-muted)", marginBottom: "1.75rem", lineHeight: 1.6 }}>
              {mode === "signin"
                ? "Masuk ke dasbor mitra untuk mengelola toko, katalog, dan pesananmu."
                : "Buat akun mitra dan mulai bisnis dropship keramikmu."}
            </p>

            {/* Mode toggle */}
            <div style={{ display: "inline-flex", borderRadius: "9999px", border: "1.5px solid var(--line-strong)", padding: "0.2rem", marginBottom: "1.75rem", background: "#fff" }}>
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: "0.4rem 1.25rem",
                    borderRadius: "9999px",
                    fontSize: "0.82rem",
                    fontWeight: mode === m ? 700 : 500,
                    color: mode === m ? "#fff" : "var(--bark-muted)",
                    background: mode === m ? "var(--clay)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                >
                  {m === "signin" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

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
                  Password
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
                  padding: "0.8rem",
                  borderRadius: "0.75rem",
                  background: loading ? "var(--clay-light)" : "var(--clay)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  marginTop: "0.25rem",
                }}
              >
                {loading ? (
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "9999px", animation: "spin 0.75s linear infinite" }} />
                ) : (
                  <>
                    {mode === "signin" ? "Masuk" : "Buat Akun"}
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
                marginTop: "1.5rem",
                padding: "0.8rem",
                borderRadius: "0.75rem",
                border: "1.5px solid var(--line-strong)",
                background: "transparent",
                color: "var(--bark)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
            >
              Masuk sebagai Mitra Demo
            </button>

            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--bark-muted)", textAlign: "center", lineHeight: 1.6 }}>
              Belum jadi mitra?{" "}
              <span style={{ fontWeight: 700, color: "var(--clay)" }}>
                Daftar Sekarang
              </span>{" "}
              — cukup Rp350.000 sekali.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}