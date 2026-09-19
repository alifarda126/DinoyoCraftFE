"use client";

import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Users,
  Lock,
  LockOpen,
  Plus,
  Trash,
} from "@phosphor-icons/react";
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

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const checkAdmin = async () => {
    const demo = getDemoSession();
    if (!demo || demo.role !== "admin") {
      router.push("/auth");
      return;
    }
  };

  const loadSchedules = async () => {
    setSchedules([
      { id: "s1", date: format(new Date(), "yyyy-MM-dd"), start_time: "09:00", end_time: "11:00", max_capacity: 20, current_bookings: 5, is_locked: false }
    ]);
  };

  useEffect(() => {
    checkAdmin();
    loadSchedules();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Jadwal berhasil ditambahkan (Mock)");
      setShowForm(false);
      loadSchedules();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function toggleLock(scheduleId: string, currentLock: boolean) {
    toast.success(!currentLock ? "Jadwal dikunci (Mock)" : "Jadwal dibuka (Mock)");
    loadSchedules();
  }

  async function deleteSchedule(scheduleId: string) {
    if (!confirm("Hapus jadwal ini?")) return;
    toast.success("Jadwal dihapus (Mock)");
    loadSchedules();
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900  mb-1">Manajemen Jadwal</h1>
          <p className="text-zinc-500 text-sm">Atur jam buka, kapasitas, dan kunci jadwal harian.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-zinc-900  text-white  rounded-lg text-sm font-medium hover:bg-zinc-800 :bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Jadwal
        </button>
      </div>
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 bg-white  border border-zinc-200  rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-lg">Tambah Jadwal Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300  bg-white  focus:outline-none focus:ring-2 focus:ring-zinc-900 :ring-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Jam Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300  bg-white  focus:outline-none focus:ring-2 focus:ring-zinc-900 :ring-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Jam Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300  bg-white  focus:outline-none focus:ring-2 focus:ring-zinc-900 :ring-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kapasitas Maks</label>
                <input
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300  bg-white  focus:outline-none focus:ring-2 focus:ring-zinc-900 :ring-zinc-100"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-zinc-300  rounded-lg font-medium hover:bg-zinc-50 :bg-zinc-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-zinc-900  text-white  rounded-lg font-medium hover:bg-zinc-800 :bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {schedules.map((schedule) => {
            const available = schedule.max_capacity - schedule.current_bookings;
            const isFull = available <= 0 && !schedule.is_locked;

            return (
              <div
                key={schedule.id}
                className={`bg-white  border rounded-xl p-5 ${
                  schedule.is_locked
                    ? "border-red-200  bg-red-50/30 "
                    : isFull
                    ? "border-amber-200 "
                    : "border-zinc-200 "
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Calendar className="w-5 h-5" />
                      {format(new Date(schedule.date), "EEEE, d MMMM yyyy", { locale: localeId })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 ">
                      <Clock className="w-4 h-4" />
                      {schedule.start_time} - {schedule.end_time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 ">
                      <Users className="w-4 h-4" />
                      {schedule.current_bookings}/{schedule.max_capacity} terisi
                      {isFull && (
                        <span className="text-amber-600 font-medium">(PENUH)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLock(schedule.id, schedule.is_locked)}
                      className={`p-2 rounded-lg transition-colors ${
                        schedule.is_locked
                          ? "bg-red-100  text-red-600 "
                          : "bg-zinc-100  text-zinc-600 "
                      }`}
                      title={schedule.is_locked ? "Buka jadwal" : "Kunci jadwal"}
                    >
                      {schedule.is_locked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <LockOpen className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-2 rounded-lg bg-red-100  text-red-600  hover:bg-red-200 :bg-red-900/50 transition-colors"
                      title="Hapus jadwal"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {schedules.length === 0 && (
            <p className="text-center text-zinc-500 py-12">
              Belum ada jadwal. Tambahkan jadwal baru.
            </p>
          )}
        </div>
    </div>
  );
}
