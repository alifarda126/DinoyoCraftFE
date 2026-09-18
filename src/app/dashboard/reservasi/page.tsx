"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  CreditCard,
  Bank,
  Wallet,
  QrCode,
  ArrowRight,
  SealCheck,
} from "@phosphor-icons/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FAB from "@/components/FAB";

type Schedule = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  is_locked: boolean;
};

const paymentMethods = [
  { id: "transfer", icon: Bank, label: "Transfer Bank", desc: "BCA · BNI · Mandiri · BRI" },
  { id: "ewallet", icon: Wallet, label: "E-Wallet", desc: "GoPay · OVO · DANA · ShopeePay" },
  { id: "qris", icon: QrCode, label: "QRIS", desc: "Scan QR — semua e-wallet & bank" },
];

export default function ReservasiPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [groupName, setGroupName] = useState("");
  const [participantCount, setParticipantCount] = useState(1);
  const [phone, setPhone] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const loadSchedules = async () => {
    // Mock schedules
    const today = new Date();
    const mock: Schedule[] = [
      {
        id: "1",
        date: format(today, "yyyy-MM-dd"),
        start_time: "09:00",
        end_time: "11:00",
        max_capacity: 20,
        current_bookings: 5,
        is_locked: false,
      },
      {
        id: "2",
        date: format(today, "yyyy-MM-dd"),
        start_time: "13:00",
        end_time: "15:00",
        max_capacity: 20,
        current_bookings: 20, // Full
        is_locked: false,
      }
    ];
    setSchedules(mock);
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    setLoading(true);
    try {
      const available = selectedSchedule.max_capacity - selectedSchedule.current_bookings;
      if (participantCount > available) {
        throw new Error(`Hanya tersisa ${available} slot`);
      }

      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Reservasi berhasil dibuat (Mock)");
      router.push(`/dashboard/pembayaran/mock-booking-id`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = selectedSchedule
    ? selectedSchedule.max_capacity - selectedSchedule.current_bookings
    : 0;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface)", color: "var(--bark)" }}>
      <Navbar />

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.25rem 5rem" }}>
        {/* Page header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--bark-muted)",
              fontSize: "0.875rem",
              textDecoration: "none",
              marginBottom: "1rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--clay)")}
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--bark-muted)")
            }
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "var(--bark)",
              fontFamily: "var(--font-outfit), sans-serif",
              letterSpacing: "-0.025em",
            }}
          >
            Reservasi Kelas Keramik
          </h1>
          <p style={{ marginTop: "0.4rem", color: "var(--bark-muted)", fontSize: "0.95rem" }}>
            Pilih jadwal yang tersedia lalu isi data rombonganmu.
          </p>
        </div>

        {/* ── STEP 1: Schedule picker ─────────────────────────────────────── */}
        {!selectedSchedule ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "1.25rem",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: "9999px",
                  background: "var(--clay)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                1
              </span>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--bark)",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                Pilih Jadwal Tersedia
              </h2>
            </div>

            {schedules.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: "#fff",
                  borderRadius: "1.25rem",
                  border: "1.5px solid var(--line)",
                  color: "var(--bark-muted)",
                }}
              >
                <Calendar size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.35 }} />
                <p style={{ fontWeight: 600, color: "var(--bark)", marginBottom: "0.35rem" }}>
                  Belum ada jadwal tersedia
                </p>
                <p style={{ fontSize: "0.875rem" }}>Silakan cek kembali nanti.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {schedules.map((schedule) => {
                const available = schedule.max_capacity - schedule.current_bookings;
                const isFull = available <= 0 || schedule.is_locked;
                const pct = Math.round((schedule.current_bookings / schedule.max_capacity) * 100);

                return (
                  <button
                    key={schedule.id}
                    id={`schedule-${schedule.id}`}
                    onClick={() => !isFull && setSelectedSchedule(schedule)}
                    disabled={isFull}
                    style={{
                      width: "100%",
                      background: "#fff",
                      border: `1.5px solid ${isFull ? "var(--line)" : "var(--line-strong)"}`,
                      borderRadius: "1rem",
                      padding: "1.25rem 1.5rem",
                      textAlign: "left",
                      cursor: isFull ? "not-allowed" : "pointer",
                      opacity: isFull ? 0.55 : 1,
                      transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isFull) {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--clay)";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 4px 16px rgba(184,92,60,0.12)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "var(--bark)",
                          }}
                        >
                          <Calendar size={16} style={{ color: "var(--clay)", flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                            {format(new Date(schedule.date), "EEEE, d MMMM yyyy", { locale: id })}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "var(--bark-muted)",
                            fontSize: "0.875rem",
                          }}
                        >
                          <Clock size={14} />
                          <span>{schedule.start_time} – {schedule.end_time} WIB</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "var(--bark-muted)",
                            fontSize: "0.875rem",
                          }}
                        >
                          <Users size={14} />
                          <span>
                            {available} dari {schedule.max_capacity} slot tersisa
                          </span>
                        </div>
                      </div>

                      {isFull ? (
                        <span
                          style={{
                            padding: "0.25rem 0.7rem",
                            borderRadius: "9999px",
                            background: "#FEE2E2",
                            color: "#B91C1C",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          Penuh
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "0.25rem 0.7rem",
                            borderRadius: "9999px",
                            background: "var(--clay-muted)",
                            color: "var(--clay-dark)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          Tersedia
                        </span>
                      )}
                    </div>

                    {/* Capacity bar */}
                    <div
                      style={{
                        marginTop: "0.875rem",
                        height: 4,
                        borderRadius: "9999px",
                        background: "var(--surface-elevated)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: "9999px",
                          background: pct >= 80 ? "#EF4444" : "var(--clay)",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── STEP 2: Booking form ──────────────────────────────────────── */
          <form onSubmit={handleSubmit}>
            {/* Selected schedule chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1.25rem",
                borderRadius: "0.875rem",
                background: "var(--clay-muted)",
                border: "1.5px solid rgba(184,92,60,0.2)",
                marginBottom: "1.75rem",
              }}
            >
              <SealCheck size={22} weight="fill" style={{ color: "var(--clay)", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--clay-dark)", fontWeight: 600 }}>
                  Jadwal dipilih
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--bark)", fontWeight: 700 }}>
                  {format(new Date(selectedSchedule.date), "EEEE, d MMMM yyyy", { locale: id })} ·{" "}
                  {selectedSchedule.start_time} – {selectedSchedule.end_time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
                style={{
                  marginLeft: "auto",
                  fontSize: "0.75rem",
                  color: "var(--clay)",
                  fontWeight: 700,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Ganti
              </button>
            </div>

            {/* Step label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "1.25rem",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: "9999px",
                  background: "var(--clay)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                2
              </span>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--bark)",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                Data Rombongan
              </h2>
            </div>

            {/* Form card */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid var(--line)",
                borderRadius: "1.25rem",
                padding: "1.75rem",
                marginBottom: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
              }}
            >
              {/* Nama perwakilan */}
              <div>
                <label
                  htmlFor="res-group-name"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--bark)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Nama Perwakilan / Grup <span style={{ color: "var(--clay)" }}>*</span>
                </label>
                <input
                  id="res-group-name"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: Rombongan SMPN 3 Malang"
                  className="input-earthy"
                  required
                />
              </div>

              {/* Jumlah peserta */}
              <div>
                <label
                  htmlFor="res-participant-count"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--bark)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Jumlah Peserta <span style={{ color: "var(--clay)" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <input
                    id="res-participant-count"
                    type="number"
                    min="1"
                    max={availableSlots}
                    value={participantCount}
                    onChange={(e) => setParticipantCount(parseInt(e.target.value))}
                    className="input-earthy"
                    style={{ maxWidth: "9rem" }}
                    required
                  />
                  <span style={{ fontSize: "0.85rem", color: "var(--bark-muted)" }}>
                    orang (maks. {availableSlots} slot tersisa)
                  </span>
                </div>
              </div>

              {/* Nomor telepon */}
              <div>
                <label
                  htmlFor="res-phone"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--bark)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Nomor Telepon / WhatsApp <span style={{ color: "var(--clay)" }}>*</span>
                </label>
                <input
                  id="res-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="input-earthy"
                  required
                />
              </div>
            </div>

            {/* ── Payment method UI ──────────────────────────────────────── */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid var(--line)",
                borderRadius: "1.25rem",
                padding: "1.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.1rem",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: "9999px",
                    background: "var(--clay)",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  3
                </span>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--bark)",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                >
                  Metode Pembayaran
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {paymentMethods.map(({ id: pmId, icon: Icon, label, desc }) => (
                  <button
                    key={pmId}
                    id={`res-payment-${pmId}`}
                    type="button"
                    aria-pressed={selectedPayment === pmId}
                    onClick={() => setSelectedPayment(pmId)}
                    className={`payment-option${selectedPayment === pmId ? " selected" : ""}`}
                  >
                    <span className={`payment-radio${selectedPayment === pmId ? " selected" : ""}`} />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "0.75rem",
                        background: "var(--clay-muted)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} style={{ color: "var(--clay)" }} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "var(--bark)",
                          lineHeight: 1.2,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--bark-muted)",
                          marginTop: 3,
                        }}
                      >
                        {desc}
                      </p>
                    </div>
                    {selectedPayment === pmId && (
                      <CheckCircle
                        size={22}
                        weight="fill"
                        style={{ color: "var(--clay)", marginLeft: "auto" }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>

              <p
                style={{
                  marginTop: "0.875rem",
                  fontSize: "0.78rem",
                  color: "var(--bark-muted)",
                  lineHeight: 1.55,
                }}
              >
                Instruksi pembayaran lengkap akan dikirim ke email setelah reservasi dikonfirmasi.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  borderRadius: "0.875rem",
                  border: "1.5px solid var(--line-strong)",
                  background: "transparent",
                  color: "var(--bark)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "var(--surface-elevated)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                Kembali
              </button>
              <button
                id="reservasi-submit-btn"
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.875rem",
                  borderRadius: "0.875rem",
                  background: loading ? "var(--clay-light)" : "var(--clay)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  border: "none",
                  transition: "background 0.2s, transform 0.15s",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(184,92,60,0.22)",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "9999px",
                        animation: "spin 0.75s linear infinite",
                      }}
                    />
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjut Pembayaran
                    <ArrowRight size={16} weight="bold" />
                  </>
                )}
              </button>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>
        )}
      </main>

      <FAB />
    </div>
  );
}
