"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, Users } from "@phosphor-icons/react";
import Link from "next/link";

type Schedule = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  is_locked: boolean;
};

export default function ReservasiPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [groupName, setGroupName] = useState("");
  const [participantCount, setParticipantCount] = useState(1);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const loadSchedules = async () => {
    const { data } = await supabase
      .from("schedules")
      .select("*")
      .gte("date", format(new Date(), "yyyy-MM-dd"))
      .order("date", { ascending: true })
      .limit(30);
    
    if (data) setSchedules(data);
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak login");

      const available = selectedSchedule.max_capacity - selectedSchedule.current_bookings;
      if (participantCount > available) {
        throw new Error(`Hanya tersisa ${available} slot`);
      }

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          schedule_id: selectedSchedule.id,
          group_name: groupName,
          participant_count: participantCount,
          phone,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Use atomic RPC to increment bookings safely (prevents race conditions)
      const { error: rpcError } = await supabase.rpc("increment_bookings", {
        schedule_id: selectedSchedule.id,
        increment_by: participantCount,
      });

      if (rpcError) {
        // If RPC fails (e.g. not yet created), fallback to manual update
        await supabase
          .from("schedules")
          .update({ current_bookings: selectedSchedule.current_bookings + participantCount })
          .eq("id", selectedSchedule.id);
      }

      toast.success("Reservasi berhasil dibuat");
      router.push(`/dashboard/pembayaran/${booking.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">Reservasi Kelas</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!selectedSchedule ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Pilih Jadwal</h2>
            {schedules.map((schedule) => {
              const available = schedule.max_capacity - schedule.current_bookings;
              const isFull = available <= 0 || schedule.is_locked;

              return (
                <button
                  key={schedule.id}
                  onClick={() => !isFull && setSelectedSchedule(schedule)}
                  disabled={isFull}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-left hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">
                          {format(new Date(schedule.date), "EEEE, d MMMM yyyy", { locale: id })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-5 h-5" />
                        <span>{schedule.start_time} - {schedule.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Users className="w-5 h-5" />
                        <span>{available} dari {schedule.max_capacity} slot tersisa</span>
                      </div>
                    </div>
                    {isFull && (
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        Penuh
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Jadwal Dipilih</h3>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p>{format(new Date(selectedSchedule.date), "EEEE, d MMMM yyyy", { locale: id })}</p>
                <p>{selectedSchedule.start_time} - {selectedSchedule.end_time}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold mb-4">Data Reservasi</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nama Perwakilan / Grup</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Jumlah Peserta</label>
                <input
                  type="number"
                  min="1"
                  max={selectedSchedule.max_capacity - selectedSchedule.current_bookings}
                  value={participantCount}
                  onChange={(e) => setParticipantCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nomor Telepon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
                className="flex-1 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {loading ? "Memproses..." : "Lanjut Pembayaran"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
