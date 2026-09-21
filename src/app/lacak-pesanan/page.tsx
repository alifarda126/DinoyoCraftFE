"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MagnifyingGlass, Package, Truck, CheckCircle, ArrowRight } from "@phosphor-icons/react";

type TrackingStatus = {
  status: string;
  date: string;
  location: string;
};

export default function LacakPesananPage() {
  const [resi, setResi] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingStatus[] | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resi.trim()) return;

    setLoading(true);
    setTrackingData(null);

    // Mock API call for tracking guest order
    setTimeout(() => {
      setTrackingData([
        { status: "Pesanan Diterima", date: "20 Okt 2023, 09:00", location: "Sistem DinoyoCraft" },
        { status: "Pesanan Dikemas", date: "20 Okt 2023, 14:30", location: "Toko Dinoyo, Malang" },
        { status: "Diserahkan ke Kurir", date: "21 Okt 2023, 10:15", location: "JNE Malang Pusat" },
        { status: "Dalam Perjalanan", date: "22 Okt 2023, 08:45", location: "JNE Surabaya" },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ background: "var(--surface)", color: "var(--bark)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif" }}>
      <Navbar />

      <main className="max-w-[800px] mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bark)", marginBottom: "1rem" }}>
            Lacak Pesanan (Guest)
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
            Lacak status pengiriman pesanan Anda menggunakan nomor resi atau kode referensi pesanan (Booking Code).
          </p>
        </div>

        <div style={{ background: "#fff", padding: "2rem", borderRadius: "1.5rem", border: "1.5px solid var(--line)", marginBottom: "2rem" }}>
          <form onSubmit={handleTrack} style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Package size={20} color="var(--bark-muted)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Masukkan Nomor Resi / Booking Code"
                value={resi}
                onChange={(e) => setResi(e.target.value)}
                required
                style={{
                  width: "100%", padding: "1rem 1rem 1rem 3rem", borderRadius: "1rem", border: "1.5px solid var(--line)",
                  fontSize: "1rem", outline: "none", transition: "border-color 0.2s"
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0 2rem", borderRadius: "1rem", background: "var(--bark)", color: "#fff",
                fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", border: "none", cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              <MagnifyingGlass size={20} />
              {loading ? "Mencari..." : "Lacak"}
            </button>
          </form>
        </div>

        {trackingData && (
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "1.5rem", border: "1.5px solid var(--line)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Truck size={24} color="var(--clay)" />
              Status Pengiriman: <span style={{ color: "var(--clay)" }}>{resi}</span>
            </h2>

            <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
              {/* Vertical Line */}
              <div style={{ position: "absolute", left: "7px", top: "10px", bottom: "20px", width: "2px", background: "var(--line)" }}></div>

              {trackingData.map((track, index) => (
                <div key={index} style={{ position: "relative", marginBottom: "2rem" }}>
                  {/* Timeline Dot */}
                  <div style={{ 
                    position: "absolute", left: "-27.5px", top: "2px", width: "16px", height: "16px", 
                    borderRadius: "50%", background: index === trackingData.length - 1 ? "var(--clay)" : "var(--line-strong)",
                    border: "3px solid #fff"
                  }}></div>
                  
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.25rem", color: index === trackingData.length - 1 ? "var(--clay)" : "var(--bark)" }}>
                    {track.status}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--bark-muted)", marginBottom: "0.25rem" }}>{track.date}</p>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>{track.location}</p>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1.5px solid var(--line)", textAlign: "center" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--bark-muted)", marginBottom: "1rem" }}>
                Butuh bantuan dengan pesanan Anda?
              </p>
              <Link href="/customer/bantuan" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--bark)", fontWeight: 700, textDecoration: "none" }}>
                Hubungi Customer Service <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
