"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { Storefront, Package, Receipt, Users, CurrencyCircleDollar, TrendUp, ArrowRight, X, Bank, CaretDown } from "@phosphor-icons/react";
import Image from "next/image";
import { toast } from "sonner";

// Local payment logos from /public/payment/ — served as static files
const PAYMENT_METHODS = [
  { id: "BCA",       name: "BCA",       type: "Bank",     logo: "/payment/bca.svg" },
  { id: "Mandiri",   name: "Mandiri",   type: "Bank",     logo: "/payment/mandiri.svg" },
  { id: "BNI",       name: "BNI",       type: "Bank",     logo: "/payment/bni.svg" },
  { id: "BRI",       name: "BRI",       type: "Bank",     logo: "/payment/bri.svg" },
  { id: "GoPay",     name: "GoPay",     type: "E-Wallet", logo: "/payment/gopay.svg" },
  { id: "OVO",       name: "OVO",       type: "E-Wallet", logo: "/payment/ovo.svg" },
  { id: "DANA",      name: "DANA",      type: "E-Wallet", logo: "/payment/dana.svg" },
  { id: "ShopeePay", name: "ShopeePay", type: "E-Wallet", logo: "/payment/shopeepay.svg" },
];

export default function SellerDashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState("");

  // Withdraw State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const currentBalance = 4500000;

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
    { label: "Saldo Aktif", value: `Rp ${currentBalance.toLocaleString("id-ID")}`, icon: CurrencyCircleDollar, color: "var(--sand)", action: { label: "Tarik Saldo", onClick: () => setShowWithdraw(true) } },
    { label: "Kunjungan Profil", value: "342", icon: Users, color: "var(--ocean, #2b6cb0)" },
  ];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseInt(withdrawAmount) > currentBalance) {
      toast.error("Nominal tidak valid atau melebihi saldo!");
      return;
    }
    setIsWithdrawing(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    setIsWithdrawing(false);
    setShowWithdraw(false);
    setWithdrawAmount("");
    toast.success("Penarikan saldo sedang diproses ke rekening Anda.");
  };

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
            {[
              { id: "INV/2023/10/XX1", items: "2 item", buyer: "Budi Santoso", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=100&q=80" },
              { id: "INV/2023/10/XX2", items: "1 item", buyer: "Siti Aminah", img: "https://images.unsplash.com/photo-1578886134769-e9682121e7e4?auto=format&fit=crop&w=100&q=80" },
              { id: "INV/2023/10/XX3", items: "3 item", buyer: "Joko Anwar", img: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=100&q=80" },
            ].map((order) => (
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
                    <Image src={order.img} alt="" width={48} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
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
                  placeholder="Misal: 1000000" required max={currentBalance}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", fontSize: "1rem" }} />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1.2, position: "relative" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Metode Tujuan</label>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)",
                      background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
                      cursor: "pointer", fontSize: "0.9rem", height: "46px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 40, display: "flex", justifyContent: "center" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedPayment.logo} alt={selectedPayment.name} style={{ objectFit: "contain", height: "18px", width: "auto", maxWidth: "40px", borderRadius: "4px" }} />
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--bark)" }}>{selectedPayment.name}</span>
                    </div>
                    <CaretDown size={14} weight="bold" style={{ color: "var(--bark-muted)", transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </div>
                  
                  {isDropdownOpen && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, right: 0, marginTop: "0.25rem",
                      background: "#fff", border: "1px solid var(--line)", borderRadius: "0.75rem",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      zIndex: 100, maxHeight: "220px", overflowY: "auto"
                    }}>
                      {PAYMENT_METHODS.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => { setSelectedPayment(method); setIsDropdownOpen(false); }}
                          style={{
                            padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem",
                            cursor: "pointer", borderBottom: "1px solid var(--line-light)",
                            background: selectedPayment.id === method.id ? "var(--surface)" : "#fff"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = selectedPayment.id === method.id ? "var(--surface)" : "#fff"}
                        >
                          <div style={{ width: 40, display: "flex", justifyContent: "center" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={method.logo} alt={method.name} style={{ objectFit: "contain", height: "20px", width: "auto", maxWidth: "40px", borderRadius: "4px" }} />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", margin: 0 }}>{method.name}</p>
                            <p style={{ fontSize: "0.7rem", color: "var(--bark-muted)", margin: 0 }}>{method.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Nomor Rekening / HP</label>
                  <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required
                    placeholder="Masukkan nomor..."
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", fontSize: "0.9rem", height: "46px" }} />
                </div>
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
