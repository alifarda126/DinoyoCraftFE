"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

type Booking = {
  id: string;
  booking_code: string;
  group_name: string;
  participant_count: number;
  phone: string;
  status: string;
  schedule: {
    date: string;
    start_time: string;
    end_time: string;
  };
};

export default function PembayaranPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"va" | "ewallet" | "qris">("va");
  const router = useRouter();
  const loadBooking = async () => {
    // Mock booking data
    setBooking({
      id: bookingId,
      booking_code: "BKG-MOCK-01",
      group_name: "Grup Demo Frontend",
      participant_count: 5,
      phone: "08123456789",
      status: "pending",
      schedule: {
        date: new Date().toISOString(),
        start_time: "10:00",
        end_time: "12:00"
      }
    });
  };

  useEffect(() => {
    loadBooking();
  }, []);

  const handlePayment = async () => {
    if (!booking) return;
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

  if (!booking) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Memuat...</div>
      </div>
    );
  }

  const amount = booking.participant_count * 50000;

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
       <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
           <Link href="/customer" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
             <span>←</span>
           </Link>
          <h1 className="text-xl font-semibold">Pembayaran</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Detail Reservasi</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Kode Booking</span>
              <span className="font-mono font-medium">{booking.booking_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Nama Grup</span>
              <span className="font-medium">{booking.group_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Jumlah Peserta</span>
              <span className="font-medium">{booking.participant_count} orang</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Harga per Orang</span>
              <span className="font-medium">Rp 50.000</span>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">Rp {amount.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Metode Pembayaran</h3>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("va")}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                paymentMethod === "va"
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="font-medium">Virtual Account</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">BCA, Mandiri, BNI, BRI</div>
            </button>

            <button
              onClick={() => setPaymentMethod("ewallet")}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                paymentMethod === "ewallet"
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="font-medium">E-Wallet</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">GoPay, OVO, Dana, LinkAja</div>
            </button>

            <button
              onClick={() => setPaymentMethod("qris")}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                paymentMethod === "qris"
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="font-medium">QRIS</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Scan QR dengan aplikasi apapun</div>
            </button>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </main>
    </div>
  );
}
