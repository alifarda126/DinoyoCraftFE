"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { setDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success("Cek email untuk verifikasi akun");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login berhasil");
        router.push("/dashboard");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    }
  }

  function handleDemoLogin(role: "user" | "admin") {
    setDemoSession(role);
    toast.success(
      role === "admin"
        ? "Masuk sebagai Demo Admin"
        : "Masuk sebagai Demo Pengunjung"
    );
    router.push(role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--surface)",
        fontFamily: "var(--font-outfit), sans-serif",
      }}
      className="auth-layout"
    >
      {/* ── LEFT PANEL — Brand story ─────────────────────────────────── */}
      <div
        className="auth-left-panel"
        style={{
          background: "var(--surface-dark)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow blobs - subtle monochrome glass effect */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 320, height: 320, borderRadius: "9999px",
            background: "#ffffff", opacity: 0.05, filter: "blur(80px)",
          }} />
          <div style={{
            position: "absolute", bottom: 40, left: -40,
            width: 240, height: 240, borderRadius: "9999px",
            background: "#ffffff", opacity: 0.03, filter: "blur(100px)",
          }} />
        </div>

        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            textDecoration: "none", position: "relative", zIndex: 1,
          }}
        >
          <ArrowLeft size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
          <span style={{
            fontFamily: "var(--font-outfit), sans-serif",
            fontWeight: 800, fontSize: "1.1rem",
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
          }}>
            Dinoyo<span style={{ color: "rgba(255,255,255,0.5)" }}>Craft</span>
          </span>
        </Link>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{
            fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)", marginBottom: "1.25rem",
          }}>
            Kampung Keramik Dinoyo, Malang
          </p>
          <h2 style={{
            fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
            fontWeight: 800, letterSpacing: "-0.03em",
            lineHeight: 1.1, color: "#FFFFFF",
            maxWidth: "18ch",
          }}>
            Satu akun untuk seluruh pengalaman keramik.
          </h2>
          <p style={{
            marginTop: "1.25rem",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.7,
            maxWidth: "38ch",
          }}>
            Reservasi kelas, pesan suvenir kustom, dan jelajahi gang bengkel
            langsung dari sini.
          </p>

          {/* Stats row */}
          <div style={{
            marginTop: "2.5rem",
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}>
            {[
              { value: "50+", label: "Pengrajin" },
              { value: "200+", label: "Kelas/tahun" },
              { value: "4.9", label: "Rating" },
            ].map((s) => (
              <div key={s.label}>
                <p style={{
                  fontSize: "1.6rem", fontWeight: 800,
                  color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1,
                }}>
                  {s.value}
                </p>
                <p style={{
                  marginTop: "0.25rem",
                  fontSize: "0.75rem", color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div
          style={{
            position: "relative", zIndex: 1,
            padding: "1.25rem 1.5rem",
            borderRadius: "1rem",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{
            fontFamily: "Georgia, serif",
            fontSize: "2rem", lineHeight: 1,
            color: "rgba(255,255,255,0.4)",
            display: "block", marginBottom: "0.5rem",
          }}>&ldquo;</span>
          <p style={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.65,
          }}>
            Rombongan kantor kami 12 orang, satu transaksi selesai.
            Kode booking tinggal ditunjukkan di gang.
          </p>
          <p style={{
            marginTop: "0.75rem",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.5)",
            fontWeight: 600,
          }}>
            Ratna P. — HR Manager, Malang
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Auth form ──────────────────────────────────── */}
      <div
        className="auth-right-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "3rem 2rem",
          background: "var(--surface)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Mode toggle */}
          <div style={{
            display: "inline-flex",
            borderRadius: "9999px",
            border: "1.5px solid var(--line-strong)",
            padding: "0.2rem",
            marginBottom: "2.5rem",
            background: "#fff",
          }}>
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
                  border: "none", cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                {m === "signin" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "1.75rem", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.15,
            color: "var(--bark)", marginBottom: "0.5rem",
          }}>
            {mode === "signin" ? "Selamat datang kembali." : "Buat akun baru."}
          </h1>
          <p style={{
            fontSize: "0.875rem", color: "var(--bark-muted)",
            marginBottom: "2rem", lineHeight: 1.6,
          }}>
            {mode === "signin"
              ? "Masuk untuk melanjutkan reservasi dan pesananmu."
              : "Daftar gratis dan mulai eksplorasi Kampung Keramik Dinoyo."}
          </p>

          {/* Google button */}
          <button
            id="auth-google-btn"
            onClick={handleGoogleAuth}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              border: "1.5px solid var(--line-strong)",
              background: "#fff",
              color: "var(--bark)",
              fontSize: "0.875rem", fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
              fontFamily: "var(--font-outfit), sans-serif",
              marginBottom: "1.5rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--clay-light)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--clay-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* Google SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Lanjut dengan Google
          </button>

          {/* Divider */}
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <div style={{ borderTop: "1px solid var(--line)", width: "100%" }} />
            <span style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              padding: "0 0.75rem",
              background: "var(--surface)",
              fontSize: "0.75rem", color: "var(--bark-muted)", fontWeight: 500,
            }}>atau dengan email</span>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                htmlFor="auth-email"
                style={{
                  display: "block", fontSize: "0.82rem", fontWeight: 600,
                  color: "var(--bark)", marginBottom: "0.4rem",
                }}
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="input-earthy"
                required
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                style={{
                  display: "block", fontSize: "0.82rem", fontWeight: 600,
                  color: "var(--bark)", marginBottom: "0.4rem",
                }}
              >
                Password
              </label>
              <input
                id="auth-password"
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
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.8rem",
                borderRadius: "0.75rem",
                background: loading ? "var(--clay-light)" : "var(--clay)",
                color: "#fff",
                fontWeight: 700, fontSize: "0.9rem",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s, transform 0.15s",
                boxShadow: loading ? "none" : "0 4px 16px rgba(0,0,0,0.15)",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.background = "var(--clay-dark)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = loading ? "var(--clay-light)" : "var(--clay)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <span style={{
                  display: "inline-block", width: 16, height: 16,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "9999px",
                  animation: "spin 0.75s linear infinite",
                }} />
              ) : (
                <>
                  {mode === "signin" ? "Masuk" : "Buat Akun"}
                  <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p style={{
            textAlign: "center", fontSize: "0.82rem",
            color: "var(--bark-muted)", marginTop: "1.5rem",
          }}>
            {mode === "signin" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              style={{
                background: "none", border: "none",
                color: "var(--clay)", fontWeight: 700,
                fontSize: "0.82rem", cursor: "pointer",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
            >
              {mode === "signin" ? "Daftar" : "Masuk"}
            </button>
          </p>

          {/* ── DEMO SECTION ──────────────────────────────────────────── */}
          <div style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--line)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              marginBottom: "0.875rem",
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              <span style={{
                fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--bark-muted)",
                fontFamily: "var(--font-geist-mono), monospace",
              }}>
                Akses Demo Cepat
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            </div>
            
            <p style={{
              fontSize: "0.75rem", color: "var(--bark-muted)",
              textAlign: "center", marginBottom: "1rem", lineHeight: 1.6,
            }}>
              Coba fitur aplikasi tanpa perlu login
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                id="auth-demo-user-btn"
                onClick={() => handleDemoLogin("user")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "0.85rem",
                  borderRadius: "0.75rem",
                  border: "1.5px solid var(--line-strong)",
                  background: "#fff",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--clay)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--clay-muted)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--bark)" }}>
                  Pengunjung
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--bark-muted)", marginTop: "0.2rem" }}>
                  (Eksplor & Reservasi)
                </span>
              </button>

              <button
                id="auth-demo-admin-btn"
                onClick={() => handleDemoLogin("admin")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "0.85rem",
                  borderRadius: "0.75rem",
                  border: "1.5px solid var(--clay)",
                  background: "transparent",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--clay-muted)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--clay)" }}>
                  Admin Staff
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--clay)", marginTop: "0.2rem", opacity: 0.8 }}>
                  (Kelola Data & Pesanan)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-layout { grid-template-columns: 1fr !important; }
          .auth-left-panel { display: none !important; }
          .auth-right-panel { padding: 2rem 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}
