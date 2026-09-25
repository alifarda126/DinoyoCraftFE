"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { Storefront, Package, Receipt, Users, CurrencyCircleDollar, TrendUp } from "@phosphor-icons/react";

export default function SellerDashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState("");

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/mitra/login");
    } else {
      setSellerName(session.profile.full_name);
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div>Memuat data...</div>;

  const stats = [
    { label: "Total Pesanan", value: "24", icon: Receipt, color: "var(--clay)" },
    { label: "Produk Aktif", value: "12", icon: Package, color: "var(--moss)" },
    { label: "Pendapatan Bulan Ini", value: "Rp 4.500.000", icon: CurrencyCircleDollar, color: "var(--sand)" },
    { label: "Kunjungan Profil", value: "342", icon: Users, color: "var(--ocean, #2b6cb0)" },
  ];

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

      {/* Quick Actions & Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", marginBottom: "1.25rem" }}>Pesanan Terbaru</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[1, 2, 3].map((item) => (
              <div key={item} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1rem", border: "1px solid var(--line-light)", borderRadius: "0.5rem"
              }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, background: "var(--surface)", borderRadius: "0.5rem" }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--bark)" }}>INV/2023/10/XX{item}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--bark-muted)" }}>2 item • Budi Santoso</p>
                  </div>
                </div>
                <span style={{
                  padding: "0.25rem 0.75rem", borderRadius: "9999px",
                  fontSize: "0.75rem", fontWeight: 600,
                  background: "var(--sand-muted)", color: "var(--sand-dark)"
                }}>
                  Perlu Diproses
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "linear-gradient(145deg, var(--clay), #a05a3b)", borderRadius: "1rem", padding: "1.5rem", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <TrendUp size={24} weight="bold" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Tips AI Hari Ini</h2>
          </div>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.6, opacity: 0.9, marginBottom: "1.5rem" }}>
            &quot;Produk Vas Keramik Minimalis-mu sedang tren! Coba tambahkan foto dengan pencahayaan alami untuk meningkatkan konversi hingga 20%.&quot;
          </p>
          <button style={{
            background: "#fff", color: "var(--clay)", border: "none",
            padding: "0.6rem 1rem", borderRadius: "9999px",
            fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
            width: "100%"
          }}>
            Optimalkan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
