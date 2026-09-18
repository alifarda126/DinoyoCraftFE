"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  X,
  Sparkles,
  CheckCircle2,
  Info,
  CalendarDays,
  Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getDemoSession, getDemoUser } from "@/lib/demo";

type Schedule = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  title?: string;
  location?: string;
  max_capacity: number;
  current_bookings: number;
  is_locked: boolean;
};

type NoteItem = {
  id: string;
  title: string;
  content: string;
  category: string;
};

const INITIAL_NOTES: NoteItem[] = [
  {
    id: "n1",
    title: "Persiapan Pakaian Kelas Keramik",
    content:
      "Kenakan pakaian santai yang nyaman dan tidak masalah jika terkena percikan tanah liat. Tanah liat Dinoyo 100% alami, tidak beracun, dan mudah dicuci bersih dengan air biasa.",
    category: "Tips Kunjungan",
  },
  {
    id: "n2",
    title: "Proses Pengeringan & Pembakaran (Kiln)",
    content:
      "Karya keramik yang Anda bentuk membutuhkan proses pengeringan alami 2-3 hari serta pembakaran tungku tradisional suhu 1.200°C. Karya siap diambil 5-7 hari setelah sesi atau dikirim ke alamat Anda.",
    category: "Prosedur Karya",
  },
  {
    id: "n3",
    title: "Ketentuan Reservasi Rombongan",
    content:
      "Untuk rombongan lebih dari 8 orang, reservasi disarankan minimal H-3 agar pengrajin dapat menyiapkan roda pemutar dan instruktur pendamping yang memadai.",
    category: "Kebijakan",
  },
];

