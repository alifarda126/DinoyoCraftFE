"use client";

import { getDemoSession } from "@/lib/demo";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Copy, Eye, PencilSimple, Check, X } from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
};

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [showQr, setShowQr] = useState<string | null>(null);

  // Edit profil state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    // Show mock profile data 
    setProfile({
      id: "mock-id",
      full_name: "Pengguna Demo",
      email: "pengguna@dinoyocraft.com",
      phone: "081234567890"
    });
    setEditName("Pengguna Demo");
    setEditPhone("081234567890");

    setBookings([
      {
        id: "mock-booking",
        booking_code: "BKG-1234",
        group_name: "Rombongan SMA",
        participant_count: 10,
        phone: "081234567890",
        status: "confirmed",
        created_at: new Date().toISOString(),
        schedule: {
          date: new Date().toISOString(),
          start_time: "09:00",
          end_time: "11:00"
        },
        payment: [
          {
            amount: 750000,
            status: "paid",
            payment_method: "qris"
          }
        ]
      }
    ]);
    
    setCustomOrders([]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profil berhasil diperbarui");
      setProfile((prev) => prev ? { ...prev, full_name: editName.trim(), phone: editPhone.trim() } : prev);
      setIsEditing(false);
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(profile?.full_name || "");
    setEditPhone(profile?.phone || "");
    setIsEditing(false);
  };

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
    <div>
        {/* Profil Card */}
        {profile && (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-900">Profil</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <PencilSimple className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-2 text-sm">
                <p><span className="text-zinc-500">Nama:</span> {profile.full_name || <span className="text-zinc-400 italic">Belum diisi</span>}</p>
                <p><span className="text-zinc-500">Email:</span> {profile.email}</p>
                <p><span className="text-zinc-500">Telepon:</span> {profile.phone || <span className="text-zinc-400 italic">Belum diisi</span>}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-zinc-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-zinc-700">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                  />
                </div>
                <p className="text-xs text-zinc-400">Email tidak bisa diubah dari sini.</p>
              </div>
            )}
          </div>
        )}

        {/* Riwayat Reservasi */}
        <div>
          <h3 className="font-semibold mb-4">Riwayat Reservasi</h3>
          {bookings.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-sm text-zinc-500">
              Belum ada reservasi.{" "}
              <Link href="/customer/reservasi" className="text-zinc-900 font-medium hover:underline">
                Reservasi sekarang →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-zinc-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-mono text-sm font-medium">{b.booking_code}</span>
                      <p className="text-sm text-zinc-600 mt-1">
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
                        title="Salin kode booking"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowQr(showQr === b.id ? null : b.id)}
                        className="p-1 text-zinc-400 hover:text-zinc-600"
                        title="Tampilkan QR code"
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
                  {b.payment && b.payment.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Pembayaran: Rp {b.payment[0].amount.toLocaleString("id-ID")} —{" "}
                      <span className={statusColor[b.payment[0].status] || ""}>{statusLabel[b.payment[0].status] || b.payment[0].status}</span>
                    </p>
                  )}
                  {showQr === b.id && (
                    <div className="mt-4 flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-zinc-200">
                      <QRCodeSVG
                        value={b.booking_code}
                        size={160}
                        level="M"
                        includeMargin
                      />
                      <p className="text-xs text-zinc-500">Tunjukkan QR ini di gang keramik</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pesanan Kustom */}
        <div>
          <h3 className="font-semibold mb-4">Pesanan Kustom</h3>
          {customOrders.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-sm text-zinc-500">
              Belum ada pesanan kustom.{" "}
              <Link href="/customer/katalog" className="text-zinc-900 font-medium hover:underline">
                Lihat katalog →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {customOrders.map((co) => (
                <div
                  key={co.id}
                  className="bg-white border border-zinc-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium">{co.title}</span>
                      <p className="text-sm text-zinc-600 mt-1 line-clamp-1">
                        {co.description}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Budget: Rp {co.budget.toLocaleString("id-ID")}
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
    </div>
  );
}
