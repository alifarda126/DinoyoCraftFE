"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, MagnifyingGlass, UserCheck } from "@phosphor-icons/react";
import Link from "next/link";

type BookingWithParticipants = {
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
  participants: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    attended: boolean | null;
  }>;
};

export default function ManifesPage() {
  const [bookings, setBookings] = useState<BookingWithParticipants[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdmin();
    loadManifes();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      router.push("/dashboard");
    }
  }

  async function loadManifes() {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);

    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        schedule:schedules (date, start_time, end_time),
        participants (*)
      `)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    if (data) setBookings(data as any);
  }

  async function markAttended(participantId: string) {
    const { error } = await supabase
      .from("participants")
      .update({ attended: true })
      .eq("id", participantId);

    if (error) {
      toast.error("Gagal menandai kehadiran");
      return;
    }
    toast.success("Kehadiran dicatat");
    loadManifes();
  }

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.participants.some((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDate = selectedDate
      ? b.schedule?.date === selectedDate
      : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">Manifes Kehadiran</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode booking, nama perwakilan, atau nama peserta..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
        </div>

        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
            >
              <div className="p-5 flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="font-mono text-sm font-semibold">{booking.booking_code}</span>
                  <p className="font-medium mt-0.5">{booking.group_name}</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {booking.schedule?.date} / {booking.schedule?.start_time}-{booking.schedule?.end_time}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-zinc-500">{booking.participants.length} peserta</span>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {booking.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="px-5 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{participant.name}</p>
                      <p className="text-xs text-zinc-500">{participant.phone}</p>
                    </div>
                    <button
                      onClick={() => markAttended(participant.id)}
                      disabled={!!participant.attended}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                        participant.attended
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 cursor-default"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      {participant.attended ? "Hadir" : "Tandai Hadir"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-zinc-500 py-12">
              Tidak ada reservasi yang ditemukan.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
