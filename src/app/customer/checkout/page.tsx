"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { ArrowLeft, MapPin, Truck, Wallet } from "@phosphor-icons/react";
import Image from "next/image";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getGroupedItems } = useCartStore();
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCourierSelect = (courier: string, cost: number) => {
    setSelectedCourier(courier);
    setShippingCost(cost);
  };

  const handleCheckout = async () => {
    if (!selectedCourier) {
      toast.error("Silakan pilih kurir pengiriman terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      // Mock API call to create order
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Pesanan berhasil dibuat!");
      // Redirect to product payment page with mock ID
      router.push("/customer/pembayaran-produk/ORD-999");
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <h2 className="text-xl font-bold mb-4">Keranjang Anda Kosong</h2>
        <Link href="/produk" className="px-6 py-2 bg-zinc-900 text-white rounded-lg">Belanja Sekarang</Link>
      </div>
    );
  }

  const subTotal = getTotalPrice();
  const total = subTotal + shippingCost;
  const groupedItems = getGroupedItems();

  return (
    <div style={{ background: "var(--surface)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif", color: "var(--bark)" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "1rem 2rem", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/keranjang" style={{ color: "var(--bark-muted)", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--bark)", margin: 0 }}>Checkout Pesanan</h1>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Alamat Pengiriman */}
            <div style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.25rem", padding: "1.5rem" }}>
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={24} color="var(--clay)" weight="fill" />
                <h2 className="text-lg font-bold">Alamat Pengiriman</h2>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <p className="font-bold mb-1">Budi Santoso <span className="font-normal text-zinc-500">(081234567890)</span></p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Jl. Bunga Mawar No. 12, RT 03/RW 04, Kel. Tlogomas, Kec. Lowokwaru, Kota Malang, Jawa Timur 65144</p>
                <button className="mt-3 text-sm font-semibold" style={{ color: "var(--clay)" }}>Ubah Alamat</button>
              </div>
            </div>

            {/* Barang yang Dibeli */}
            <div style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.25rem", padding: "1.5rem" }}>
              <h2 className="text-lg font-bold mb-4">Barang yang Dibeli</h2>
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([storeId, storeItems]) => (
                  <div key={storeId} className="border-b border-zinc-100 last:border-0 pb-4 last:pb-0">
                    <p className="font-bold mb-3 text-sm">{storeItems[0]?.store_name || "Toko Dinoyo"}</p>
                    {storeItems.map((item) => (
                      <div key={item.id} className="flex gap-4 mb-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100">
                          <Image src={item.image_url} alt={item.title} fill style={{ objectFit: "cover" }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                          <p className="text-sm text-zinc-500">{item.quantity} Barang ({item.weight || 500} gram)</p>
                          <p className="font-bold mt-1 text-sm">Rp {item.price.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Pilihan Pengiriman (Mock Biteship) */}
            <div style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.25rem", padding: "1.5rem" }}>
              <div className="flex items-center gap-3 mb-4">
                <Truck size={24} color="var(--clay)" weight="fill" />
                <h2 className="text-lg font-bold">Pilih Pengiriman</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleCourierSelect("JNE Reguler", 15000)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-colors flex justify-between items-center ${
                    selectedCourier === "JNE Reguler" ? "border-[var(--clay)] bg-[var(--surface-light)]" : "border-zinc-200"
                  }`}
                >
                  <div>
                    <div className="font-bold">JNE Reguler</div>
                    <div className="text-sm text-zinc-500">Estimasi 2-3 hari</div>
                  </div>
                  <div className="font-bold">Rp 15.000</div>
                </button>

                <button
                  onClick={() => handleCourierSelect("SiCepat BEST", 20000)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-colors flex justify-between items-center ${
                    selectedCourier === "SiCepat BEST" ? "border-[var(--clay)] bg-[var(--surface-light)]" : "border-zinc-200"
                  }`}
                >
                  <div>
                    <div className="font-bold">SiCepat BEST</div>
                    <div className="text-sm text-zinc-500">Estimasi 1 hari</div>
                  </div>
                  <div className="font-bold">Rp 20.000</div>
                </button>
              </div>
            </div>

          </div>

          {/* Ringkasan Belanja */}
          <aside style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.25rem", padding: "1.5rem", position: "sticky", top: "100px" }}>
            <h3 className="text-lg font-bold mb-4">Ringkasan Belanja</h3>
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Total Harga ({items.reduce((acc, curr) => acc + curr.quantity, 0)} Barang)</span>
                <span>Rp {subTotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Total Ongkos Kirim</span>
                <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
              </div>
            </div>
            
            <div className="border-t-2 border-zinc-100 my-4" />
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold">Total Tagihan</span>
              <span className="font-bold text-lg" style={{ color: "var(--clay)" }}>Rp {total.toLocaleString("id-ID")}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !selectedCourier}
              style={{
                width: "100%", padding: "1rem", borderRadius: "0.75rem",
                background: (!selectedCourier || loading) ? "var(--line-strong)" : "var(--bark)", 
                color: "#fff", fontWeight: 700, fontSize: "1rem", border: "none", 
                cursor: (!selectedCourier || loading) ? "not-allowed" : "pointer",
                display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem"
              }}
            >
              <Wallet size={20} />
              {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
