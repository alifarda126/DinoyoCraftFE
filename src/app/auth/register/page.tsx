"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { setDemoSession } from "@/lib/utils/demo";
import { ArrowRight, Storefront, Leaf, CheckCircle, CheckSquare } from "@phosphor-icons/react";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

const SYARAT = [
  "Fotokopi KTP pemilik usaha yang masih berlaku",
  "Surat keterangan usaha / NIB (Nomor Induk Berusaha)",
  "Foto produk keramik yang akan dijual (min. 3 foto)",
  "Menyetujui SOP & ketentuan penjualan DinoyoCraft",
  "Nomor WhatsApp aktif untuk koordinasi pesanan",
];

export default function MitraRegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noWa, setNoWa] = useState("");
  const [namaToko, setNamaToko] = useState("");
  const [alamatToko, setAlamatToko] = useState("");
  const [tahunUsaha, setTahunUsaha] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [fileKTP, setFileKTP] = useState<File | null>(null);
  const [fileNIB, setFileNIB] = useState<File | null>(null);
  const [fileProduk, setFileProduk] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    let newErrors: Record<string, string> = {};
    let firstErrorField = "";

    const addError = (field: string, msg: string) => {
      newErrors[field] = msg;
      if (!firstErrorField) firstErrorField = field;
    };

    if (!namaLengkap.trim()) addError("reg-nama", "Nama Lengkap wajib diisi");
    if (!noWa.trim()) addError("reg-wa", "Nomor HP wajib diisi");
    if (!email.trim()) addError("mitra-email", "Email wajib diisi");
    else if (!/\S+@\S+\.\S+/.test(email)) addError("mitra-email", "Format email tidak valid");
    if (!namaToko.trim()) addError("reg-toko", "Nama Toko wajib diisi");
    if (!alamatToko.trim()) addError("reg-alamat", "Alamat Lengkap Workshop wajib diisi");
    if (!tahunUsaha) addError("reg-tahun", "Tahun Mulai Usaha wajib diisi");
    if (!password) addError("mitra-password", "Password wajib diisi");
    else if (password.length < 8) addError("mitra-password", "Password min. 8 karakter");
    if (!konfirmasiPassword) addError("mitra-konfirmasi-password", "Konfirmasi password wajib diisi");
    else if (password !== konfirmasiPassword) addError("mitra-konfirmasi-password", "Password tidak cocok");

    const MAX_MB = 5;
    const MAX_SIZE = MAX_MB * 1024 * 1024;

    if (!fileKTP) addError("reg-ktp", "Dokumen KTP wajib diunggah");
    else if (fileKTP.size > MAX_SIZE) addError("reg-ktp", `Ukuran file maks ${MAX_MB}MB`);

    if (!fileNIB) addError("reg-nib", "Dokumen NIB/Usaha wajib diunggah");
    else if (fileNIB.size > MAX_SIZE) addError("reg-nib", `Ukuran file maks ${MAX_MB}MB`);

    if (fileProduk.length === 0) addError("reg-produk", "Foto produk wajib diunggah");
    else if (fileProduk.length < 3) addError("reg-produk", "Pilih minimal 3 foto");
    else {
      let isOverSize = false;
      for (let i = 0; i < fileProduk.length; i++) {
        if (fileProduk[i].size > MAX_SIZE) isOverSize = true;
      }
      if (isOverSize) addError("reg-produk", `Tiap foto maks ${MAX_MB}MB`);
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

    if (!agreed) {
      toast.error("Harap centang persetujuan persyaratan terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Akun berhasil dibuat! Tim admin akan meninjau dalam 1×24 jam.");
      router.push("/mitra/dashboard");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setDemoSession("seller");
      toast.success("Daftar dengan Google berhasil!");
      router.push("/mitra/dashboard");
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
      <header style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "0.875rem 2.5rem",
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "0.5rem",
            background: "linear-gradient(135deg, var(--clay), #c0673d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(180,90,50,0.3)",
          }}>
            <Storefront size={17} weight="fill" color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "var(--bark)" }}>
            Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span>
          </span>
          <span style={{
            fontSize: "0.72rem", fontWeight: 700, color: "var(--clay)",
            background: "rgba(184,92,60,0.1)", padding: "0.2rem 0.5rem",
            borderRadius: "0.375rem", letterSpacing: "0.04em",
          }}>
            MITRA
          </span>
        </Link>
        <a href="mailto:bantuan@dinoyocraft.id" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--clay)", textDecoration: "none" }}>
          Butuh bantuan?
        </a>
      </header>

      {/* Main Two-Column Layout */}
      <main
        className="reg-main-layout"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "2.5rem 3rem",
          position: "relative",
          zIndex: 10,
          gap: "5rem",
        }}
      >
        {/* LEFT: Hero (sticky) */}
        <div className="reg-hero" style={{
          flex: "1 1 0",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          position: "sticky",
          top: "2.5rem",
        }}>
          <div>
            <h1 style={{
              fontSize: "clamp(1.9rem, 3vw, 2.7rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              color: "var(--clay)",
              margin: "0 0 0.75rem",
            }}>
              Mulai Bisnis<br />Keramikmu Hari Ini!
            </h1>
            <p style={{ fontSize: "1rem", color: "var(--bark-muted)", lineHeight: 1.65, margin: 0, maxWidth: 380 }}>
              Bergabung dengan ratusan pengrajin keramik Dinoyo di{" "}
              <span style={{ color: "var(--clay)", fontWeight: 700 }}>DinoyoCraft</span>
              {" "}dan jangkau lebih banyak pembeli.
            </p>
          </div>

          {/* Photo Collage */}
          <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "1rem", aspectRatio: "4/3" }}>
              <div style={{ gridRow: "1 / span 2", borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)" }}>
                <Image src="/images/hero-5.jpg" alt="Dinoyo Ceramic" width={400} height={600} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div style={{ borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)" }}>
                <Image src="/images/hero-3.jpg" alt="Dinoyo Ceramic" width={300} height={300} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div style={{ borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)" }}>
                <Image src="/images/hero-6.jpg" alt="Dinoyo Ceramic" width={300} height={300} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {([
              {
                text: "Kelola produk & katalog toko",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                  </svg>
                ),
              },
              {
                text: "Terima & pantau pesanan real-time",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                ),
              },
              {
                text: "Laporan penjualan lengkap",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                ),
              },
              {
                text: "Chat langsung dengan pembeli",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
              },
              {
                text: "Jangkau pembeli seluruh Indonesia",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                ),
              },
            ] as { text: string; icon: React.ReactNode }[]).map((b) => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <span style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 30, height: 30, borderRadius: "0.5rem",
                  background: "rgba(184,92,60,0.1)",
                  color: "var(--clay)",
                  flexShrink: 0,
                }}>
                  {b.icon}
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--bark-muted)", fontWeight: 500 }}>{b.text}</span>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT: Register Card */}
        <div style={{ flexShrink: 0, width: "100%", maxWidth: 480 }}>
          <div style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255,255,255,0.9)",
            borderRadius: "1.5rem",
            padding: "2.25rem 2rem",
            boxShadow: "0 8px 48px rgba(120,70,30,0.14), 0 1px 2px rgba(0,0,0,0.04)",
          }}>
            {/* Brand logo inside card */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "1.5rem" }}>
              <div style={{
                width: 38, height: 38, borderRadius: "0.7rem",
                background: "linear-gradient(135deg, var(--clay), #c0673d)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 3px 10px rgba(180,90,50,0.28)",
                flexShrink: 0, overflow: "hidden",
              }}>
                <Storefront size={22} weight="fill" color="#fff" />
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
                  Mitra Portal
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bark)", margin: "0 0 0.25rem" }}>
                Daftar Mitra
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--bark-muted)", margin: 0 }}>
                Mulai bisnis keramik bersama DinoyoCraft.
              </p>
            </div>


            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {/* Data Pribadi */}
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bark)", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0.1rem 0 -0.2rem" }}>
                Data Pribadi
              </p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="reg-nama" style={labelStyle}>Nama Lengkap</label>
                  {errors["reg-nama"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-nama"]}</span>}
                </div>
                <input id="reg-nama" type="text" value={namaLengkap}
                  onChange={(e) => { setNamaLengkap(e.target.value); if (errors["reg-nama"]) setErrors(p => ({ ...p, "reg-nama": "" })); }}
                  placeholder="Sesuai KTP" style={{ ...inputStyle, borderColor: errors["reg-nama"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="reg-wa" style={labelStyle}>Nomor HP (WhatsApp)</label>
                  {errors["reg-wa"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-wa"]}</span>}
                </div>
                <input id="reg-wa" type="tel" value={noWa}
                  onChange={(e) => { setNoWa(e.target.value); if (errors["reg-wa"]) setErrors(p => ({ ...p, "reg-wa": "" })); }}
                  placeholder="08..." style={{ ...inputStyle, borderColor: errors["reg-wa"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="mitra-email" style={labelStyle}>Email</label>
                  {errors["mitra-email"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["mitra-email"]}</span>}
                </div>
                <input id="mitra-email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors["mitra-email"]) setErrors(p => ({ ...p, "mitra-email": "" })); }}
                  placeholder="nama@email.com" className="input-earthy"
                  style={errors["mitra-email"] ? { borderColor: "#e53e3e" } : {}}
                />
              </div>

              {/* Data Toko */}
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bark)", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0.25rem 0 -0.2rem" }}>
                Data Toko / Workshop
              </p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="reg-toko" style={labelStyle}>Nama Toko</label>
                  {errors["reg-toko"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-toko"]}</span>}
                </div>
                <input id="reg-toko" type="text" value={namaToko}
                  onChange={(e) => { setNamaToko(e.target.value); if (errors["reg-toko"]) setErrors(p => ({ ...p, "reg-toko": "" })); }}
                  placeholder="Contoh: Studio Keramik Bumi" style={{ ...inputStyle, borderColor: errors["reg-toko"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="reg-alamat" style={labelStyle}>Alamat Lengkap Workshop</label>
                  {errors["reg-alamat"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-alamat"]}</span>}
                </div>
                <textarea id="reg-alamat" value={alamatToko}
                  onChange={(e) => { setAlamatToko(e.target.value); if (errors["reg-alamat"]) setErrors(p => ({ ...p, "reg-alamat": "" })); }}
                  placeholder="Jalan, RT/RW, Kelurahan..."
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical", borderColor: errors["reg-alamat"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="reg-tahun" style={labelStyle}>Tahun Mulai Usaha</label>
                  {errors["reg-tahun"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-tahun"]}</span>}
                </div>
                <input id="reg-tahun" type="number" value={tahunUsaha}
                  onChange={(e) => { setTahunUsaha(e.target.value); if (errors["reg-tahun"]) setErrors(p => ({ ...p, "reg-tahun": "" })); }}
                  placeholder="Contoh: 2018" min={1990} max={new Date().getFullYear()}
                  style={{ ...inputStyle, borderColor: errors["reg-tahun"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                />
              </div>

              {/* Unggah Dokumen */}
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bark)", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0.25rem 0 -0.2rem" }}>
                Unggah Dokumen <span style={{ textTransform: "none", color: "var(--bark-muted)", fontWeight: 500 }}>(Maks 5MB per file)</span>
              </p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="reg-ktp" style={labelStyle}>KTP Pemilik Usaha</label>
                  {errors["reg-ktp"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-ktp"]}</span>}
                </div>
                <input id="reg-ktp" type="file" accept=".jpg,.jpeg,.png,.pdf" className="file-input"
                  onChange={(e) => { setFileKTP(e.target.files?.[0] || null); if (errors["reg-ktp"]) setErrors(p => ({ ...p, "reg-ktp": "" })); }}
                  style={{ ...inputStyle, padding: "0.45rem", borderColor: errors["reg-ktp"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="reg-nib" style={labelStyle}>Surat Keterangan Usaha / NIB</label>
                  {errors["reg-nib"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-nib"]}</span>}
                </div>
                <input id="reg-nib" type="file" accept=".jpg,.jpeg,.png,.pdf" className="file-input"
                  onChange={(e) => { setFileNIB(e.target.files?.[0] || null); if (errors["reg-nib"]) setErrors(p => ({ ...p, "reg-nib": "" })); }}
                  style={{ ...inputStyle, padding: "0.45rem", borderColor: errors["reg-nib"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="reg-produk" style={labelStyle}>Foto Produk (Pilih Min. 3 Foto)</label>
                  {errors["reg-produk"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["reg-produk"]}</span>}
                </div>
                <input id="reg-produk" type="file" multiple accept=".jpg,.jpeg,.png" className="file-input"
                  onChange={(e) => { setFileProduk(e.target.files ? Array.from(e.target.files) : []); if (errors["reg-produk"]) setErrors(p => ({ ...p, "reg-produk": "" })); }}
                  style={{ ...inputStyle, padding: "0.45rem", borderColor: errors["reg-produk"] ? "#e53e3e" : "rgba(0,0,0,0.13)" }}
                />
                {fileProduk.length > 0 && <div style={{ fontSize: "0.75rem", color: "var(--clay)", marginTop: "0.35rem", fontWeight: 600 }}>{fileProduk.length} foto terpilih</div>}
              </div>

              {/* Password */}
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bark)", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0.25rem 0 -0.2rem" }}>
                Keamanan Akun
              </p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="mitra-password" style={labelStyle}>Password<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span></label>
                  {errors["mitra-password"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["mitra-password"]}</span>}
                </div>
                <input id="mitra-password" type="password" value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors["mitra-password"]) setErrors(p => ({ ...p, "mitra-password": "" })); }}
                  placeholder="Minimal 8 karakter" className="input-earthy"
                  style={errors["mitra-password"] ? { borderColor: "#e53e3e" } : {}}
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <label htmlFor="mitra-konfirmasi-password" style={labelStyle}>Konfirmasi Password<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span></label>
                  {errors["mitra-konfirmasi-password"] && <span style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 600, marginBottom: "0.35rem" }}>{errors["mitra-konfirmasi-password"]}</span>}
                </div>
                <input id="mitra-konfirmasi-password" type="password" value={konfirmasiPassword}
                  onChange={(e) => { setKonfirmasiPassword(e.target.value); if (errors["mitra-konfirmasi-password"]) setErrors(p => ({ ...p, "mitra-konfirmasi-password": "" })); }}
                  placeholder="Masukkan ulang password" className="input-earthy"
                  style={errors["mitra-konfirmasi-password"] ? { borderColor: "#e53e3e" } : {}}
                />
              </div>

              {/* Persyaratan */}
              <div style={{
                background: "linear-gradient(135deg, rgba(184,92,60,0.06), rgba(120,160,80,0.04))",
                border: "1.5px solid rgba(184,92,60,0.18)",
                borderRadius: "0.875rem",
                padding: "0.9rem 1rem",
              }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--clay)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  Persyaratan Daftar Mitra
                </p>
                {SYARAT.map((req, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", marginBottom: i < SYARAT.length - 1 ? "0.4rem" : 0 }}>
                    <CheckCircle size={14} weight="fill" color="var(--clay)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: "0.76rem", color: "var(--bark-muted)", lineHeight: 1.45 }}>{req}</span>
                  </div>
                ))}
              </div>

              {/* Checkbox persetujuan */}
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
                  <Link href="/syarat-ketentuan" style={{ color: "var(--clay)", fontWeight: 700 }}>Syarat &amp; Ketentuan</Link>
                  {" "}serta persyaratan pendaftaran Mitra DinoyoCraft.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !agreed}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  padding: "0.85rem", borderRadius: "0.75rem",
                  background: loading ? "var(--clay-light, #d4956a)" : !agreed ? "#e5e7eb" : "linear-gradient(135deg, var(--clay) 0%, #c0673d 100%)",
                  color: !agreed ? "#9ca3af" : "#fff",
                  fontWeight: 700, fontSize: "0.95rem", border: "none",
                  cursor: (loading || !agreed) ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s, transform 0.15s",
                  letterSpacing: "-0.01em", fontFamily: pjs.style.fontFamily,
                  boxShadow: agreed ? "0 4px 16px rgba(184,92,60,0.35)" : "none",
                }}
                onMouseEnter={(e) => { if (!loading && agreed) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                {loading ? (
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "9999px", animation: "spin 0.75s linear infinite" }} />
                ) : (
                  <>Buat Akun <ArrowRight size={16} weight="bold" /></>
                )}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--line-strong)" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--bark-muted)", fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.05em" }}>ATAU</span>
              <div style={{ flex: 1, height: 1, background: "var(--line-strong)" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
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
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
              </svg>
              Daftar dengan Google
            </button>

            <p style={{ marginTop: "1rem", fontSize: "0.7rem", color: "var(--bark-muted)", textAlign: "center", lineHeight: 1.6 }}>
              Dengan mendaftar, kamu menyetujui{" "}
              <Link href="/syarat-ketentuan" style={{ color: "var(--clay)", fontWeight: 600 }}>Syarat &amp; Ketentuan</Link>
              {" "}serta{" "}
              <Link href="/kebijakan-privasi" style={{ color: "var(--clay)", fontWeight: 600 }}>Kebijakan Privasi</Link>
              {" "}DinoyoCraft.
            </p>
          </div>

          {/* Login link below card */}
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
            <span style={{ fontSize: "0.82rem", color: "var(--bark-muted)" }}>Sudah punya akun?</span>
            <Link href="/auth/login" style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--clay)", textDecoration: "none" }}>
              Masuk Sekarang →
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
        @media (max-width: 860px) {
          .reg-hero { display: none !important; }
          .reg-main-layout { padding: 1.5rem 1rem !important; gap: 0 !important; align-items: flex-start !important; }
          .reg-main-layout > div:last-child { max-width: 100% !important; }
        }
        
        .file-input {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .file-input:hover {
          background: #fdfdfd !important;
          border-color: var(--clay) !important;
          box-shadow: 0 2px 8px rgba(184,92,60,0.08);
        }
        .file-input::file-selector-button {
          margin-right: 0.8rem;
          padding: 0.4rem 0.8rem;
          border-radius: 0.4rem;
          border: 1px solid rgba(0,0,0,0.1);
          background: #fff;
          color: var(--bark);
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .file-input:hover::file-selector-button {
          background: var(--clay);
          color: #fff;
          border-color: var(--clay);
        }
      `}</style>
    </div>
  );
}
