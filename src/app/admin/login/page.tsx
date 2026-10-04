"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { setDemoSession } from "@/lib/utils/demo";
import { ArrowLeft, ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.toLowerCase().includes("admin")) {
      toast.error("Kredensial tidak dikenali.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDemoSession("admin");
      toast.success("Login Admin berhasil (Mock)");
      router.push("/admin");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--bark)",
    marginBottom: "0.35rem",
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: pjs.style.fontFamily,
        background: "linear-gradient(135deg, #fdf6ee 0%, #f5ece0 50%, #ede3d4 100%)",
        padding: "2rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorations */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <svg style={{ position: "absolute", top: "8%", left: "2%", width: "36vw", opacity: 0.07 }} viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="180" stroke="var(--clay)" strokeWidth="2" strokeDasharray="20 10" />
          <circle cx="200" cy="200" r="140" stroke="var(--bark)" strokeWidth="1.5" strokeDasharray="14 8" />
          <circle cx="200" cy="200" r="100" stroke="var(--moss)" strokeWidth="1" strokeDasharray="8 6" />
          <circle cx="200" cy="200" r="60" stroke="var(--clay)" strokeWidth="1" />
        </svg>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            top: `${10 + (i % 4) * 22}%`,
            left: `${5 + i * 10}%`,
            width: 5 + (i % 3) * 3,
            height: 5 + (i % 3) * 3,
            borderRadius: "50%",
            background: i % 2 === 0 ? "var(--clay)" : "var(--moss)",
            opacity: 0.09,
          }} />
        ))}
        <svg style={{ position: "absolute", top: "-15%", right: "-5%", width: "42vw", opacity: 0.055 }} viewBox="0 0 500 500" fill="none">
          <ellipse cx="250" cy="250" rx="240" ry="200" fill="var(--moss)" transform="rotate(20 250 250)" />
        </svg>
      </div>

      {/* Back link */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420, marginBottom: "0.75rem" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            color: "var(--bark-muted)", textDecoration: "none",
            fontSize: "0.82rem", fontWeight: 600,
            transition: "color 0.2s",
          }}
        >
          <ArrowLeft size={14} weight="bold" />
          Kembali ke beranda
        </Link>
      </div>

      {/* Card */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420 }}>
        <div style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.9)",
          borderRadius: "1.5rem",
          padding: "2.25rem 2rem",
          boxShadow: "0 8px 48px rgba(120,70,30,0.14), 0 1px 2px rgba(0,0,0,0.04)",
        }}>
          {/* Brand logo inside card */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "1.75rem" }}>
            <div style={{
              width: 38, height: 38, borderRadius: "0.7rem",
              background: "linear-gradient(135deg, var(--clay), #c0673d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(180,90,50,0.28)",
              flexShrink: 0, overflow: "hidden",
            }}>
              <Image src="/images/logo.png" alt="DinoyoCraft" width={26} height={26} style={{ filter: "brightness(0) invert(1)", objectFit: "contain" }} />
            </div>
            <div>
              <span style={{ fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-0.04em", color: "var(--bark)", lineHeight: 1 }}>
                Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span>
              </span>
              <span style={{
                display: "block", fontSize: "0.65rem", fontWeight: 700,
                color: "var(--clay)", letterSpacing: "0.06em", textTransform: "uppercase",
                opacity: 0.8, marginTop: "0.1rem",
              }}>
                Admin Portal
              </span>
            </div>
          </div>

          {/* Admin badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "rgba(184,92,60,0.08)",
            border: "1px solid rgba(184,92,60,0.2)",
            borderRadius: "999px",
            padding: "0.3rem 0.75rem",
            marginBottom: "1rem",
          }}>
            <ShieldCheck size={13} weight="fill" color="var(--clay)" />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--clay)", letterSpacing: "0.04em" }}>
              Akses Terbatas
            </span>
          </div>

          <h1 style={{
            fontSize: "1.45rem", fontWeight: 800,
            letterSpacing: "-0.03em", color: "var(--bark)",
            margin: "0 0 0.35rem",
          }}>
            Masuk Admin
          </h1>
          <p style={{
            fontSize: "0.82rem", color: "var(--bark-muted)",
            marginBottom: "1.75rem", lineHeight: 1.6,
          }}>
            Area khusus pengelola DinoyoCraft. Halaman ini tidak ditautkan ke mana pun demi keamanan.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div>
              <label htmlFor="admin-email" style={labelStyle}>Email Admin</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dinoyocraft.id"
                className="input-earthy"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password" style={labelStyle}>Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="input-earthy"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.85rem", borderRadius: "0.75rem",
                background: loading
                  ? "var(--clay-light, #d4956a)"
                  : "linear-gradient(135deg, var(--clay) 0%, #c0673d 100%)",
                color: "#fff", fontWeight: 700, fontSize: "0.95rem",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s, transform 0.15s",
                letterSpacing: "-0.01em", fontFamily: pjs.style.fontFamily,
                boxShadow: "0 4px 16px rgba(184,92,60,0.35)",
                marginTop: "0.25rem",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              {loading ? (
                <span style={{
                  display: "inline-block", width: 16, height: 16,
                  border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  borderRadius: "9999px", animation: "spin 0.75s linear infinite",
                }} />
              ) : (
                <>Masuk ke Dashboard <ArrowRight size={16} weight="bold" /></>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: "1.25rem",
            background: "rgba(184,92,60,0.05)",
            border: "1px dashed rgba(184,92,60,0.25)",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
          }}>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--bark-muted)", lineHeight: 1.6, textAlign: "center" }}>
              Gunakan email ber-awalan{" "}
              <span style={{ fontWeight: 700, color: "var(--clay)" }}>&quot;admin&quot;</span>
              {" "}(mis.{" "}
              <span style={{ fontWeight: 600 }}>admin@dinoyocraft.id</span>
              ) untuk masuk sebagai demo.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--bark)", fontWeight: 600, opacity: 0.85 }}>
            &copy; {new Date().getFullYear()} DinoyoCraft. Hak Cipta Dilindungi.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}