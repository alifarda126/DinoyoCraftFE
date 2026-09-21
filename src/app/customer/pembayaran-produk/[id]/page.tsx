"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { CreditCard, CheckCircle, Clock } from "@phosphor-icons/react";

export default function PembayaranProdukPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"pending" | "success">("pending");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMidtransPayment = async () => {
    setLoading(true);
    
    // MOCK: In a real app, this would call your Express backend to get a Midtrans Snap Token,
    // then trigger window.snap.pay(token)
    
    toast.info("Memanggil Midtrans Snap Popup...");
    
    setTimeout(() => {
      // Simulate Midtrans successful callback after 2 seconds
      setStatus("success");
      setLoading(false);
      toast.success("Pembayaran berhasil dikonfirmasi oleh Midtrans!");
    }, 2000);
  };

  if (!mounted) return null;

  return (
    <div style={{ background: "var(--surface)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif", color: "var(--bark)", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "1rem 2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Pembayaran Pesanan</h1>
          <span style={{ fontSize: "0.9rem", color: "var(--bark-muted)", fontWeight: 600 }}>{orderId}</span>
        </div>
      </header>

      <main style={{ flex: 1, padding: "3rem 2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.5rem", padding: "2.5rem", maxWidth: "480px", width: "100%", textAlign: "center" }}>
          
          {status === "pending" ? (
            <>
              <div style={{ width: "80px", height: "80px", background: "var(--surface-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <Clock size={40} color="var(--clay)" weight="duotone" />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Menunggu Pembayaran</h2>
              <p style={{ color: "var(--bark-muted)", marginBottom: "2rem", fontSize: "0.95rem", lineHeight: 1.5 }}>
                Silakan selesaikan pembayaran Anda melalui gateway Midtrans. Jangan tutup halaman ini sebelum pembayaran selesai.
              </p>
              
              <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "1rem", marginBottom: "2rem", textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--bark-muted)", fontSize: "0.9rem" }}>Total Tagihan</span>
                  <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Rp 415.000</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--bark-muted)", fontSize: "0.9rem" }}>Order ID</span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{orderId}</span>
                </div>
              </div>

              <button
                onClick={handleMidtransPayment}
                disabled={loading}
                style={{
                  width: "100%", padding: "1rem", borderRadius: "0.75rem",
                  background: loading ? "var(--line-strong)" : "var(--bark)", 
                  color: "#fff", fontWeight: 700, fontSize: "1rem", border: "none", 
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem"
                }}
              >
                <CreditCard size={20} />
                {loading ? "Memproses..." : "Bayar dengan Midtrans"}
              </button>
            </>
          ) : (
            <>
              <div style={{ width: "80px", height: "80px", background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <CheckCircle size={48} color="#2E7D32" weight="fill" />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem", color: "#2E7D32" }}>Pembayaran Berhasil!</h2>
              <p style={{ color: "var(--bark-muted)", marginBottom: "2rem", fontSize: "0.95rem", lineHeight: 1.5 }}>
                Terima kasih, pembayaran Anda telah kami terima. Pesanan Anda akan segera diproses oleh penjual.
              </p>
              
              <Link
                href="/customer/pesanan"
                style={{
                  display: "inline-block", width: "100%", padding: "1rem", borderRadius: "0.75rem",
                  background: "var(--bark)", color: "#fff", fontWeight: 700, fontSize: "1rem", textDecoration: "none"
                }}
              >
                Lihat Daftar Pesanan
              </Link>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
