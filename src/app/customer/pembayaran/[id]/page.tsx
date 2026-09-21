"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

type OrderPayment = {
  id: string;
  order_code: string;
  store_name: string;
  item_count: number;
  total_amount: number;
};

export default function PembayaranPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [order, setOrder] = useState<OrderPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"va" | "ewallet" | "qris">("va");
  const router = useRouter();

  const loadOrder = async () => {
    // Mock order data based on ID
    setOrder({
      id: bookingId,
      order_code: bookingId.startsWith("ORD-") ? bookingId : "ORD-20231024-001",
      store_name: "Toko Keramik Nusantara",
      item_count: 3,
      total_amount: 150000,
    });
  };

  useEffect(() => {
    loadOrder();
  }, []);

  const handlePayment = async () => {
    if (!order) return;
    setLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Pembayaran berhasil (Mock)");
      router.push("/customer/pesanan");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 text-zinc-900">
        <div className="text-zinc-600">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 text-zinc-900 font-outfit">
       <header className="bg-white border-b border-zinc-200">
         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
           <Link href="/customer/pesanan" className="text-zinc-600 hover:text-zinc-900">
             <span>← Kembali</span>
           </Link>
          <h1 className="text-xl font-bold">Pembayaran Pesanan</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4">Detail Pesanan</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Kode Pesanan</span>
              <span className="font-mono font-semibold">{order.order_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Toko</span>
              <span className="font-semibold">{order.store_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Jumlah Barang</span>
              <span className="font-semibold">{order.item_count} barang</span>
            </div>
            <div className="border-t border-zinc-200 pt-3 mt-3 flex justify-between">
              <span className="font-bold text-base">Total Tagihan</span>
              <span className="font-bold text-base text-clay">Rp {order.total_amount.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4">Metode Pembayaran</h3>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("va")}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                paymentMethod === "va"
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className="font-semibold">Virtual Account</div>
              <div className="text-sm text-zinc-600 mt-1">BCA, Mandiri, BNI, BRI</div>
            </button>

            <button
              onClick={() => setPaymentMethod("ewallet")}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                paymentMethod === "ewallet"
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className="font-semibold">E-Wallet</div>
              <div className="text-sm text-zinc-600 mt-1">GoPay, OVO, Dana, LinkAja</div>
            </button>

            <button
              onClick={() => setPaymentMethod("qris")}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                paymentMethod === "qris"
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className="font-semibold">QRIS</div>
              <div className="text-sm text-zinc-600 mt-1">Scan QR dengan aplikasi apapun</div>
            </button>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3.5 bg-clay text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-clay/20"
        >
          {loading ? "Memproses Pembayaran..." : "Bayar Sekarang"}
        </button>
      </main>
    </div>
  );
}
