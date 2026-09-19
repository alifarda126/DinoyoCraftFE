"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";

export default function SellerRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setStep(3); // Success step
    } catch (e) {
      toast.error("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (step === 3) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--surface)", fontFamily: "var(--font-outfit), sans-serif", padding: "2rem"
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
            Terima kasih telah mendaftar sebagai Mitra Pengrajin. Tim Admin akan meninjau data Anda dalam 1x24 jam.
          </p>
          <Link href="/auth" style={{
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
    <div style={{ minHeight: "100dvh", background: "var(--surface)", fontFamily: "var(--font-outfit), sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "1rem 2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/auth" style={{ color: "var(--bark-muted)" }}>
            <ArrowLeft size={20} />
          </Link>
          <span style={{ fontWeight: 700, color: "var(--bark)" }}>Pendaftaran Mitra Pengrajin</span>
        </div>
      </header>

      <main style={{ padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", padding: "2rem", borderRadius: "1rem", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: "var(--line)", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1, background: step >= 1 ? "var(--clay)" : "var(--line)", color: "#fff", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>1</div>
            <div style={{ position: "relative", zIndex: 1, background: step >= 2 ? "var(--clay)" : "var(--line-strong)", color: "#fff", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>2</div>
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
                <button type="submit" style={{ marginTop: "1rem", background: "var(--bark)", color: "#fff", padding: "0.8rem", borderRadius: "0.75rem", fontWeight: 700, width: "100%", border: "none", cursor: "pointer" }}>
                  Selanjutnya
                </button>
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
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button type="button" onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", color: "var(--bark)", border: "1px solid var(--line-strong)", padding: "0.8rem", borderRadius: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                    Kembali
                  </button>
                  <button type="submit" disabled={loading} style={{ flex: 2, background: "var(--bark)", color: "#fff", border: "none", padding: "0.8rem", borderRadius: "0.75rem", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Memproses..." : "Kirim Pengajuan"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