export default function ReservasiPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // UI Navigation States
  const [activeTab, setActiveTab] = useState<"calendar" | "notes">("calendar");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data States
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [notes] = useState<NoteItem[]>(INITIAL_NOTES);

  // Form Booking States
  const [groupName, setGroupName] = useState("");
  const [participantCount, setParticipantCount] = useState(1);
  const [phone, setPhone] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Generate dynamic sample schedules for any month
  const generateMonthlySampleSchedules = useCallback((baseDate: Date): Schedule[] => {
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();
    const pad = (n: number) => String(n).padStart(2, "0");

    const sampleDates = [
      { day: 5, timeStart: "09:00", timeEnd: "11:30", title: "Kelas Roda Pemutar Dasar", loc: "Studio Utama Dinoyo, Gang 2", cap: 12, cur: 4 },
      { day: 12, timeStart: "13:30", timeEnd: "16:00", title: "Workshop Handbuilding & Pinch Pot", loc: "Bengkel Keramik Pak Hadi, Gang 4", cap: 15, cur: 9 },
      { day: 17, timeStart: "09:00", timeEnd: "11:30", title: "Kelas Roda Pemutar Dasar (Wheel Throwing)", loc: "Studio Utama Dinoyo, Gang 2", cap: 12, cur: 5 },
      { day: 17, timeStart: "13:30", timeEnd: "16:00", title: "Workshop Handbuilding & Pinch Pot", loc: "Bengkel Keramik Pak Hadi, Gang 4", cap: 15, cur: 8 },
      { day: 19, timeStart: "10:00", timeEnd: "12:30", title: "Sesi Glasir & Pewarnaan Keramik", loc: "Studio Glasir Tradisional, Gang 3", cap: 10, cur: 3 },
      { day: 24, timeStart: "09:00", timeEnd: "11:30", title: "Sesi Keramik Anak & Keluarga", loc: "Pendopo Pengrajin Dinoyo", cap: 20, cur: 14 },
      { day: 26, timeStart: "14:00", timeEnd: "16:30", title: "Masterclass Keramik Dinoyo", loc: "Studio Maestro Dinoyo, Gang 1", cap: 8, cur: 7 },
    ];

    return sampleDates.map((item, idx) => ({
      id: `sample-${y}-${m}-${item.day}-${idx}`,
      date: `${y}-${pad(m + 1)}-${pad(item.day)}`,
      start_time: item.timeStart,
      end_time: item.timeEnd,
      title: item.title,
      location: item.loc,
      max_capacity: item.cap,
      current_bookings: item.cur,
      is_locked: false,
    }));
  }, []);

  // Load schedules from Supabase (with dynamic sample fallback)
  const loadSchedules = useCallback(async () => {
    try {
      const fromStr = format(startOfMonth(subMonths(currentMonth, 1)), "yyyy-MM-dd");
      const toStr = format(endOfMonth(addMonths(currentMonth, 1)), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .gte("date", fromStr)
        .lte("date", toStr)
        .order("date", { ascending: true });

      if (!error && data && data.length > 0) {
        const formatted: Schedule[] = data.map((item) => ({
          ...item,
          title: item.title || "Kelas Keramik Dinoyo",
          location: item.location || "Studio Keramik Dinoyo",
        }));
        setSchedules(formatted);
      } else {
        const currentSamples = generateMonthlySampleSchedules(currentMonth);
        const prevSamples = generateMonthlySampleSchedules(subMonths(currentMonth, 1));
        const nextSamples = generateMonthlySampleSchedules(addMonths(currentMonth, 1));
        setSchedules([...prevSamples, ...currentSamples, ...nextSamples]);
      }
    } catch {
      setSchedules(generateMonthlySampleSchedules(currentMonth));
    }
  }, [supabase, currentMonth, generateMonthlySampleSchedules]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Map schedules by date string
  const schedulesByDate = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    schedules.forEach((item) => {
      const d = item.date;
      if (!map[d]) map[d] = [];
      map[d].push(item);
    });
    return map;
  }, [schedules]);

  // Schedules for selected day
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const schedulesForSelectedDay = schedulesByDate[selectedDateStr] || [];

  // Month navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Open booking modal
  const handleOpenBooking = (schedule?: Schedule) => {
    if (schedule) {
      setSelectedSchedule(schedule);
    } else if (schedulesForSelectedDay.length > 0) {
      setSelectedSchedule(schedulesForSelectedDay[0]);
    } else {
      setSelectedSchedule(null);
    }
    setIsModalOpen(true);
  };

  // Submit Booking Form
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const demo = getDemoSession();
      const demoUser = getDemoUser();
      let userId: string | null = demoUser?.id ?? null;

      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) userId = user.id;
      }

      if (!userId && !demo) {
        toast.error("Silakan masuk terlebih dahulu untuk reservasi");
        router.push("/auth");
        return;
      }

      const activeSchedule = selectedSchedule || schedulesForSelectedDay[0];
      if (!activeSchedule) {
        toast.error("Silakan tentukan jadwal reservasi");
        return;
      }

      const available = activeSchedule.max_capacity - activeSchedule.current_bookings;
      if (participantCount > available) {
        toast.error(`Hanya tersisa ${available} slot pada sesi ini`);
        return;
      }

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          schedule_id: activeSchedule.id,
          group_name: groupName,
          participant_count: participantCount,
          phone,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        const fallbackBookingId = `demo-bk-${Date.now()}`;
        toast.success("Reservasi berhasil dibuat (Mode Demo)");
        setIsModalOpen(false);
        router.push(`/dashboard/pembayaran/${fallbackBookingId}`);
        return;
      }

      await supabase.rpc("increment_bookings", {
        schedule_id: activeSchedule.id,
        increment_by: participantCount,
      });

      toast.success("Reservasi berhasil dibuat!");
      setIsModalOpen(false);
      router.push(`/dashboard/pembayaran/${booking.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-bone flex flex-col relative overflow-hidden selection:bg-amber-brand selection:text-surface">
      {/* Ambient glow blobs matching homepage */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[700px] h-[700px] rounded-full bg-amber-brand opacity-[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] rounded-full bg-amber-brand opacity-[0.04] blur-[130px]" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-brand opacity-[0.025] blur-[90px]" />
      </div>

      {/* Top Desktop Navigation Bar */}
      <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-line">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-surface-elevated border border-line flex items-center justify-center text-bone-muted hover:text-bone hover:border-bone-muted/40 transition cursor-pointer"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-[0.2em] text-amber-brand uppercase font-semibold">
                  DinoyoCraft
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-brand animate-pulse" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-bone">
                Reservasi Kelas Keramik
              </h1>
            </div>
          </div>

          {/* Right Action & Tabs */}
          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="bg-surface-elevated p-1 rounded-xl flex gap-1 border border-line">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === "calendar"
                    ? "bg-amber-brand text-surface shadow-md"
                    : "text-bone-muted hover:text-bone"
                }`}
              >
                <CalendarDays size={15} />
                <span>Jadwal & Kalender</span>
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === "notes"
                    ? "bg-amber-brand text-surface shadow-md"
                    : "text-bone-muted hover:text-bone"
                }`}
              >
                <Info size={15} />
                <span>Panduan Kelas</span>
              </button>
            </div>

            <button
              onClick={() => handleOpenBooking()}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-brand hover:bg-amber-dark text-surface font-semibold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-brand/15"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Buat Reservasi</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-5 lg:px-8 py-6 sm:py-8">
        {activeTab === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT: Spacious Desktop Calendar (Col 8) */}
            <section className="lg:col-span-8 bg-surface-elevated border border-line rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
              {/* Calendar Controls & Month Picker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-surface-raised border border-line text-amber-brand shrink-0">
                    <CalendarIcon size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-wider text-amber-brand uppercase font-mono leading-none pb-1">
                      {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <p className="text-xs text-bone-muted mt-1">
                      Pilih tanggal untuk melihat ketersediaan slot bengkel keramik Dinoyo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToToday}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-raised border border-line text-xs font-semibold text-bone hover:border-bone-muted/40 transition cursor-pointer"
                  >
                    Hari Ini
                  </button>
                  <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl border border-line">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-lg hover:bg-surface-elevated text-bone-muted hover:text-bone transition cursor-pointer"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-lg hover:bg-surface-elevated text-bone-muted hover:text-bone transition cursor-pointer"
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold tracking-wider py-4 text-bone-muted uppercase font-mono">
                <div className="text-amber-brand">Minggu</div>
                <div>Senin</div>
                <div>Selasa</div>
                <div>Rabu</div>
                <div>Kamis</div>
                <div>Jumat</div>
                <div>Sabtu</div>
              </div>

              {/* Large Desktop Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
                {calendarDays.map((day, idx) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const isCurMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const daySchedules = schedulesByDate[dayStr] || [];
                  const hasSchedule = daySchedules.length > 0;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDate(day);
                        if (!isCurMonth) setCurrentMonth(day);
                      }}
                      className={`group min-h-[95px] sm:min-h-[110px] md:min-h-[120px] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer border relative overflow-hidden ${
                        isSelected
                          ? "bg-surface-raised border-amber-brand ring-2 ring-amber-brand/40 shadow-lg shadow-amber-brand/10"
                          : isCurMonth
                          ? hasSchedule
                            ? "bg-surface-raised/80 border-line hover:border-amber-brand/60 hover:bg-surface-raised"
                            : "bg-surface-raised/40 border-line/60 hover:border-line hover:bg-surface-raised/60"
                          : "bg-surface/40 border-transparent text-bone-muted/40 opacity-40 hover:opacity-80"
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition ${
                            isSelected
                              ? "bg-amber-brand text-surface font-bold shadow-md"
                              : isToday(day)
                              ? "bg-amber-brand/20 text-amber-brand border border-amber-brand/40 font-bold"
                              : "text-bone group-hover:text-amber-brand"
                          }`}
                        >
                          {format(day, "d")}
                        </span>

                        {/* Event count badge */}
                        {hasSchedule && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                              isSelected
                                ? "bg-amber-brand/20 text-amber-brand"
                                : "bg-surface text-amber-brand border border-amber-brand/20"
                            }`}
                          >
                            {daySchedules.length} sesi
                          </span>
                        )}
                      </div>

                      {/* Event Chips (Desktop preview) */}
                      <div className="space-y-1 my-1 flex-1 flex flex-col justify-end">
                        {hasSchedule ? (
                          daySchedules.slice(0, 2).map((sched, sIdx) => {
                            const avail = sched.max_capacity - sched.current_bookings;
                            return (
                              <div
                                key={sIdx}
                                className={`text-[10px] sm:text-[11px] truncate px-1.5 py-0.5 rounded font-medium transition flex items-center justify-between ${
                                  isSelected
                                    ? "bg-amber-brand/15 text-amber-brand"
                                    : "bg-surface-raised text-bone-muted group-hover:text-bone"
                                }`}
                                title={`${sched.title || "Kelas"} (${sched.start_time.slice(0, 5)} - ${sched.end_time.slice(0, 5)})`}
                              >
                                <span className="truncate">{sched.title || "Kelas"}</span>
                                <span className="text-[9px] font-mono opacity-70 ml-1 shrink-0">
                                  {avail} slot
                                </span>
                              </div>
                            );
                          })
                        ) : null}

                        {daySchedules.length > 2 && (
                          <div className="text-[10px] text-bone-muted/60 font-mono text-right">
                            +{daySchedules.length - 2} lainnya
                          </div>
                        )}
                      </div>

                      {/* Bottom indicator strip */}
                      {hasSchedule && (
                        <div
                          className={`h-0.5 w-full rounded-full transition ${
                            isSelected ? "bg-amber-brand" : "bg-amber-brand/40 group-hover:bg-amber-brand"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Calendar Footer Legend */}
              <div className="mt-6 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-4 text-xs text-bone-muted">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-brand inline-block" />
                    <span>Tanggal Terpilih</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md border border-amber-brand bg-surface-raised inline-block" />
                    <span>Ada Sesi Workshop</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-brand/20 border border-amber-brand/40 inline-block" />
                    <span>Hari Ini</span>
                  </div>
                </div>

                <span className="font-mono text-bone-muted/70">
                  Total {schedules.length} Sesi Terjadwal
                </span>
              </div>
            </section>

            {/* RIGHT: Detail Sidebar for Selected Date (Col 4) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              {/* Selected Day Overview Card */}
              <div className="bg-surface-elevated border border-line rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
                <div className="flex items-start justify-between pb-4 border-b border-line mb-5">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-brand font-bold">
                      JADWAL TANGGAL
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-bone capitalize mt-0.5">
                      {format(selectedDate, "EEEE, d MMMM yyyy", { locale: localeId })}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-surface-raised text-amber-brand text-xs font-mono font-bold border border-amber-brand/20">
                    {schedulesForSelectedDay.length} Sesi
                  </span>
                </div>

                {/* Sched List on Selected Date */}
                {schedulesForSelectedDay.length > 0 ? (
                  <div className="space-y-4">
                    {schedulesForSelectedDay.map((item, index) => {
                      const available = item.max_capacity - item.current_bookings;
                      const isFull = available <= 0 || item.is_locked;
                      const fillPercent = Math.min(100, Math.round((item.current_bookings / item.max_capacity) * 100));

                      return (
                        <div
                          key={item.id || index}
                          className="bg-surface-raised rounded-2xl p-4 border border-line hover:border-bone-muted/30 transition group flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-bone leading-snug">
                              {item.title || "Kelas Keramik Dinoyo"}
                            </h4>
                            {isFull ? (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40 shrink-0">
                                Penuh
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-brand/10 text-amber-brand border border-amber-brand/30 shrink-0">
                                Tersedia
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs text-bone-muted">
                            <div className="flex items-center gap-2">
                              <Clock size={13} className="text-amber-brand shrink-0" />
                              <span className="text-bone font-mono">
                                {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)} WIB
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin size={13} className="text-amber-brand shrink-0" />
                              <span className="text-bone-muted truncate">
                                {item.location || "Kampung Keramik Dinoyo"}
                              </span>
                            </div>

                            {/* Slot capacity bar */}
                            <div className="pt-2">
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-bone-muted flex items-center gap-1">
                                  <Users size={12} /> Kapasitas
                                </span>
                                <span className="font-semibold text-bone">
                                  {available} dari {item.max_capacity} slot tersisa
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isFull ? "bg-red-500" : "bg-amber-brand"
                                  }`}
                                  style={{ width: `${fillPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenBooking(item)}
                            disabled={isFull}
                            className="w-full mt-1 py-2.5 px-4 rounded-xl bg-amber-brand hover:bg-amber-dark disabled:opacity-40 text-surface font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-amber-brand/15"
                          >
                            <CalendarIcon size={14} />
                            {isFull ? "Slot Habis" : "Reservasi Sesi Ini"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 bg-surface-raised/40 rounded-2xl border border-dashed border-line">
                    <CalendarIcon className="w-10 h-10 text-bone-muted/40 mx-auto mb-2.5" />
                    <p className="text-bone text-sm font-semibold">
                      Belum Ada Jadwal di Tanggal Ini
                    </p>
                    <p className="text-bone-muted text-xs mt-1 mb-4">
                      Ingin mengadakan kelas untuk rombongan khusus di tanggal ini?
                    </p>
                    <button
                      onClick={() => handleOpenBooking()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-brand/15 border border-amber-brand/30 text-amber-brand text-xs font-bold hover:bg-amber-brand/25 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      Ajukan Jadwal Khusus
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Info Badge Card */}
              <div className="bg-surface-elevated border border-line rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-brand font-semibold text-xs uppercase tracking-wider font-mono">
                  <Flame size={15} />
                  <span>Keuntungan Kelas Dinoyo</span>
                </div>
                <ul className="text-xs text-bone-muted space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-brand shrink-0 mt-0.5" />
                    <span>Instruktur pengrajin lokal berpengalaman puluhan tahun.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-brand shrink-0 mt-0.5" />
                    <span>Sudah termasuk tanah liat, alat putar, dan pembakaran tungku kiln.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-brand shrink-0 mt-0.5" />
                    <span>Karya keramik buatanmu bisa dibawa pulang setelah matang.</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        ) : (
          /* PANDUAN & NOTES VIEW */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-surface-elevated border border-line rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-line mb-6">
                <div className="p-2.5 rounded-2xl bg-surface-raised border border-line text-amber-brand">
                  <Info size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-bone">
                    Panduan & Informasi Reservasi
                  </h2>
                  <p className="text-xs sm:text-sm text-bone-muted mt-0.5">
                    Hal penting yang perlu diketahui sebelum datang ke Kampung Keramik Dinoyo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-surface-raised rounded-2xl p-5 border border-line hover:border-bone-muted/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-brand/10 text-amber-brand border border-amber-brand/20 inline-block mb-3">
                        {note.category}
                      </span>
                      <h4 className="font-bold text-sm text-bone mb-2 leading-snug">
                        {note.title}
                      </h4>
                      <p className="text-xs text-bone-muted leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consultation banner */}
              <div className="p-5 rounded-2xl bg-amber-brand/10 border border-amber-brand/25 text-bone flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="shrink-0 text-amber-brand mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-bone">Butuh Jadwal Khusus Rombongan Sekolah / Kantor?</h4>
                    <p className="text-xs text-bone-muted mt-0.5">
                      Hubungi pengurus paguyuban keramik untuk kapasitas hingga 100 orang.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/bantuan"
                  className="px-5 py-2.5 rounded-xl bg-amber-brand text-surface font-bold text-xs hover:bg-amber-dark transition text-center shrink-0"
                >
                  Hubungi Admin
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile Friendly) */}
      <button
        onClick={() => handleOpenBooking()}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-amber-brand rounded-full flex items-center justify-center text-surface shadow-2xl shadow-amber-brand/40 hover:scale-105 active:scale-95 transition-all cursor-pointer z-40 border-2 border-surface"
        aria-label="Tambah Reservasi"
        title="Tambah Reservasi"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Modal Dialog for New Schedule Reservation (Desktop & Mobile) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-surface/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface-elevated rounded-3xl border border-line p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-brand font-bold">
                  KONFIRMASI BOOKING
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-bone">
                  Formulir Reservasi Kelas
                </h3>
                <p className="text-xs text-bone-muted flex items-center gap-1 mt-0.5">
                  <CalendarIcon size={12} className="text-amber-brand" />
                  {format(selectedDate, "EEEE, d MMMM yyyy", { locale: localeId })}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-surface-raised border border-line flex items-center justify-center text-bone-muted hover:text-bone hover:border-bone-muted/40 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              {/* Pilihan Sesi Jadwal */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-bone-muted mb-2">
                  Pilih Sesi Kelas Workshop
                </label>
                {schedulesForSelectedDay.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {schedulesForSelectedDay.map((s) => {
                      const isChosen = selectedSchedule?.id === s.id;
                      const available = s.max_capacity - s.current_bookings;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSchedule(s)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs ${
                            isChosen
                              ? "bg-amber-brand/15 border-amber-brand text-bone ring-1 ring-amber-brand"
                              : "bg-surface-raised border-line text-bone-muted hover:border-bone-muted/40"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-bone">{s.title || "Kelas Keramik Dinoyo"}</p>
                            <p className="font-mono text-[11px] text-bone-muted mt-0.5">
                              {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)} WIB • {s.location}
                            </p>
                          </div>
                          <span className="text-[11px] text-amber-brand font-bold shrink-0 ml-2">
                            {available} slot
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 bg-surface-raised rounded-2xl border border-line text-xs text-bone-muted">
                    Sesi khusus diajukan untuk tanggal ini. Jam default: 09:00 - 11:30 WIB.
                  </div>
                )}
              </div>

              {/* Input Nama Grup */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-bone-muted mb-1.5">
                  Nama Pemesan / Komunitas / Rombongan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rombongan Keluarga Budi / Sanggar Seni"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-raised border border-line text-sm text-bone focus:outline-none focus:border-amber-brand focus:ring-1 focus:ring-amber-brand/40 transition placeholder:text-bone-muted/30"
                />
              </div>

              {/* Grid Jumlah Peserta & No HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-bone-muted">
                      Jumlah Peserta
                    </label>
                    <span className="text-[11px] text-bone-muted font-mono">
                      Maks. {selectedSchedule ? selectedSchedule.max_capacity - selectedSchedule.current_bookings : 20}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={selectedSchedule ? selectedSchedule.max_capacity - selectedSchedule.current_bookings : 20}
                    required
                    value={participantCount}
                    onChange={(e) => setParticipantCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-raised border border-line text-sm text-bone focus:outline-none focus:border-amber-brand focus:ring-1 focus:ring-amber-brand/40 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-bone-muted mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-raised border border-line text-sm text-bone focus:outline-none focus:border-amber-brand focus:ring-1 focus:ring-amber-brand/40 transition font-mono placeholder:text-bone-muted/30"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-line text-xs font-semibold text-bone-muted hover:text-bone hover:border-bone-muted/40 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 rounded-xl bg-amber-brand hover:bg-amber-dark disabled:opacity-50 text-surface text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-brand/20"
                >
                  {formLoading ? (
                    <span>Memproses...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Lanjut Pembayaran</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
