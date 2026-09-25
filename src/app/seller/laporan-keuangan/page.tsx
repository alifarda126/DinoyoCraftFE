"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { CurrencyCircleDollar, Wallet, ArrowUpRight, DownloadSimple, ClockCounterClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function LaporanKeuanganPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/mitra/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleDownload = () => {
    setIsDownloading(true);
    toast.info("Menyiapkan file CSV...");
    setTimeout(() => {
      setIsDownloading(false);
      toast.success("Laporan keuangan berhasil diunduh.");
    }, 1500);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount) return;
    toast.success(`Permintaan penarikan dana sebesar Rp ${parseInt(withdrawAmount).toLocaleString('id-ID')} sedang diproses.`);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount("");
  };

  if (loading) return <div>Memuat data laporan...</div>;

  const stats = [
    { label: "Saldo Aktif", value: "Rp 3.250.000", icon: Wallet, color: "var(--moss)", desc: "Siap ditarik" },
    { label: "Pendapatan Tertunda", value: "Rp 1.250.000", icon: ClockCounterClockwise, color: "var(--sand)", desc: "Menunggu pesanan selesai" },
    { label: "Total Ditarik", value: "Rp 15.400.000", icon: ArrowUpRight, color: "#2b6cb0", desc: "Sejak bergabung" },
  ];

  const transactions = [
    { id: "TRX-001", date: "15 Okt 2023", desc: "Penjualan - INV/2023/10/XX1", amount: "+ Rp 450.000", type: "in", status: "Selesai" },
    { id: "TRX-002", date: "14 Okt 2023", desc: "Penarikan Dana ke BCA", amount: "- Rp 2.000.000", type: "out", status: "Selesai" },
    { id: "TRX-003", date: "12 Okt 2023", desc: "Penjualan - INV/2023/10/XX2", amount: "+ Rp 800.000", type: "in", status: "Selesai" },
    { id: "TRX-004", date: "10 Okt 2023", desc: "Penjualan - INV/2023/10/XX3", amount: "+ Rp 1.250.000", type: "in", status: "Tertunda" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Laporan Keuangan
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
            Kelola saldo, pendapatan, dan riwayat penarikan dana tokomu.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: isDownloading ? "var(--surface)" : "#fff", color: "var(--bark)", border: "1px solid var(--line)",
              padding: "0.6rem 1rem", borderRadius: "0.5rem",
              fontWeight: 600, fontSize: "0.85rem", cursor: isDownloading ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => !isDownloading && (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={(e) => !isDownloading && (e.currentTarget.style.background = "#fff")}
          >
            {isDownloading ? <ClockCounterClockwise size={18} className="animate-spin" /> : <DownloadSimple size={18} />}
            {isDownloading ? "Mengunduh..." : "Unduh CSV"}
          </button>
          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "var(--clay)", color: "#fff", border: "none",
              padding: "0.6rem 1.25rem", borderRadius: "0.5rem",
              fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              boxShadow: "0 4px 10px rgba(184, 92, 60, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--clay-dark)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--clay)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <CurrencyCircleDollar size={18} />
            Tarik Dana
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: "#fff", padding: "1.5rem", borderRadius: "1rem",
            border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "1.25rem",
            position: "relative", overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}>
            <div style={{
              position: "absolute", top: -20, right: -20, width: 100, height: 100, 
              background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`,
              borderRadius: "50%", pointerEvents: "none"
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "0.75rem",
                background: `${stat.color}15`, color: stat.color,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <stat.icon size={26} weight="duotone" />
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)", marginBottom: "0.2rem" }}>{stat.label}</p>
                <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--bark)", letterSpacing: "-0.02em" }}>{stat.value}</p>
              </div>
            </div>
            <div style={{ paddingTop: "1rem", borderTop: "1px dashed var(--line-light)", fontSize: "0.8rem", color: "var(--bark-muted)", fontWeight: 500 }}>
              {stat.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Financial Chart Placeholder */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", padding: "1.5rem", marginBottom: "2.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", marginBottom: "1.5rem" }}>Grafik Pendapatan 7 Hari Terakhir</h2>
        <div style={{ 
          height: "200px", background: "linear-gradient(to top, rgba(184,92,60,0.03), transparent)", 
          borderRadius: "0.5rem", border: "1px dashed var(--line-light)",
          display: "flex", alignItems: "flex-end", padding: "1rem", gap: "1rem"
        }}>
          {/* Simple CSS Bar Chart Mockup */}
          {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "0.75rem", height: "100%" }}>
              <div style={{ 
                width: "100%", maxWidth: "40px", height: `${h}%`, background: h === 90 ? "var(--clay)" : "var(--clay-light)", 
                borderRadius: "6px 6px 0 0", transition: "height 1s ease-out" 
              }} />
              <span style={{ fontSize: "0.75rem", color: "var(--bark-muted)", fontWeight: 600 }}>H-{6-i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)" }}>Riwayat Transaksi</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--line-light)" }}>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)" }}>ID Transaksi</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)" }}>Tanggal</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)" }}>Deskripsi</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)" }}>Status</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)", textAlign: "right" }}>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trx, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line-light)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: "var(--bark)", fontWeight: 600 }}>{trx.id}</td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: "var(--bark-muted)" }}>{trx.date}</td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: "var(--bark)" }}>{trx.desc}</td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ 
                      padding: "0.35rem 0.85rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700,
                      background: trx.status === "Selesai" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      color: trx.status === "Selesai" ? "#047857" : "#b45309",
                    }}>
                      {trx.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", fontWeight: 800, textAlign: "right", color: trx.type === "in" ? "#059669" : "var(--bark)" }}>
                    {trx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal Penarikan Dana */}
      {isWithdrawModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: "1.5rem", padding: "2rem", maxWidth: "450px", width: "100%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--bark)", marginBottom: "1.5rem" }}>Tarik Dana</h2>
            
            <div style={{ background: "var(--surface)", padding: "1rem", borderRadius: "1rem", marginBottom: "1.5rem", border: "1px solid var(--line)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)", marginBottom: "0.25rem" }}>Saldo Aktif Tersedia</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--moss)" }}>Rp 3.250.000</p>
            </div>

            <form onSubmit={handleWithdraw}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Nominal Penarikan (Rp)</label>
                <input 
                  type="number" 
                  required
                  min="50000"
                  max="3250000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Contoh: 1000000"
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--line)", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", marginTop: "0.5rem" }}>Minimal penarikan Rp 50.000</p>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button 
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", background: "#fff", color: "var(--bark)", fontWeight: 700, border: "1px solid var(--line-strong)", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", background: "var(--clay)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  Proses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
