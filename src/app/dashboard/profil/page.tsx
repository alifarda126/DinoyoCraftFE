"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, Copy, Eye } from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

type Booking = {
  id: string;
  booking_code: string;
  group_name: string;
  participant_count: number;
  phone: string;
  status: string;
  created_at: string;
  schedule: {
    date: string;
    start_time: string;
    end_time: string;
  };
  payment: {
    amount: number;
    status: string;
    payment_method: string;
  }[];
};

type CustomOrder = {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  created_at: string;
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [showQr, setShowQr] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (prof) setProfile(prof);

    const { data: bks } = await supabase
      .from("bookings")
      .select(`
        *,
        schedule:schedules (date, start_time, end_time),
        payment:payments (amount, status, payment_method)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (bks) setBookings(bks as any);

    const { data: co } = await supabase
      .from("custom_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (co) setCustomOrders(co);
  }

  const statusLabel: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Terkonfirmasi",
    cancelled: "Dibatalkan",
    draft: "Draf",
    submitted: "Dikirim",
    quoted: "Dikutip",
    accepted: "Diterima",
    completed: "Selesai",
  };

  const statusColor: Record<string, string> = {
    pending: "text-amber-600",
    confirmed: "text-emerald-600",
    cancelled: "text-red-600",
    draft: "text-zinc-500",
    submitted: "text-amber-600",
    quoted: "text-blue-600",
    accepted: "text-emerald-600",
    completed: "text-emerald-600",
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">Profil & Riwayat</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {profile && (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Profil</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-zinc-500">Nama:</span> {profile.full_name || "-"}</p>
              <p><span className="text-zinc-500">Email:</span> {profile.email}</p>
              <p><span className="text-zinc-500">Telepon:</span> {profile.phone || "-"}</p>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-4">Riwayat Reservasi</h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada reservasi</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-mono text-sm font-medium">{b.booking_code}</span>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {b.group_name} / {b.participant_count} orang
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${statusColor[b.status] || ""}`}>
                        {statusLabel[b.status] || b.status}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(b.booking_code);
                          toast.success("Kode disalin");
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowQr(showQr === b.id ? null : b.id)}
                        className="p-1 text-zinc-400 hover:text-zinc-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {b.schedule && (
                    <p className="text-xs text-zinc-500">
                      {format(new Date(b.schedule.date), "d MMM yyyy", { locale: id })} / {b.schedule.start_time}-{b.schedule.end_time}
                    </p>
                  )}
                  {showQr === b.id && (
                    <div className="mt-4 flex justify-center p-4 bg-white rounded-lg">
                      <QRCodeSVG
                        value={b.booking_code}
                        size={160}
                        level="M"
                        includeMargin
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-4">Pesanan Kustom</h3>
          {customOrders.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada pesanan kustom</p>
          ) : (
            <div className="space-y-3">
              {customOrders.map((co) => (
                <div
                  key={co.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium">{co.title}</span>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1">
                        {co.description}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${statusColor[co.status] || ""}`}>
                      {statusLabel[co.status] || co.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}