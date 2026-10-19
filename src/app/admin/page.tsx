"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { Storefront, Receipt, Users, CurrencyCircleDollar, WarningCircle } from "@phosphor-icons/react";
import { adminService } from "@/services/admin.service";

interface DashboardStats {
  totalTransaksi: number;
  totalOmzet: number;
  kunjunganWisatawan: number;
  tokoPengrajinAktif: number;
  pengajuanTokoBaru: number;
  transaksiTerbaru: Array<{ id: string; toko: string; nominal: number }>;
}

export default function AdminDashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "admin") {
      router.push("/auth/login");
      return;
    }

    setAdminName(session.profile.full_name);

    const fetchDashboardData = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success && res.data) {
          setStatsData(res.data);
        } else if (res.data) {
          setStatsData(res.data);
        }
      } catch (error) {
        console.error("Gagal menarik data dashboard dari backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-zinc-500 font-medium">Memuat data dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Transaksi Lintas Toko",
      value: statsData?.totalTransaksi !== undefined ? statsData.totalTransaksi.toLocaleString("id-ID") : "0",
      icon: Receipt,
      color: "var(--clay)",
    },
    {
      label: "Total Omzet (Bulan Ini)",
      value: statsData?.totalOmzet !== undefined ? `Rp ${statsData.totalOmzet.toLocaleString("id-ID")}` : "Rp 0",
      icon: CurrencyCircleDollar,
      color: "var(--moss)",
    },
    {
      label: "Kunjungan Wisatawan",
      value: statsData?.kunjunganWisatawan !== undefined ? statsData.kunjunganWisatawan.toLocaleString("id-ID") : "0",
      icon: Users,
      color: "var(--ocean, #2b6cb0)",
    },
    {
      label: "Toko Pengrajin Aktif",
      value: statsData?.tokoPengrajinAktif !== undefined ? statsData.tokoPengrajinAktif.toLocaleString("id-ID") : "0",
      icon: Storefront,
      color: "var(--sand)",
    },
  ];

  return (
    <div>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem" }}>
          Selamat datang, {adminName}!
        </h1>
        <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
          Berikut ringkasan statistik dan aktivitas platform DinoyoCraft.
        </p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: "#fff", padding: "1.5rem", borderRadius: "1rem",
            border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "1rem"
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "0.75rem",
              background: `${stat.color}20`, color: stat.color,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <stat.icon size={24} weight="duotone" />
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)", marginBottom: "0.25rem" }}>{stat.label}</p>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bark)" }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)" }}>Aktivitas Transaksi Terbaru</h2>
            <button onClick={() => router.push("/admin/transaksi")} style={{ background: "none", border: "none", color: "var(--clay)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>Lihat Semua</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {statsData?.transaksiTerbaru && statsData.transaksiTerbaru.length > 0 ? (
              statsData.transaksiTerbaru.map((trx, index) => (
                <div key={index} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "1rem", border: "1px solid var(--line-light)", borderRadius: "0.5rem"
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--bark)" }}>{trx.id}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--bark-muted)" }}>Dari {trx.toko} • Rp {trx.nominal.toLocaleString("id-ID")}</p>
                  </div>
                  <span style={{
                    padding: "0.25rem 0.75rem", borderRadius: "9999px",
                    fontSize: "0.75rem", fontWeight: 600,
                    background: "var(--moss)", color: "#fff"
                  }}>
                    Berhasil
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm py-4 text-center">Belum ada aktivitas transaksi.</p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "linear-gradient(145deg, var(--bark), #2d2a26)", borderRadius: "1rem", padding: "1.5rem", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <WarningCircle size={24} weight="bold" color="var(--sand)" />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Perlu Perhatian</h2>
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6, opacity: 0.9, marginBottom: "1.5rem" }}>
              {statsData && statsData.pengajuanTokoBaru > 0 ? (
                <>Terdapat <strong>{statsData.pengajuanTokoBaru} pengajuan toko baru</strong> yang menunggu verifikasi Anda.</>
              ) : (
                <>Saat ini <strong>tidak ada pengajuan toko baru</strong> yang menunggu verifikasi.</>
              )}
            </p>
            <button onClick={() => router.push("/admin/verifikasi")} style={{
              background: "#fff", color: "var(--bark)", border: "none",
              padding: "0.6rem 1rem", borderRadius: "9999px",
              fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
              width: "100%"
            }}>
              Tinjau Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
