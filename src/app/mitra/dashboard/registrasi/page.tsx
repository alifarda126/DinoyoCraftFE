"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Warning, IdentificationCard, Storefront, FileText, CheckSquare } from "@phosphor-icons/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

const SYARAT = [
  { icon: IdentificationCard, text: "Memiliki KTP / identitas diri yang valid" },
  { icon: Storefront, text: "Memiliki usaha atau rencana usaha yang jelas di bidang kerajinan" },
  { icon: FileText, text: "Bersedia mengikuti SOP packing dan pengiriman DinoyoCraft" },
  { icon: CheckCircle, text: "Menyetujui syarat & ketentuan program mitra" },
];

export default function SellerRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = persyaratan, 1 = data pribadi, 2 = data toko, 3 = sukses
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setStep(3);
    } catch {
      toast.error("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  // ── Sukses ──
  if (step === 3) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--surface)", fontFamily: pjs.style.fontFamily, padding: "2rem"
      }}>
        <div style={{
          background: "#fff", padding: "3rem 2rem", borderRadius: "1.5rem",
          maxWidth: "400px", width: "100%", textAlign: "center", border: "1px solid var(--line)"
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
            background: "var(--bark)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem"
          }}>
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface)", fontFamily: pjs.style.fontFamily }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "1rem 2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/mitra/login" style={{ color: "var(--bark-muted)" }}>
            <ArrowLeft size={20} />
          </Link>
          <span style={{ fontWeight: 700, color: "var(--bark)" }}>Pendaftaran Mitra DinoyoCraft</span>
        </div>
      </header>

      <main style={{ padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>

          {/* ── STEP 0: Persyaratan ── */}
          {step === 0 && (
            <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1px solid var(--line)", overflow: "hidden" }}>
              {/* Banner */}
              <div style={{
                background: "linear-gradient(135deg, var(--clay), #a05a3b)",
                padding: "2rem",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "1rem",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem"
                }}>
                  <FileText size={28} color="#fff" weight="fill" />
                </div>
                <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                  Persyaratan Pendaftaran
                </h1>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", marginTop: "0.5rem", lineHeight: 1.6 }}>
                  Baca dan pahami persyaratan berikut sebelum melanjutkan pendaftaran Mitra DinoyoCraft.
                </p>
              </div>

              <div style={{ padding: "2rem" }}>
                {/* Daftar syarat */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                  {SYARAT.map((s, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "0.9rem",
                      background: "var(--surface)", borderRadius: "0.75rem",
                      padding: "1rem", border: "1px solid var(--line)",
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "0.6rem",
                        background: "rgba(184,92,60,0.12)", color: "var(--clay)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <s.icon size={18} weight="duotone" />
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "var(--bark)", margin: 0, lineHeight: 1.5 }}>
                        {s.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Catatan penting */}
                <div style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "0.75rem", padding: "1rem",
                  marginBottom: "1.75rem",
                }}>
                  <Warning size={20} color="#b45309" weight="duotone" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                  <p style={{ fontSize: "0.82rem", color: "#92400e", lineHeight: 1.65, margin: 0 }}>
                    <strong>Penting:</strong> Pengajuan yang tidak memenuhi persyaratan di atas akan ditolak oleh tim admin.
                    Data yang telah diisi tidak dapat diubah setelah pengajuan dikirim.
                  </p>
                </div>

                {/* Checkbox persetujuan */}
                <label style={{
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  cursor: "pointer", marginBottom: "1.5rem",
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
                  <span style={{ fontSize: "0.85rem", color: "var(--bark)", lineHeight: 1.6 }}>
                    Saya telah membaca dan menyetujui seluruh persyaratan pendaftaran Mitra DinoyoCraft serta{" "}
                    <Link href="#" style={{ color: "var(--clay)", fontWeight: 700 }}>Syarat & Ketentuan</Link>{" "}
                    yang berlaku.
                  </span>
                </label>

                <button
                  onClick={() => {
                    if (!agreed) {
                      toast.error("Harap centang persetujuan persyaratan terlebih dahulu.");
                      return;
                    }
                    setStep(1);
                  }}
                  style={{
                    width: "100%", padding: "0.9rem", borderRadius: "0.875rem",
                    background: agreed ? "var(--bark)" : "var(--line-strong)",
                    color: agreed ? "#fff" : "var(--bark-muted)",
                    fontWeight: 700, border: "none",
                    cursor: agreed ? "pointer" : "not-allowed",
                    fontSize: "0.95rem", transition: "all 0.2s",
                    fontFamily: pjs.style.fontFamily,
                  }}
                >
                  Lanjutkan Pendaftaran →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 1 & 2: Form ── */}
          {(step === 1 || step === 2) && (
            <div style={{ background: "#fff", padding: "2rem", borderRadius: "1rem", border: "1px solid var(--line)" }}>
              {/* Progress */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: "var(--line)", zIndex: 0 }} />
                {[1, 2].map(s => (
                  <div key={s} style={{
                    position: "relative", zIndex: 1,
                    background: step >= s ? "var(--clay)" : "var(--line-strong)",
                    color: "#fff", width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                  }}>
                    {s}
                  </div>
                ))}
              </div>

              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.5rem" }}>Data Pribadi / Pemilik</h2>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nama Lengkap</label>
                      <input type="text" required className="w-full p-3 rounded-xl border border-zinc-200" placeholder="Sesuai KTP" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nomor HP (WhatsApp)</label>
                      <input type="tel" required className="w-full p-3 rounded-xl border border-zinc-200" placeholder="08..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Alamat Email</label>
                      <input type="email" required className="w-full p-3 rounded-xl border border-zinc-200" placeholder="nama@email.com" />
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                      <button type="button" onClick={() => setStep(0)} style={{ flex: 1, background: "transparent", color: "var(--bark)", border: "1px solid var(--line-strong)", padding: "0.8rem", borderRadius: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: pjs.style.fontFamily }}>
                        Kembali
                      </button>
                      <button type="submit" style={{ flex: 2, background: "var(--bark)", color: "#fff", padding: "0.8rem", borderRadius: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: pjs.style.fontFamily }}>
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.5rem" }}>Data Toko / Workshop</h2>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nama Toko</label>
                      <input type="text" required className="w-full p-3 rounded-xl border border-zinc-200" placeholder="Contoh: Studio Keramik Bumi" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Alamat Lengkap Workshop</label>
                      <textarea required className="w-full p-3 rounded-xl border border-zinc-200 min-h-[100px]" placeholder="Jalan, RT/RW, Kelurahan..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tahun Mulai Usaha</label>
                      <input type="number" required className="w-full p-3 rounded-xl border border-zinc-200" placeholder="2020" />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                      <button type="button" onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", color: "var(--bark)", border: "1px solid var(--line-strong)", padding: "0.8rem", borderRadius: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: pjs.style.fontFamily }}>
                        Kembali
                      </button>
                      <button type="submit" disabled={loading} style={{ flex: 2, background: "var(--bark)", color: "#fff", border: "none", padding: "0.8rem", borderRadius: "0.75rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: pjs.style.fontFamily }}>
                        {loading ? "Memproses..." : "Kirim Pengajuan"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
