"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { setDemoSession } from "@/lib/utils/demo";
import { ArrowLeft, ArrowRight, Storefront, Leaf, CheckCircle, CheckSquare } from "@phosphor-icons/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

const SYARAT = [
  "Fotokopi KTP pemilik usaha yang masih berlaku",
  "Surat keterangan usaha / NIB (Nomor Induk Berusaha)",
  "Foto produk keramik yang akan dijual (min. 3 foto)",
  "Menyetujui SOP & ketentuan penjualan DinoyoCraft",
  "Nomor WhatsApp aktif untuk koordinasi pesanan",
];

export default function MitraLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  // Signin state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup extra fields
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noWa, setNoWa] = useState("");
  const [namaToko, setNamaToko] = useState("");
  const [alamatToko, setAlamatToko] = useState("");
  const [tahunUsaha, setTahunUsaha] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
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

    if (mode === "signup") {
      if (!namaLengkap.trim()) addError("reg-nama", "Nama Lengkap wajib diisi");
      if (!noWa.trim()) addError("reg-wa", "Nomor HP wajib diisi");
    }

    if (!email.trim()) addError("mitra-email", "Email wajib diisi");
    else if (!/\S+@\S+\.\S+/.test(email)) addError("mitra-email", "Format email tidak valid");

    if (!password) addError("mitra-password", "Password wajib diisi");
    else if (password.length < 8) addError("mitra-password", "Password min. 8 karakter");

    if (mode === "signup") {
      if (!namaToko.trim()) addError("reg-toko", "Nama Toko wajib diisi");
      if (!alamatToko.trim()) addError("reg-alamat", "Alamat Lengkap Workshop wajib diisi");
      if (!tahunUsaha) addError("reg-tahun", "Tahun Mulai Usaha wajib diisi");
      if (!konfirmasiPassword) addError("mitra-konfirmasi-password", "Konfirmasi password wajib diisi");
      else if (password !== konfirmasiPassword) addError("mitra-konfirmasi-password", "Password tidak cocok");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const el = document.getElementById(firstErrorField);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
      return;
    }

    if (mode === "signup" && !agreed) {
      toast.error("Harap centang persetujuan persyaratan terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (mode === "signup") {
        toast.success("Akun berhasil dibuat! Tim admin akan meninjau dalam 1×24 jam.");
        router.push("/mitra/dashboard");
        return;
      }
      setDemoSession("seller");
      toast.success("Login Mitra berhasil!");
      router.push("/mitra/dashboard");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setDemoSession("seller");
      toast.success("Login dengan Google berhasil!");
      router.push("/mitra/dashboard");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: "0.65rem",
    border: "1.5px solid rgba(0,0,0,0.13)",
    fontSize: "0.88rem",
    fontFamily: pjs.style.fontFamily,
    background: "#fafaf9",
    outline: "none",
    color: "var(--bark)",
    boxSizing: "border-box",
  };

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
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: pjs.style.fontFamily,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f5ede0 0%, #ede5d8 40%, #e8dcc8 100%)",
      }}
    >
      {/* ── Background decorations ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <svg style={{ position: "absolute", top: "-10%", left: "-8%", width: "55vw", opacity: 0.18 }} viewBox="0 0 600 600" fill="none">
          <ellipse cx="300" cy="300" rx="300" ry="260" fill="var(--clay)" transform="rotate(-20 300 300)" />
        </svg>
        <svg style={{ position: "absolute", bottom: "-12%", right: "-10%", width: "50vw", opacity: 0.14 }} viewBox="0 0 500 500" fill="none">
          <ellipse cx="250" cy="250" rx="250" ry="210" fill="var(--moss)" transform="rotate(15 250 250)" />
        </svg>
        <svg style={{ position: "absolute", top: "20%", left: "3%", width: "220px", opacity: 0.09 }} viewBox="0 0 200 300" fill="none">
          <path d="M60 20 Q40 80 30 140 Q20 200 60 240 Q100 280 140 240 Q180 200 170 140 Q160 80 140 20 Z" fill="var(--bark)" />
          <ellipse cx="100" cy="20" rx="40" ry="10" fill="var(--bark)" />
        </svg>
        <svg style={{ position: "absolute", bottom: "10%", right: "5%", width: "180px", opacity: 0.08 }} viewBox="0 0 200 300" fill="none">
          <path d="M60 20 Q40 80 30 140 Q20 200 60 240 Q100 280 140 240 Q180 200 170 140 Q160 80 140 20 Z" fill="var(--clay)" />
          <ellipse cx="100" cy="20" rx="40" ry="10" fill="var(--clay)" />
        </svg>
        <svg style={{ position: "absolute", top: "5%", right: "8%", width: "260px", opacity: 0.1 }} viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="var(--bark)" strokeWidth="3" strokeDasharray="14 8" />
          <circle cx="100" cy="100" r="60" stroke="var(--clay)" strokeWidth="2" strokeDasharray="8 6" />
          <circle cx="100" cy="100" r="30" stroke="var(--moss)" strokeWidth="2" />
        </svg>
        <svg style={{ position: "absolute", bottom: "8%", left: "6%", width: "200px", opacity: 0.08 }} viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="var(--clay)" strokeWidth="3" strokeDasharray="12 8" />
          <circle cx="100" cy="100" r="55" stroke="var(--bark)" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
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
      <main style={{ flex: 1, overflowY: "auto", overscrollBehaviorY: "contain", padding: "3rem 2rem", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: mode === "signup" ? 520 : 460, margin: "0 auto" }}>
          <div style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            border: "1.5px solid rgba(255,255,255,0.8)",
            borderRadius: "1.75rem",
            padding: "2.5rem 2.25rem",
            boxShadow: "0 8px 40px rgba(120,70,30,0.12), 0 1px 2px rgba(0,0,0,0.04)",
          }}>

            {/* ① Logo + Judul */}
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
                    : "Mulai bisnis keramik bersama DinoyoCraft."}
                </p>
              </div>
            </div>

            {/* ③ Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* ── SIGNUP: Data Pribadi ── */}
              {mode === "signup" && (
                <>
                  <p style={{ fontSize: "0.73rem", fontWeight: 700, color: "var(--bark)", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0.25rem 0 -0.25rem" }}>
                    Data Pribadi
                  </p>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <label htmlFor="reg-nama" style={labelStyle}>Nama Lengkap</label>
                      {errors["reg-nama"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-nama"]}</span>}
                    </div>
                    <input
                      id="reg-nama" type="text"
                      value={namaLengkap} onChange={(e) => { setNamaLengkap(e.target.value); if (errors["reg-nama"]) setErrors(p => ({ ...p, "reg-nama": "" })); }}
                      placeholder="Sesuai KTP" style={{ ...inputStyle, borderColor: errors["reg-nama"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <label htmlFor="reg-wa" style={labelStyle}>Nomor HP (WhatsApp)</label>
                      {errors["reg-wa"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-wa"]}</span>}
                    </div>
                    <input
                      id="reg-wa" type="tel"
                      value={noWa} onChange={(e) => { setNoWa(e.target.value); if (errors["reg-wa"]) setErrors(p => ({ ...p, "reg-wa": "" })); }}
                      placeholder="08..." style={{ ...inputStyle, borderColor: errors["reg-wa"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                    />
                  </div>
                </>
              )}

              {/* ── Email (keduanya) ── */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="mitra-email" style={labelStyle}>Email</label>
                  {errors["mitra-email"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["mitra-email"]}</span>}
                </div>
                <input
                  id="mitra-email" type="email"
                  value={email} onChange={(e) => { setEmail(e.target.value); if (errors["mitra-email"]) setErrors(p => ({ ...p, "mitra-email": "" })); }}
                  placeholder="nama@email.com" className="input-earthy"
                  style={errors["mitra-email"] ? { borderColor: "#e53e3e" } : {}}
                />
              </div>

              {/* ── SIGNUP: Data Toko ── */}
              {mode === "signup" && (
                <>
                  <p style={{ fontSize: "0.73rem", fontWeight: 700, color: "var(--bark)", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0.25rem 0 -0.25rem" }}>
                    Data Toko / Workshop
                  </p>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <label htmlFor="reg-toko" style={labelStyle}>Nama Toko</label>
                      {errors["reg-toko"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-toko"]}</span>}
                    </div>
                    <input
                      id="reg-toko" type="text"
                      value={namaToko} onChange={(e) => { setNamaToko(e.target.value); if (errors["reg-toko"]) setErrors(p => ({ ...p, "reg-toko": "" })); }}
                      placeholder="Contoh: Studio Keramik Bumi" style={{ ...inputStyle, borderColor: errors["reg-toko"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <label htmlFor="reg-alamat" style={labelStyle}>Alamat Lengkap Workshop</label>
                      {errors["reg-alamat"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-alamat"]}</span>}
                    </div>
                    <textarea
                      id="reg-alamat"
                      value={alamatToko} onChange={(e) => { setAlamatToko(e.target.value); if (errors["reg-alamat"]) setErrors(p => ({ ...p, "reg-alamat": "" })); }}
                      placeholder="Jalan, RT/RW, Kelurahan..."
                      style={{ ...inputStyle, minHeight: "80px", resize: "vertical", borderColor: errors["reg-alamat"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <label htmlFor="reg-tahun" style={labelStyle}>Tahun Mulai Usaha</label>
                      {errors["reg-tahun"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-tahun"]}</span>}
                    </div>
                    <input
                      id="reg-tahun" type="number"
                      value={tahunUsaha} onChange={(e) => { setTahunUsaha(e.target.value); if (errors["reg-tahun"]) setErrors(p => ({ ...p, "reg-tahun": "" })); }}
                      placeholder="Contoh: 2018" min={1990} max={new Date().getFullYear()}
                      style={{ ...inputStyle, borderColor: errors["reg-tahun"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                    />
                  </div>
                </>
              )}

              {/* ── Password (keduanya) ── */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="mitra-password" style={labelStyle}>
                    Password{mode === "signup" && <span style={{ color: "var(--error, #e53e3e)", marginLeft: 2 }}>*</span>}
                  </label>
                  {errors["mitra-password"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["mitra-password"]}</span>}
                </div>
                <input
                  id="mitra-password" type="password"
                  value={password} onChange={(e) => { setPassword(e.target.value); if (errors["mitra-password"]) setErrors(p => ({ ...p, "mitra-password": "" })); }}
                  placeholder="Minimal 8 karakter" className="input-earthy"
                  style={errors["mitra-password"] ? { borderColor: "#e53e3e" } : {}}
                />
              </div>

              {/* ── SIGNUP: Konfirmasi Password ── */}
              {mode === "signup" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <label htmlFor="mitra-konfirmasi-password" style={labelStyle}>
                      Konfirmasi Password<span style={{ color: "var(--error, #e53e3e)", marginLeft: 2 }}>*</span>
                    </label>
                    {errors["mitra-konfirmasi-password"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["mitra-konfirmasi-password"]}</span>}
                  </div>
                  <input
                    id="mitra-konfirmasi-password" type="password"
                    value={konfirmasiPassword} onChange={(e) => { setKonfirmasiPassword(e.target.value); if (errors["mitra-konfirmasi-password"]) setErrors(p => ({ ...p, "mitra-konfirmasi-password": "" })); }}
                    placeholder="Masukkan ulang password" className="input-earthy"
                    style={errors["mitra-konfirmasi-password"] ? { borderColor: "#e53e3e" } : {}}
                  />
                </div>
              )}

              {/* ── SIGNUP: Persyaratan ── */}
              {mode === "signup" && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(184,92,60,0.06), rgba(120,160,80,0.04))",
                  border: "1.5px solid rgba(184,92,60,0.18)",
                  borderRadius: "0.875rem",
                  padding: "0.9rem 1rem",
                }}>
                  <p style={{
                    fontSize: "0.73rem", fontWeight: 700, color: "var(--clay)",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    marginBottom: "0.6rem",
                  }}>
                    Persyaratan Daftar Mitra
                  </p>
                  {SYARAT.map((req, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", marginBottom: i < SYARAT.length - 1 ? "0.4rem" : 0 }}>
                      <CheckCircle size={14} weight="fill" color="var(--clay)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: "0.76rem", color: "var(--bark-muted)", lineHeight: 1.45 }}>{req}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── SIGNUP: Checkbox persetujuan ── */}
              {mode === "signup" && (
                <label style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem", cursor: "pointer" }}>
                  <div
                    onClick={() => setAgreed(!agreed)}
                    style={{
                      width: 20, height: 20, borderRadius: "0.35rem",
                      border: `2px solid ${agreed ? "var(--clay)" : "var(--line-strong)"}`,
                      background: agreed ? "var(--clay)" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, cursor: "pointer", transition: "all 0.15s", marginTop: "0.1rem",
                    }}
                  >
                    {agreed && <CheckSquare size={12} color="#fff" weight="fill" />}
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--bark)", lineHeight: 1.6 }}>
                    Saya menyetujui{" "}
                    <Link href="#" style={{ color: "var(--clay)", fontWeight: 700 }}>Syarat & Ketentuan</Link>
                    {" "}serta persyaratan pendaftaran Mitra DinoyoCraft.
                  </span>
                </label>
              )}

              {/* ── Lupa Password (signin only) ── */}
              {mode === "signin" && (
                <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
                  <Link href="/mitra/lupa-kata-sandi" style={{ fontSize: "0.78rem", color: "var(--clay)", fontWeight: 600, textDecoration: "none" }}>
                    Lupa kata sandi?
                  </Link>
                </div>
              )}

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={loading || (mode === "signup" && !agreed)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  padding: "0.85rem",
                  borderRadius: "0.75rem",
                  background: loading ? "var(--clay-light, #d4956a)" : (mode === "signup" && !agreed) ? "#e5e7eb" : "linear-gradient(135deg, var(--bark), #2d2a26)",
                  color: (mode === "signup" && !agreed) ? "#9ca3af" : "#fff",
                  fontWeight: 700, fontSize: "0.95rem", border: "none",
                  cursor: (loading || (mode === "signup" && !agreed)) ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s, background 0.2s, color 0.2s",
                  marginTop: "0.25rem",
                  letterSpacing: "-0.01em",
                  fontFamily: pjs.style.fontFamily,
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

            {/* ── Divider ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--line-strong)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--bark-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>atau</span>
              <div style={{ flex: 1, height: 1, background: "var(--line-strong)" }} />
            </div>

            {/* ── Google Login ── */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                padding: "0.8rem", borderRadius: "0.75rem",
                border: "1.5px solid var(--line-strong)", background: "#fff",
                color: "var(--bark)", fontWeight: 600, fontSize: "0.875rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "border-color 0.2s, box-shadow 0.2s",
                fontFamily: pjs.style.fontFamily, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.borderColor = "#4285F4";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(66,133,244,0.18)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>

            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--bark-muted)", textAlign: "center", lineHeight: 1.6 }}>
              Sudah punya akun?{" "}
              <Link
                href="/mitra/login"
                style={{
                  fontWeight: 700, color: "var(--clay)",
                  fontSize: "0.75rem",
                  textDecoration: "underline",
                }}
              >
                Masuk Sekarang
              </Link>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
