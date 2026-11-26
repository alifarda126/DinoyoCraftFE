"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Package, Receipt, Users, CurrencyCircleDollar, TrendUp, ArrowRight, X, Bank } from "@phosphor-icons/react";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { EarthySelect } from "@/components/ui/EarthySelect";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface DashboardData {
  mitraName: string;
  stats: {
    totalPesanan: number;
    produkAktif: number;
    saldoAktif: number;
    kunjunganProfil: number;
  };
  recentOrders: {
    id: string;
    items: number;
    customer: string;
    status: string;
    imageUrl?: string;
  }[];
}

// Local payment logos from /public/payment/ — served as static files
const PAYMENT_METHODS = [
  { id: "BCA", name: "BCA", type: "Bank", logo: "/payment/bca.svg" },
  { id: "Mandiri", name: "Mandiri", type: "Bank", logo: "/payment/mandiri.svg" },
  { id: "BNI", name: "BNI", type: "Bank", logo: "/payment/bni.svg" },
  { id: "BRI", name: "BRI", type: "Bank", logo: "/payment/bri.svg" },
  { id: "GoPay", name: "GoPay", type: "E-Wallet", logo: "/payment/gopay.svg" },
  { id: "OVO", name: "OVO", type: "E-Wallet", logo: "/payment/ovo.svg" },
  { id: "DANA", name: "DANA", type: "E-Wallet", logo: "/payment/dana.svg" },
  { id: "ShopeePay", name: "ShopeePay", type: "E-Wallet", logo: "/payment/shopeepay.svg" },
];

