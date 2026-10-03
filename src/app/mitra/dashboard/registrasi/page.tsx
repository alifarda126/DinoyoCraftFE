"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Warning,
  IdentificationCard, Storefront, FileText, CheckSquare,
} from "@phosphor-icons/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

const SYARAT = [
  { icon: IdentificationCard, text: "Memiliki KTP / identitas diri yang valid" },
  { icon: Storefront,         text: "Memiliki usaha atau rencana usaha kerajinan yang jelas" },
  { icon: FileText,           text: "Bersedia mengikuti SOP packing & pengiriman DinoyoCraft" },
  { icon: CheckCircle,        text: "Menyetujui syarat & ketentuan program mitra" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.75rem",
  border: "1.5px solid var(--line-strong)",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  background: "#fafaf9",
  outline: "none",
  boxSizing: "border-box",
  color: "var(--bark)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--bark)",
  marginBottom: "0.4rem",
};

export default function SellerRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      toast.error("Harap centang persetujuan persyaratan terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setDone(true);
    } catch {
      toast.error("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Sukses ── */
  if (done) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--surface)", fontFamily: pjs.style.fontFamily, padding: "2rem",
      }}>
        <div style={{
          background: "#fff", padding: "3rem 2rem", borderRadius: "1.5rem",
          maxWidth: "400px", width: "100%", textAlign: "center", border: "1px solid var(--line)",
        }}>
          <CheckCircle size={64} color="var(--moss)" weight="fill" style={{ margin: "0 auto 1.5rem" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.5rem" }}>
            Pendaftaran Berhasil
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
            Terima kasih telah mendaftar sebagai Mitra DinoyoCraft. Tim Admin akan meninjau data Anda dalam 1×24 jam.
          </p>
          <Link href="/mitra/login" style={{
            display: "inline-block", padding: "0.8rem 2rem", borderRadius: "9999px",
            background: "var(--bark)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
          }}>
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--surface)", fontFamily: pjs.style.fontFamily }}>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "1rem 2rem" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/mitra/login" style={{ color: "var(--bark-muted)", display: "flex" }}>
            <ArrowLeft size={20} />
          </Link>
          <span style={{ fontWeight: 700, color: "var(--bark)" }}>Pendaftaran Mitra DinoyoCraft</span>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: "auto", overscrollBehaviorY: "contain", padding: "2.5rem 1.25rem" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff",
              borderRadius: "1.25rem",
              border: "1px solid var(--line)",
              overflow: "hidden",
            }}>

              {/* ── Banner ── */}
              <div style={{
                background: "linear-gradient(135deg, var(--clay), #a05a3b)",
                padding: "1.75rem 2rem",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "0.875rem",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.875rem",
                }}>
                  <FileText size={26} color="#fff" weight="fill" />
                </div>
                <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                  Form Pendaftaran Mitra
                </h1>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", marginTop: "0.4rem", lineHeight: 1.6 }}>
                  Isi seluruh data di bawah lalu klik <strong>Kirim Pengajuan</strong>. Admin akan meninjau dalam 1×24 jam.
                </p>
              </div>

              <div style={{ padding: "2rem" }}>

                {/* ══ BAGIAN 1: Persyaratan ══ */}
                <section style={{ marginBottom: "2rem" }}>
                  <h2 style={{
                    fontSize: "0.75rem", fontWeight: 700, color: "var(--clay)",
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    borderBottom: "1.5px solid rgba(184,92,60,0.2)",
                    paddingBottom: "0.6rem", marginBottom: "1rem",
                  }}>
                    Persyaratan Pendaftaran
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
                    {SYARAT.map((s, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        background: "rgba(184,92,60,0.05)", borderRadius: "0.65rem",
                        padding: "0.7rem 0.9rem", border: "1px solid rgba(184,92,60,0.12)",
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "0.5rem",
                          background: "rgba(184,92,60,0.12)", color: "var(--clay)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <s.icon size={16} weight="duotone" />
                        </div>
                        <p style={{ fontSize: "0.83rem", color: "var(--bark)", margin: 0, lineHeight: 1.45 }}>
                          {s.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Warning box */}
                  <div style={{
                    display: "flex", gap: "0.65rem", alignItems: "flex-start",
                    background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: "0.75rem", padding: "0.875rem 1rem",
                  }}>
                    <Warning size={18} color="#b45309" weight="duotone" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                    <p style={{ fontSize: "0.79rem", color: "#92400e", lineHeight: 1.6, margin: 0 }}>
                      <strong>Penting:</strong> Pengajuan yang tidak memenuhi persyaratan di atas akan ditolak.
                      Data tidak dapat diubah setelah pengajuan dikirim.
                    </p>
                  </div>
                </section>

                {/* ══ BAGIAN 2: Data Pribadi ══ */}
                <section style={{ marginBottom: "2rem" }}>
                  <h2 style={{
                    fontSize: "0.75rem", fontWeight: 700, color: "var(--clay)",
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    borderBottom: "1.5px solid rgba(184,92,60,0.2)",
                    paddingBottom: "0.6rem", marginBottom: "1.25rem",
                  }}>
                    Data Pribadi / Pemilik
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Nama Lengkap</label>
                      <input type="text" required style={inputStyle} placeholder="Sesuai KTP" />
                    </div>
                    <div>
                      <label style={labelStyle}>Nomor HP (WhatsApp)</label>
                      <input type="tel" required style={inputStyle} placeholder="08..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Alamat Email</label>
                      <input type="email" required style={inputStyle} placeholder="nama@email.com" />
                    </div>
                    <div>
                      <label style={labelStyle}>Password</label>
                      <input type="password" required minLength={8} style={inputStyle} placeholder="Minimal 8 karakter" />
                    </div>
                  </div>
                </section>

                {/* ══ BAGIAN 3: Data Toko ══ */}
                <section style={{ marginBottom: "2rem" }}>
                  <h2 style={{
                    fontSize: "0.75rem", fontWeight: 700, color: "var(--clay)",
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    borderBottom: "1.5px solid rgba(184,92,60,0.2)",
                    paddingBottom: "0.6rem", marginBottom: "1.25rem",
                  }}>
                    Data Toko / Workshop
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Nama Toko</label>
                      <input type="text" required style={inputStyle} placeholder="Contoh: Studio Keramik Bumi" />
                    </div>
                    <div>
                      <label style={labelStyle}>Alamat Lengkap Workshop</label>
                      <textarea required style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Tahun Mulai Usaha</label>
                      <input type="number" required style={inputStyle} placeholder="Contoh: 2018"
                        min={1990} max={new Date().getFullYear()} />
                    </div>
                  </div>
                </section>

                {/* ══ Checkbox Persetujuan ══ */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "flex", alignItems: "flex-start", gap: "0.75rem",
                    cursor: "pointer",
                  }}>
                    <div
                      onClick={() => setAgreed(!agreed)}
                      style={{
                        width: 22, height: 22, borderRadius: "0.4rem",
                        border: `2px solid ${agreed ? "var(--clay)" : "var(--line-strong)"}`,
                        background: agreed ? "var(--clay)" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, cursor: "pointer", transition: "all 0.15s", marginTop: "0.1rem",
                      }}
                    >
                      {agreed && <CheckSquare size={14} color="#fff" weight="fill" />}
                    </div>
                    <span style={{ fontSize: "0.83rem", color: "var(--bark)", lineHeight: 1.65 }}>
                      Saya telah membaca dan menyetujui seluruh persyaratan pendaftaran serta{" "}
                      <Link href="#" style={{ color: "var(--clay)", fontWeight: 700 }}>Syarat & Ketentuan</Link>
                      {" "}yang berlaku.
                    </span>
                  </label>
                </div>

                {/* ══ Tombol Submit ══ */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.95rem",
                    borderRadius: "0.875rem",
                    background: loading
                      ? "var(--line-strong)"
                      : "linear-gradient(135deg, var(--bark), #2d2a26)",
                    color: loading ? "var(--bark-muted)" : "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s",
                    fontFamily: pjs.style.fontFamily,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        display: "inline-block", width: 16, height: 16,
                        border: "2px solid rgba(0,0,0,0.15)", borderTopColor: "var(--bark-muted)",
                        borderRadius: "9999px", animation: "spin 0.75s linear infinite",
                      }} />
                      Memproses...
                    </>
                  ) : (
                    "Kirim Pengajuan"
                  )}
                </button>

              </div>{/* end padding */}
            </div>{/* end card */}
          </form>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
