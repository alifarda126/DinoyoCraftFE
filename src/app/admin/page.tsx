"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { Storefront, Receipt, Users, CurrencyCircleDollar, WarningCircle, ArrowsClockwise } from "@phosphor-icons/react";
import { adminService } from "@/services/admin.service";
import Pusher from "pusher-js";

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
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("");
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const isFetchingRef = useRef(false);

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const res = await adminService.getDashboardStats();
      if (res?.success && res?.data) {
        setStatsData(res.data);
        setErrorMsg(null);
      } else if (res?.data) {
        setStatsData(res.data);
        setErrorMsg(null);
      }
    } catch (error: any) {
      console.error("Gagal menarik data dashboard dari backend:", error);
      setErrorMsg(error?.response?.data?.message || "Gagal memuat statistik terbaru dari server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const session = getDemoSession();
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if ((!session || session.role !== "admin") && !storedToken) {
      router.push("/login");
      return;
    }

    if (session?.profile?.full_name) {
      setAdminName(session.profile.full_name);
    } else if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        setAdminName(u?.name || "Admin");
      } catch {
        setAdminName("Admin");
      }
    }

    fetchDashboardData(true);

    const onFocusOrVisible = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        fetchDashboardData(false);
      }
    };

    const pollInterval = setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        fetchDashboardData(false);
      }
    }, 45_000);

    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);
    window.addEventListener("admin_verifikasi_updated", onFocusOrVisible);
    window.addEventListener("admin_moderasi_updated", onFocusOrVisible);

    // Pusher realtime untuk pembaruan verifikasi & transaksi baru
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b5fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
    let pusher: Pusher | null = null;
    try {
      pusher = new Pusher(pusherKey, { cluster: pusherCluster });
      const verifChannel = pusher.subscribe("mitra-verification");
      verifChannel.bind("verification-status-updated", () => fetchDashboardData(false));

      const logsChannel = pusher.subscribe("admin-system-logs");
      logsChannel.bind("system-log.created", (evt: any) => {
        if (evt?.category === "transaction" || evt?.category === "order" || evt?.category === "moderation") {
          fetchDashboardData(false);
        }
      });
    } catch {}

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
      window.removeEventListener("admin_verifikasi_updated", onFocusOrVisible);
      window.removeEventListener("admin_moderasi_updated", onFocusOrVisible);
      if (pusher) {
        try {
          pusher.unsubscribe("mitra-verification");
          pusher.unsubscribe("admin-system-logs");
          pusher.disconnect();
        } catch {}
      }
    };
  }, [router, fetchDashboardData]);

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
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem" }}>
            Selamat datang, {adminName}!
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
            Berikut ringkasan statistik dan aktivitas platform DinoyoCraft.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchDashboardData(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 transition"
        >
          <ArrowsClockwise size={15} weight="bold" className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Memperbarui..." : "Refresh"}
        </button>
      </header>

      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-semibold text-red-800">{errorMsg}</span>
          <button
            type="button"
            onClick={() => fetchDashboardData(false)}
            className="px-3 py-1 rounded-md text-xs font-bold bg-red-600 text-white hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

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
