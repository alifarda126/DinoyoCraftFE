"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { CurrencyCircleDollar, Wallet, ArrowUpRight, DownloadSimple, ClockCounterClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";
import { EarthySelect } from "@/components/ui/EarthySelect";

export default function LaporanKeuanganPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [filterTrxType, setFilterTrxType] = useState("semua");
  const [filterTrxStatus, setFilterTrxStatus] = useState("semua");
  const [chartPeriod, setChartPeriod] = useState<"7hari" | "30hari">("7hari");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/auth/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleDownload = () => {
    setIsDownloading(true);
    toast.info("Menyiapkan file PDF...");
    setTimeout(() => {
      setIsDownloading(false);
      toast.success("Laporan keuangan berhasil diunduh dalam format PDF.");
    }, 1500);
  };

  const handleDownloadCsv = () => {
    setIsDownloadingCsv(true);
    toast.info("Menyiapkan file CSV...");
    setTimeout(() => {
      setIsDownloadingCsv(false);
      toast.success("Laporan keuangan berhasil diunduh dalam format CSV.");
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

  const filteredTrx = transactions.filter(t => {
    const matchType = filterTrxType === "semua" || t.type === filterTrxType;
    const matchStatus = filterTrxStatus === "semua" || t.status === filterTrxStatus;
    return matchType && matchStatus;
  });

  const data7 = [
    { label: "Sen", value: 30, amount: "Rp 300.000" },
    { label: "Sel", value: 50, amount: "Rp 500.000" },
    { label: "Rab", value: 40, amount: "Rp 400.000" },
    { label: "Kam", value: 70, amount: "Rp 700.000" },
    { label: "Jum", value: 60, amount: "Rp 600.000" },
    { label: "Sab", value: 90, amount: "Rp 900.000" },
    { label: "Min", value: 80, amount: "Rp 800.000" },
  ];
  
  const data30 = [
    {label: '1 Okt', value: 35, amount: 'Rp 350.000'}, {label: '2 Okt', value: 40, amount: 'Rp 400.000'},
    {label: '3 Okt', value: 30, amount: 'Rp 300.000'}, {label: '4 Okt', value: 55, amount: 'Rp 550.000'},
    {label: '5 Okt', value: 60, amount: 'Rp 600.000'}, {label: '6 Okt', value: 45, amount: 'Rp 450.000'},
    {label: '7 Okt', value: 50, amount: 'Rp 500.000'}, {label: '8 Okt', value: 75, amount: 'Rp 750.000'},
    {label: '9 Okt', value: 80, amount: 'Rp 800.000'}, {label: '10 Okt', value: 65, amount: 'Rp 650.000'},
    {label: '11 Okt', value: 70, amount: 'Rp 700.000'}, {label: '12 Okt', value: 95, amount: 'Rp 950.000'},
    {label: '13 Okt', value: 90, amount: 'Rp 900.000'}, {label: '14 Okt', value: 85, amount: 'Rp 850.000'},
    {label: '15 Okt', value: 100, amount: 'Rp 1.000.000'}, {label: '16 Okt', value: 40, amount: 'Rp 400.000'}, 
    {label: '17 Okt', value: 50, amount: 'Rp 500.000'}, {label: '18 Okt', value: 65, amount: 'Rp 650.000'}, 
    {label: '19 Okt', value: 45, amount: 'Rp 450.000'}, {label: '20 Okt', value: 55, amount: 'Rp 550.000'}, 
    {label: '21 Okt', value: 80, amount: 'Rp 800.000'}, {label: '22 Okt', value: 70, amount: 'Rp 700.000'}, 
    {label: '23 Okt', value: 90, amount: 'Rp 900.000'}, {label: '24 Okt', value: 85, amount: 'Rp 850.000'}, 
    {label: '25 Okt', value: 60, amount: 'Rp 600.000'}, {label: '26 Okt', value: 75, amount: 'Rp 750.000'}, 
    {label: '27 Okt', value: 95, amount: 'Rp 950.000'}, {label: '28 Okt', value: 100, amount: 'Rp 1.000.000'}, 
    {label: '29 Okt', value: 85, amount: 'Rp 850.000'}, {label: '30 Okt', value: 110, amount: 'Rp 1.100.000'}
  ];

  const currentChartData = chartPeriod === "7hari" ? data7 : data30;

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
          {/* Unduh CSV */}
          <button
            onClick={handleDownloadCsv}
            disabled={isDownloadingCsv}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: isDownloadingCsv ? "var(--surface)" : "#fff",
              color: "var(--bark)", border: "1px solid var(--line)",
              padding: "0.6rem 1rem", borderRadius: "0.5rem",
              fontWeight: 600, fontSize: "0.85rem",
              cursor: isDownloadingCsv ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => !isDownloadingCsv && (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={(e) => !isDownloadingCsv && (e.currentTarget.style.background = "#fff")}
          >
            {isDownloadingCsv ? <ClockCounterClockwise size={18} className="animate-spin" /> : <DownloadSimple size={18} />}
            {isDownloadingCsv ? "Mengunduh..." : "Unduh CSV"}
          </button>
          {/* Unduh PDF */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: isDownloading ? "var(--surface)" : "var(--clay)",
              color: isDownloading ? "var(--bark)" : "#fff",
              border: "none",
              padding: "0.6rem 1.25rem", borderRadius: "0.5rem",
              fontWeight: 600, fontSize: "0.85rem",
              cursor: isDownloading ? "not-allowed" : "pointer",
              transition: "background 0.2s, transform 0.15s",
              boxShadow: isDownloading ? "none" : "0 4px 10px rgba(184, 92, 60, 0.2)"
            }}
            onMouseEnter={(e) => !isDownloading && (e.currentTarget.style.background = "var(--clay-dark)")}
            onMouseLeave={(e) => !isDownloading && (e.currentTarget.style.background = "var(--clay)")}
          >
            {isDownloading ? <ClockCounterClockwise size={18} className="animate-spin" /> : <DownloadSimple size={18} />}
            {isDownloading ? "Mengunduh..." : "Unduh PDF"}
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
      <div className="card-shadow" style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", padding: "1.5rem", marginBottom: "2.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", position: "relative", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", margin: 0, zIndex: 1 }}>
            Grafik Pendapatan {chartPeriod === "7hari" ? "Mingguan" : "Bulanan"}
          </h2>
          
          <div style={{ 
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            fontSize: "0.85rem", fontWeight: 800, color: "var(--clay)", padding: "0.3rem 1rem",
            background: "rgba(184,92,60,0.1)", borderRadius: "999px", zIndex: 0,
            letterSpacing: "0.05em"
          }} className="hidden sm:block">
            TAHUN {new Date().getFullYear()}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", background: "var(--surface)", padding: "0.25rem", borderRadius: "0.5rem", zIndex: 1 }}>
            <button
              onClick={() => setChartPeriod("7hari")}
              style={{
                padding: "0.4rem 0.8rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: chartPeriod === "7hari" ? "#fff" : "transparent",
                color: chartPeriod === "7hari" ? "var(--bark)" : "var(--bark-muted)",
                boxShadow: chartPeriod === "7hari" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              7 Hari
            </button>
            <button
              onClick={() => setChartPeriod("30hari")}
              style={{
                padding: "0.4rem 0.8rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: chartPeriod === "30hari" ? "#fff" : "transparent",
                color: chartPeriod === "30hari" ? "var(--bark)" : "var(--bark-muted)",
                boxShadow: chartPeriod === "30hari" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              30 Hari
            </button>
          </div>
        </div>
        <div style={{ 
          height: "260px", background: "linear-gradient(to top, rgba(184,92,60,0.03), transparent)", 
          borderRadius: "0.5rem", border: "1px dashed var(--line-light)",
          display: "flex", alignItems: "flex-end", padding: "1rem", gap: "0.2rem",
          position: "relative"
        }}>
          {currentChartData.map((d, i) => {
            const isHighest = d.value === Math.max(...currentChartData.map(c => c.value));
            return (
              <div 
                key={i} 
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "0.5rem", height: "100%", position: "relative", cursor: "pointer" }}
              >
                {/* Tooltip */}
                {hoveredBar === i && (
                  <div style={{
                    position: "absolute", bottom: `calc(${d.value}% + 10px)`, zIndex: 10,
                    background: "var(--bark)", color: "#fff", padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600,
                    whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    pointerEvents: "none", animation: "fadeIn 0.2s ease-out"
                  }}>
                    <div style={{ color: "var(--clay)", fontSize: "0.65rem", marginBottom: "0.1rem" }}>{d.label}</div>
                    {d.amount}
                    {/* Tooltip arrow */}
                    <div style={{
                      position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%) rotate(45deg)",
                      width: "8px", height: "8px", background: "var(--bark)"
                    }} />
                  </div>
                )}
                
                {/* Bar */}
                <div style={{ 
                  width: "100%", maxWidth: "100%", height: `${d.value}%`, 
                  background: hoveredBar === i ? "var(--clay-dark)" : (isHighest ? "var(--clay)" : "var(--clay-light)"), 
                  borderRadius: "4px 4px 0 0", transition: "height 0.8s ease-out, background 0.2s",
                  opacity: hoveredBar !== null && hoveredBar !== i ? 0.6 : 1
                }} />
                
                {/* X-Axis Label */}
                <span style={{ 
                  fontSize: chartPeriod === "7hari" ? "0.65rem" : "0.5rem", 
                  color: "var(--bark-muted)", 
                  fontWeight: 600, 
                  whiteSpace: "nowrap",
                  writingMode: chartPeriod === "30hari" ? "vertical-rl" : "horizontal-tb",
                  transform: chartPeriod === "30hari" ? "rotate(180deg)" : "none",
                  marginTop: chartPeriod === "30hari" ? "0.25rem" : "0"
                }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card-shadow" style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", margin: 0 }}>Riwayat Transaksi</h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <EarthySelect
              value={filterTrxType}
              onChange={setFilterTrxType}
              options={[
                { value: "semua", label: "Semua Tipe" },
                { value: "in", label: "Pemasukan" },
                { value: "out", label: "Pengeluaran" },
              ]}
            />
            <EarthySelect
              value={filterTrxStatus}
              onChange={setFilterTrxStatus}
              options={[
                { value: "semua", label: "Semua Status" },
                { value: "Selesai", label: "Selesai" },
                { value: "Tertunda", label: "Tertunda" },
              ]}
            />
          </div>
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
              {filteredTrx.map((trx, i) => (
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