export default function SellerDashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { user } = useAuthStore();

  // Withdraw State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Daily AI Insight State
  const [aiInsightLoading, setAiInsightLoading] = useState(true);
  const [aiInsightData, setAiInsightData] = useState<{
    configured: boolean;
    insight: string | null;
    status_message?: string;
    provider_label?: string | null;
  } | null>(null);

  const fetchDailyAiInsight = useCallback(async () => {
    const storedToken =
      (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");
    if (!storedToken) {
      setAiInsightLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/ai/daily-insight?scope=mitra`, {
        withCredentials: true,
        timeout: 20000,
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.data?.success && res.data?.data) {
        setAiInsightData(res.data.data);
      }
    } catch {
      setAiInsightData((prev) =>
        prev ?? {
          configured: false,
          insight: null,
          status_message:
            "Belum dapat memuat analisis AI saat ini. Pastikan layanan AI aktif atau API Key telah dipasang.",
        }
      );
    } finally {
      setAiInsightLoading(false);
    }
  }, []);

  // 1. Inisialisasi Auth Store
  useEffect(() => {
    useAuthStore.getState().initAuth();
  }, []);

  const isFetchingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    const storedToken =
      (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");
    if (!storedToken || isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (isInitial && !hasLoadedRef.current) setLoading(true);
    let shouldKeepLoading = false;
    try {
      const response = await axios.get(`${API_BASE_URL}/mitra/dashboard`, {
        withCredentials: true,
        timeout: 15000,
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });

      if (response.data.success && response.data.data) {
        const resData = response.data.data;
        setDashboardData(resData);
        hasLoadedRef.current = true;
        retryCountRef.current = 0;
        if (resData.mitraName) {
          setSellerName(resData.mitraName);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
      if (!hasLoadedRef.current && retryCountRef.current < 4) {
        retryCountRef.current += 1;
        shouldKeepLoading = true;
        retryTimerRef.current = setTimeout(() => fetchDashboardData(false), 3000);
      }
    } finally {
      isFetchingRef.current = false;
      if (!shouldKeepLoading) {
        setLoading(false);
      }
    }
  }, []);

  // 2. Fetch data dari endpoint backend, auto-refresh & Pusher realtime
  useEffect(() => {
    const storedToken =
      (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");
    const storedUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!storedToken) {
      router.push("/login");
      return;
    }

    let activeUser = user;
    if (!activeUser && storedUserStr) {
      try {
        activeUser = JSON.parse(storedUserStr);
      } catch (e) {
        console.error("Gagal parse:", e);
      }
    }

    const defaultName = (activeUser as any)?.store_name || (activeUser as any)?.name || "Mitra DinoyoCraft";
    setSellerName((prev) => prev || defaultName);

    fetchDashboardData(true);
    fetchDailyAiInsight();

    const onRefresh = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        fetchDashboardData(false);
      }
    };

    const pollInterval = setInterval(onRefresh, 45_000);
    window.addEventListener("focus", onRefresh);
    document.addEventListener("visibilitychange", onRefresh);
    window.addEventListener("mitra_orders_updated", onRefresh);
    window.addEventListener("mitra_products_updated", onRefresh);
    window.addEventListener("mitra_finance_updated", onRefresh);

    const userId = (activeUser as any)?.id || (activeUser as any)?.userId;
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b5fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
    let pusher: Pusher | null = null;
    if (userId) {
      try {
        pusher = new Pusher(pusherKey, { cluster: pusherCluster });
        const ch = pusher.subscribe(`user-${userId}`);
        ch.bind("new-paid-order", onRefresh);
        ch.bind("order-status-changed", onRefresh);
        ch.bind("order-completed", onRefresh);
      } catch {}
    }

    return () => {
      clearInterval(pollInterval);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      window.removeEventListener("focus", onRefresh);
      document.removeEventListener("visibilitychange", onRefresh);
      window.removeEventListener("mitra_orders_updated", onRefresh);
      window.removeEventListener("mitra_products_updated", onRefresh);
      window.removeEventListener("mitra_finance_updated", onRefresh);
      if (pusher && userId) {
        try {
          pusher.unsubscribe(`user-${userId}`);
          pusher.disconnect();
        } catch {}
      }
    };
  }, [user, router, fetchDashboardData, fetchDailyAiInsight]);

  const currentBalance = dashboardData?.stats?.saldoAktif ?? 0;
  const isDataLoading = loading && !dashboardData;

  const stats = [
    {
      label: "Total Pesanan",
      value: String(dashboardData?.stats?.totalPesanan ?? 0),
      icon: Receipt,
      color: "var(--clay)",
    },
    {
      label: "Produk Aktif",
      value: String(dashboardData?.stats?.produkAktif ?? 0),
      icon: Package,
      color: "var(--moss)",
    },
    {
      label: "Saldo Aktif",
      value: `Rp ${currentBalance.toLocaleString("id-ID")}`,
      icon: CurrencyCircleDollar,
      color: "var(--sand)",
      action: {
        label: "Tarik Saldo",
        onClick: () => setShowWithdraw(true),
      },
    },
    {
      label: "Kunjungan Profil",
      value: String(dashboardData?.stats?.kunjunganProfil ?? 0),
      icon: Users,
      color: "var(--ocean, #2b6cb0)",
    },
  ];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(withdrawAmount, 10);
    if (!numericAmount || numericAmount < 50000) {
      toast.error("Minimal penarikan adalah Rp 50.000.");
      return;
    }
    if (numericAmount > currentBalance) {
      toast.error("Nominal melebihi Saldo Aktif tersedia!");
      return;
    }
    if (!accountNumber.trim()) {
      toast.error("Nomor rekening / HP wajib diisi.");
      return;
    }
    const storedToken =
      (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");
    setIsWithdrawing(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/mitra/wallet/withdraw`,
        {
          amount: numericAmount,
          bank_name: selectedPayment.name,
          account_number: accountNumber.trim(),
          account_name: (accountName.trim() || sellerName || "Pemilik Toko"),
        },
        {
          withCredentials: true,
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        }
      );
      if (res.data?.success) {
        const refresh = await axios.get(`${API_BASE_URL}/mitra/dashboard`, {
          withCredentials: true,
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        });
        if (refresh.data?.success && refresh.data?.data) {
          setDashboardData(refresh.data.data);
        }
        toast.success(res.data.message || "Penarikan saldo berhasil diproses.");
        setShowWithdraw(false);
        setWithdrawAmount("");
        setAccountNumber("");
        setAccountName("");
      } else {
        toast.error(res.data?.message || "Gagal memproses penarikan.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memproses penarikan.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const defaultSampleImages = [
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=100&q=80",
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=100&q=80",
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80",
  ];

  const recentOrdersList = dashboardData?.recentOrders && dashboardData.recentOrders.length > 0
    ? dashboardData.recentOrders.map((ord, idx) => ({
        id: ord.id,
        items: `${ord.items} item`,
        buyer: ord.customer,
        status: ord.status,
        img: ord.imageUrl || defaultSampleImages[idx % defaultSampleImages.length],
      }))
    : [];

  return (
    <div>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem" }}>
          Selamat datang, {sellerName}!
        </h1>
        <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
          Berikut ringkasan performa tokomu hari ini.
        </p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {stats.map((stat, i) => (
          <div key={i} className="card-shadow" style={{
            background: "#fff", padding: "1.5rem", borderRadius: "1rem",
            border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "1rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "0.75rem",
                background: `${stat.color}20`, color: stat.color,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <stat.icon size={24} weight="duotone" />
              </div>
              {stat.action && (
                <button onClick={stat.action.onClick} style={{
                  fontSize: "0.75rem", fontWeight: 700, color: stat.color,
                  background: `${stat.color}15`, padding: "0.3rem 0.6rem",
                  borderRadius: "9999px", border: "none", cursor: "pointer",
                  transition: "background 0.2s"
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${stat.color}30`}
                  onMouseLeave={(e) => e.currentTarget.style.background = `${stat.color}15`}
                >
                  {stat.action.label}
                </button>
              )}
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)", marginBottom: "0.25rem" }}>{stat.label}</p>
              {isDataLoading ? (
                <div className="h-7 w-24 rounded-md bg-zinc-200/80 animate-pulse mt-1" />
              ) : (
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bark)" }}>{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        <div className="card-shadow" style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", marginBottom: "1.25rem" }}>Pesanan Terbaru</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {isDataLoading ? (
              <p className="text-zinc-400 text-sm py-4 text-center animate-pulse">Memuat pesanan terbaru...</p>
            ) : recentOrdersList.length > 0 ? (
              recentOrdersList.map((order) => (
                <div key={order.id} onClick={() => router.push("/mitra/dashboard/pesanan")} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "1rem", border: "1px solid var(--line-light)", borderRadius: "0.5rem",
                  cursor: "pointer", transition: "background 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, background: "var(--surface)", borderRadius: "0.5rem", overflow: "hidden", flexShrink: 0 }}>
                      <Image src={order.img} alt="" width={48} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} unoptimized />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--bark)" }}>{order.id}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--bark-muted)" }}>{order.items} • {order.buyer}</p>
                    </div>
                  </div>
                  <span style={{
                    padding: "0.25rem 0.75rem", borderRadius: "9999px",
                    fontSize: "0.75rem", fontWeight: 600,
                    background: "var(--sand-muted)", color: "var(--sand-dark)"
                  }}>
                    {order.status}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)", padding: "1rem 0" }}>Belum ada pesanan terbaru.</p>
            )}
          </div>
        </div>

        <div style={{ background: "linear-gradient(145deg, var(--clay), #a05a3b)", borderRadius: "1rem", padding: "1.5rem", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <TrendUp size={24} weight="bold" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Tips AI Hari Ini</h2>
          </div>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.6, opacity: 0.92, marginBottom: "1.5rem" }}>
            {aiInsightLoading
              ? "Memuat tips AI berdasarkan performa tokomu hari ini..."
              : aiInsightData?.configured && aiInsightData?.insight
                ? aiInsightData.insight
                : aiInsightData?.status_message ||
                  "API Key Asisten AI belum dipasang pada sistem. Tips AI harian akan aktif otomatis setelah Admin mengonfigurasi API Key penyedia AI."}
          </p>
          <button onClick={() => router.push("/mitra/dashboard/katalog")} style={{
            background: "#fff", color: "var(--clay)", border: "none",
            padding: "0.6rem 1rem", borderRadius: "9999px",
            fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
          }}>
            Optimalkan Sekarang <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: 400,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--bark)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Bank size={24} color="var(--clay)" />
                Tarik Saldo
              </h2>
              <button onClick={() => setShowWithdraw(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--bark-muted)" }}>
                <X size={20} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ background: "var(--surface)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--line)" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)", marginBottom: "0.25rem" }}>Saldo Tersedia</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--clay)" }}>Rp {currentBalance.toLocaleString("id-ID")}</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Nominal Penarikan (Rp)</label>
                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Minimal Rp 50.000" required min={50000} max={currentBalance}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", fontSize: "1rem" }} />
                <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", marginTop: "0.35rem", marginBottom: 0 }}>Minimal penarikan Rp 50.000</p>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1.2, position: "relative" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Metode Tujuan</label>
                  <EarthySelect
                    value={selectedPayment.id}
                    onChange={(val) => {
                      const found = PAYMENT_METHODS.find((m) => m.id === val);
                      if (found) setSelectedPayment(found);
                    }}
                    minWidth={170}
                    maxHeight={220}
                    style={{ width: "100%", height: "46px", padding: "0.5rem 0.75rem" }}
                    options={PAYMENT_METHODS.map((method) => ({
                      value: method.id,
                      label: method.name,
                      sublabel: method.type,
                      icon: (
                        <div style={{ width: 32, display: "flex", justifyContent: "center" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={method.logo}
                            alt={method.name}
                            style={{ objectFit: "contain", height: "16px", width: "auto", maxWidth: "32px", borderRadius: "3px" }}
                          />
                        </div>
                      ),
                    }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Nomor Rekening / HP</label>
                  <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required
                    placeholder="Masukkan nomor..."
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", fontSize: "0.9rem", height: "46px" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Nama Pemilik Rekening</label>
                <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)}
                  placeholder={sellerName || "Sesuai buku tabungan / e-wallet"}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", fontSize: "0.9rem", height: "46px" }} />
              </div>

              <button type="submit" disabled={isWithdrawing} style={{
                marginTop: "0.5rem", padding: "0.875rem", borderRadius: "0.75rem",
                background: isWithdrawing ? "var(--clay-light)" : "var(--clay)",
                color: "#fff", fontWeight: 700, fontSize: "1rem", border: "none", cursor: isWithdrawing ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}>
                {isWithdrawing ? "Memproses..." : "Tarik Sekarang"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
