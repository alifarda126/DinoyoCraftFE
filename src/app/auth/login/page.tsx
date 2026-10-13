"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowRight, Storefront, Leaf } from "@phosphor-icons/react";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function MitraLoginPage() {
  const router = useRouter();
  const { login, setLoading, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    let newErrors: Record<string, string> = {};
    let firstErrorField = "";

    const addError = (field: string, msg: string) => {
      newErrors[field] = msg;
      if (!firstErrorField) firstErrorField = field;
    };

    if (!email.trim()) addError("mitra-email", "Email wajib diisi");
    else if (!/\S+@\S+\.\S+/.test(email)) addError("mitra-email", "Format email tidak valid");

    if (!password) addError("mitra-password", "Password wajib diisi");
    else if (password.length < 6) addError("mitra-password", "Password min. 6 karakter");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const el = document.getElementById(firstErrorField);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        toast.success(response.message || "Login berhasil!");
        
        // Redirect berdasarkan role
        if (response.data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/mitra/dashboard");
        }
      } else {
        toast.error(response.message || "Login gagal");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      // Implementasi Google OAuth akan ditambahkan nanti
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.error("Login Google belum tersedia");
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
        fontFamily: pjs.style.fontFamily,
        background: "linear-gradient(135deg, #fdf6ee 0%, #f5ece0 50%, #ede3d4 100%)",
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
            left: `${5 + i * 5}%`,
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

      {/* Top Nav */}
      <header style={{ position: "relative", zIndex: 10, padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <Leaf size={24} color="var(--clay)" weight="fill" />
          <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--bark)" }}>DinoyoCraft</span>
        </Link>
        <Link href="/" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)", textDecoration: "none" }}>
          ← Kembali ke Beranda
        </Link>
      </header>

      {/* Main Content */}
      <main className="login-main-layout" style={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "2rem 1.5rem", 
        gap: "3rem", 
        position: "relative", 
        zIndex: 1 
      }}>
        {/* Hero Section */}
        <div className="login-hero" style={{ 
          flex: "0 0 45%", 
          maxWidth: "480px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "1.5rem" 
        }}>
          <div>
            <h1 style={{ 
              fontSize: "2.5rem", 
              fontWeight: 800, 
              color: "var(--bark)", 
              lineHeight: 1.2, 
              marginBottom: "0.75rem" 
            }}>
              Bergabung dengan <span style={{ color: "var(--clay)" }}>Mitra DinoyoCraft</span>
            </h1>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "var(--bark-muted)", 
              lineHeight: 1.6 
            }}>
              Masuk ke dashboard mitra dan kelola toko kerajinan tangan Anda dengan mudah. Jangkau lebih banyak pelanggan dan tingkatkan penjualan.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Storefront size={20} color="var(--clay)" weight="fill" />
              <span style={{ fontSize: "0.95rem", color: "var(--bark)" }}>Dashboard lengkap untuk kelola produk</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <ArrowRight size={20} color="var(--clay)" weight="fill" />
              <span style={{ fontSize: "0.95rem", color: "var(--bark)" }}>Jangkauan pelanggan yang lebih luas</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Leaf size={20} color="var(--clay)" weight="fill" />
              <span style={{ fontSize: "0.95rem", color: "var(--bark)" }}>Dukungan penuh tim DinoyoCraft</span>
            </div>
          </div>

          <div style={{ 
            marginTop: "1rem", 
            padding: "1.25rem", 
            background: "rgba(255,255,255,0.7)", 
            borderRadius: "1rem", 
            border: "1px solid rgba(255,255,255,0.9)" 
          }}>
            <Image 
              src="/images/craftwork-hero.jpg" 
              alt="Kerajinan DinoyoCraft" 
              width={400} 
              height={280} 
              style={{ width: "100%", height: "auto", borderRadius: "0.75rem" }} 
            />
          </div>
        </div>

        {/* Login Form */}
        <div style={{ flex: "0 0 400px", maxWidth: "400px" }}>
          <div style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: "1.5rem",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(120,70,30,0.12)",
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.25rem" }}>
                Masuk ke Akun Mitra
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)" }}>
                Kelola toko dan produk kerajinan Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label htmlFor="mitra-email" style={labelStyle}>Email</label>
                <input
                  id="mitra-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    fontSize: "0.9rem",
                    border: errors["mitra-email"] ? "2px solid #ef4444" : "2px solid var(--line-strong)",
                    borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.9)",
                    color: "var(--bark)",
                    outline: "none",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                />
                {errors["mitra-email"] && (
                  <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem", fontWeight: 500 }}>
                    {errors["mitra-email"]}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="mitra-password" style={labelStyle}>Password</label>
                <input
                  id="mitra-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    fontSize: "0.9rem",
                    border: errors["mitra-password"] ? "2px solid #ef4444" : "2px solid var(--line-strong)",
                    borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.9)",
                    color: "var(--bark)",
                    outline: "none",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                />
                {errors["mitra-password"] && (
                  <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem", fontWeight: 500 }}>
                    {errors["mitra-password"]}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "white",
                  background: isLoading ? "var(--bark-muted)" : "linear-gradient(135deg, var(--clay) 0%, #d97706 100%)",
                  border: "none",
                  borderRadius: "0.75rem",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(180,83,9,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isLoading && (
                  <div style={{ 
                    width: "16px", 
                    height: "16px", 
                    border: "2px solid transparent", 
                    borderTop: "2px solid white", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite" 
                  }} />
                )}
                {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
              </button>
            </form>

            <div style={{ margin: "1.5rem 0", textAlign: "center" }}>
              <div style={{ height: "1px", background: "var(--line)", margin: "0 0 1rem 0" }} />
              <span style={{ fontSize: "0.8rem", color: "var(--bark-muted)" }}>atau</span>
              <div style={{ height: "1px", background: "var(--line)", margin: "1rem 0 0 0" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.8rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--bark)",
                background: "white",
                border: "2px solid var(--line-strong)",
                borderRadius: "0.75rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
              </svg>
              Lanjutkan dengan Google
            </button>

            <p style={{ marginTop: "1rem", fontSize: "0.7rem", color: "var(--bark-muted)", textAlign: "center", lineHeight: 1.6 }}>
              Dengan masuk, kamu menyetujui{" "}
              <Link href="/syarat-ketentuan" style={{ color: "var(--clay)", fontWeight: 600 }}>Syarat & Ketentuan</Link>
              {" "}serta{" "}
              <Link href="/kebijakan-privasi" style={{ color: "var(--clay)", fontWeight: 600 }}>Kebijakan Privasi</Link>
              {" "}DinoyoCraft.
            </p>
          </div>

          {/* Daftar link below card */}
          <div style={{
            marginTop: "0.875rem",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.75)",
            borderRadius: "0.875rem",
            padding: "0.9rem 1.25rem",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
            boxShadow: "0 2px 12px rgba(120,70,30,0.07)",
          }}>
            <span style={{ fontSize: "0.82rem", color: "var(--bark-muted)" }}>Belum punya akun?</span>
            <Link href="/auth/register" style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--clay)", textDecoration: "none" }}>
              Daftar Sekarang →
            </Link>
          </div>

          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1.25rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--bark)", fontWeight: 600, opacity: 0.85 }}>
              &copy; {new Date().getFullYear()} DinoyoCraft. Hak Cipta Dilindungi.
            </span>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 800px) {
          .login-hero { display: none !important; }
          .login-main-layout { padding: 1.5rem 1rem !important; gap: 0 !important; }
          .login-main-layout > div:last-child { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}