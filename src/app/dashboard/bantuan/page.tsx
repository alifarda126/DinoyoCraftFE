"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PaperPlaneTilt, ArrowLeft, Phone, Envelope, Clock, ChatTeardropText, UserCircle, Robot } from "@phosphor-icons/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FAB from "@/components/FAB";

type Message = {
  id: string;
  sender_id: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
};

function getCsResponse(msg: string): string {
  const q = msg.toLowerCase();
  if (q.includes("jam") || q.includes("buka") || q.includes("operasional"))
    return "Kampung Keramik Dinoyo buka setiap Senin–Sabtu pukul 08.00–16.00 WIB. Hari Minggu dan libur nasional kami tutup. Untuk pemesanan di luar jam tersebut, tinggalkan pesan dan tim kami akan menghubungi pada hari kerja berikutnya.";
  if (q.includes("reservasi") || q.includes("booking") || q.includes("pesan kelas"))
    return "Untuk reservasi kelas keramik, buka halaman Reservasi Kelas di menu navigasi. Isi data rombongan, pilih tanggal & sesi, lalu pilih metode pembayaran. Kode booking otomatis dikirim ke email Anda.";
  if (q.includes("harga") || q.includes("biaya") || q.includes("tarif"))
    return "Kisaran tarif kami:\n\n• Kelas Dasar — Rp 75.000/orang\n• Kelas Lanjutan — Rp 120.000/orang\n• Suvenir Kustom — mulai Rp 50.000\n• Minimum rombongan: 5 orang\n\nSemua sudah termasuk bahan dan alat.";
  if (q.includes("lokasi") || q.includes("alamat") || q.includes("dimana") || q.includes("maps"))
    return "Kami berlokasi di:\nJl. Dinoyo, Kec. Lowokwaru\nKota Malang, Jawa Timur 65145\n\nGunakan fitur Peta Gang di menu untuk navigasi interaktif ke bengkel pengrajin.";
  if (q.includes("refund") || q.includes("batal") || q.includes("cancel") || q.includes("reschedule"))
    return "Kebijakan pembatalan:\n\n• Reschedule: hingga H-1\n• Batal H-3+: refund 100%\n• Batal H-2 s/d H-1: refund 50%\n• Batal hari H: tidak ada refund\n\nSertakan kode booking untuk proses pembatalan.";
  if (q.includes("kontak") || q.includes("telepon") || q.includes("email") || q.includes("wa") || q.includes("whatsapp"))
    return "Kontak kami:\n\nWhatsApp: +62 812-3456-7890\nEmail: cs@dinoyocraft.id\nJam layanan: Senin–Sabtu 08.00–16.00 WIB";
  if (q.includes("suvenir") || q.includes("kustom") || q.includes("souvenir") || q.includes("hadiah"))
    return "Suvenir kustom bisa dipesan di halaman Katalog & Kustom. Unggah referensi desain dan jumlah pesanan. Tim kami akan menghubungi dalam 1×24 jam. Minimum order 10 pcs untuk desain kustom.";
  if (q.includes("rombongan") || q.includes("grup") || q.includes("kelompok"))
    return "Kami melayani rombongan hingga 50 orang per sesi. Untuk >20 orang, disarankan booking minimal 2 minggu sebelumnya. Isi formulir reservasi dan pilih jumlah peserta yang sesuai.";
  return "Terima kasih sudah menghubungi CS DinoyoCraft! Tim kami akan menindaklanjuti segera. Untuk urusan mendesak, hubungi WhatsApp: +62 812-3456-7890 (Senin–Sabtu 08.00–16.00).";
}

const QUICK_REPLIES = [
  "Jam operasional?",
  "Harga kelas?",
  "Cara reservasi?",
  "Refund & batal?",
  "Lokasi & alamat?",
  "Kontak WhatsApp?",
];

export default function BantuanPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isChatbot, setIsChatbot] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [csTyping, setCsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const CHATBOT_GREETING: Message = {
    id: "greeting-bot",
    sender_id: "bot",
    message: "Halo! Saya CS DinoyoCraft. Tanyakan apa saja tentang kunjungan, reservasi, atau layanan kami. Saya siap membantu!",
    is_from_admin: true,
    created_at: new Date().toISOString(),
  };
  const LIVE_GREETING: Message = {
    id: "greeting-live",
    sender_id: "bot",
    message: "Anda terhubung dengan tim Customer Service DinoyoCraft. Kami biasanya membalas dalam 1–2 jam kerja. Silakan ceritakan pertanyaan atau kendala Anda.",
    is_from_admin: true,
    created_at: new Date().toISOString(),
  };

  useEffect(() => {
    fetch("/api/admin-id")
      .then((r) => r.json())
      .then((d) => { if (d.id) setAdminId(d.id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isChatbot) {
      setMessages([CHATBOT_GREETING]);
    } else {
      setMessages([LIVE_GREETING]);
      loadLiveMessages();
      const channel = supabase
        .channel("chat")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatbot]);

  async function loadLiveMessages() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    if (data) setMessages((prev) => [prev[0], ...data]);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, csTyping]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSend(e?: React.FormEvent, overrideText?: string) {
    e?.preventDefault();
    const text = (overrideText ?? input).trim();
    if (!text || csTyping) return;

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: "user",
      message: text,
      is_from_admin: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (isChatbot) {
      setCsTyping(true);
      setTimeout(() => {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender_id: "bot",
          message: getCsResponse(text),
          is_from_admin: true,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setCsTyping(false);
      }, 900 + Math.random() * 600);
    } else {
      if (!adminId) {
        setMessages((prev) => [...prev, {
          id: `sys-${Date.now()}`, sender_id: "bot",
          message: "Admin belum dikonfigurasi. Hubungi WhatsApp: +62 812-3456-7890.",
          is_from_admin: true, created_at: new Date().toISOString(),
        }]);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("chat_messages").insert({
        sender_id: user.id,
        recipient_id: adminId,
        message: text,
        is_from_admin: false,
      });
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface)", color: "var(--bark)", fontFamily: "var(--font-outfit), sans-serif", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: "1100px", margin: "0 auto", width: "100%", padding: "2.5rem 1.25rem 4rem", display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "start" }} className="bantuan-grid">

        {/* ── Left sidebar ──────────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link
            href="/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--bark-muted)", fontSize: "0.875rem", textDecoration: "none", marginBottom: "0.25rem", transition: "color 0.18s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--clay)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--bark-muted)")}
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>

          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--clay)", marginBottom: "0.3rem" }}>
              Pusat Bantuan
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--bark)", lineHeight: 1.15 }}>
              Customer Service
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: "0.875rem", color: "var(--bark-muted)", lineHeight: 1.6 }}>
              Kami siap membantu pertanyaan seputar kunjungan, reservasi, dan layanan DinoyoCraft.
            </p>
          </div>

          {/* Mode switcher */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { key: true, icon: Robot, title: "CS Otomatis", sub: "Jawaban instan · 24 jam" },
              { key: false, icon: UserCircle, title: "Live Chat Admin", sub: "Senin–Sabtu 08.00–16.00" },
            ].map(({ key, icon: Icon, title, sub }) => {
              const active = isChatbot === key;
              return (
                <button
                  key={String(key)}
                  onClick={() => setIsChatbot(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.875rem 1rem", borderRadius: "0.875rem",
                    border: `1.5px solid ${active ? "var(--clay)" : "var(--line-strong)"}`,
                    background: active ? "var(--clay-muted)" : "#fff",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.18s", fontFamily: "var(--font-outfit), sans-serif",
                  }}
                >
                  <Icon size={20} style={{ color: active ? "var(--clay)" : "var(--bark-muted)", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.85rem", color: active ? "var(--clay-dark)" : "var(--bark)" }}>{title}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", marginTop: "0.1rem" }}>{sub}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contact card */}
          <div style={{ padding: "1.125rem", borderRadius: "0.875rem", border: "1.5px solid var(--line)", background: "var(--surface-elevated)" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--bark-muted)", marginBottom: "0.75rem" }}>
              Kontak Langsung
            </p>
            {[
              { icon: Phone, label: "+62 812-3456-7890", sub: "WhatsApp tersedia" },
              { icon: Envelope, label: "cs@dinoyocraft.id", sub: "Respons ≤24 jam" },
              { icon: Clock, label: "Senin–Sabtu", sub: "08.00–16.00 WIB" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", marginBottom: "0.7rem" }}>
                <Icon size={14} style={{ color: "var(--clay)", flexShrink: 0, marginTop: "0.2rem" }} />
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)" }}>{label}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--bark-muted)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Chat panel ──────────────────────────────────────────── */}
        <div style={{
          background: "#fff", border: "1.5px solid var(--line)",
          borderRadius: "1.25rem", display: "flex", flexDirection: "column",
          overflow: "hidden", minHeight: "600px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "1.125rem 1.5rem", borderBottom: "1px solid var(--line)",
            background: "var(--surface-elevated)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 38, height: 38, borderRadius: "9999px",
              background: "var(--clay-muted)", flexShrink: 0,
            }}>
              {isChatbot
                ? <Robot size={19} style={{ color: "var(--clay)" }} />
                : <ChatTeardropText size={19} style={{ color: "var(--clay)" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--bark)" }}>
                  {isChatbot ? "CS Otomatis" : "Live Chat Admin"}
                </p>
                <span style={{ width: 7, height: 7, borderRadius: "9999px", background: "#22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,0.2)" }} />
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", marginTop: "0.1rem" }}>
                {isChatbot ? "Jawaban instan · Tersedia 24 jam" : "Tim CS DinoyoCraft · Jam kerja 08.00–16.00"}
              </p>
            </div>
          </div>

          {/* Quick chips */}
          {isChatbot && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--line)", background: "rgba(248,250,252,0.7)" }}>
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(undefined, q)}
                  style={{
                    padding: "0.3rem 0.75rem", borderRadius: "9999px",
                    border: "1.5px solid var(--line-strong)", background: "#fff",
                    color: "var(--bark-muted)", fontSize: "0.72rem", fontWeight: 500,
                    cursor: "pointer", transition: "all 0.15s",
                    fontFamily: "var(--font-outfit), sans-serif", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--clay)";
                    (e.currentTarget as HTMLElement).style.color = "var(--clay)";
                    (e.currentTarget as HTMLElement).style.background = "var(--clay-muted)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                    (e.currentTarget as HTMLElement).style.color = "var(--bark-muted)";
                    (e.currentTarget as HTMLElement).style.background = "#fff";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem", scrollbarWidth: "thin" }}>
            {messages.map((msg) => {
              const isCs = msg.is_from_admin || msg.sender_id === "bot";
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isCs ? "flex-start" : "flex-end" }}>
                  <div style={{
                    maxWidth: "75%", padding: "0.7rem 1rem",
                    borderRadius: isCs ? "1rem 1rem 1rem 0.25rem" : "1rem 1rem 0.25rem 1rem",
                    background: isCs ? "var(--surface-elevated)" : "var(--clay)",
                    color: isCs ? "var(--bark)" : "#fff",
                    fontSize: "0.875rem", lineHeight: 1.65, whiteSpace: "pre-line",
                    border: isCs ? "1px solid var(--line)" : "none",
                  }}>
                    {msg.message}
                  </div>
                </div>
              );
            })}

            {csTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "0.7rem 1rem", borderRadius: "1rem 1rem 1rem 0.25rem", background: "var(--surface-elevated)", border: "1px solid var(--line)", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{ width: 6, height: 6, borderRadius: "9999px", background: "var(--bark-muted)", display: "inline-block", animation: `typing-dot 1.2s ease-in-out ${d * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--line)", background: "#fff" }}>
            <form onSubmit={handleSend} style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <input
                ref={inputRef}
                id="bantuan-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isChatbot ? "Tanyakan sesuatu..." : "Ketik pesan ke admin..."}
                disabled={csTyping}
                style={{
                  flex: 1, padding: "0.65rem 1rem", borderRadius: "9999px",
                  border: "1.5px solid var(--line-strong)", background: "var(--surface-elevated)",
                  color: "var(--bark)", fontSize: "0.875rem", outline: "none",
                  transition: "border-color 0.18s", fontFamily: "var(--font-outfit), sans-serif",
                }}
                onFocus={(e) => ((e.target as HTMLElement).style.borderColor = "var(--clay)")}
                onBlur={(e) => ((e.target as HTMLElement).style.borderColor = "var(--line-strong)")}
              />
              <button
                id="bantuan-send-btn"
                type="submit"
                disabled={!input.trim() || csTyping}
                aria-label="Kirim pesan"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 42, height: 42, flexShrink: 0,
                  borderRadius: "9999px", border: "none",
                  background: input.trim() && !csTyping ? "var(--clay)" : "var(--surface-elevated)",
                  color: input.trim() && !csTyping ? "#fff" : "var(--bark-muted)",
                  cursor: input.trim() && !csTyping ? "pointer" : "not-allowed",
                  transition: "background 0.18s, color 0.18s",
                }}
              >
                <PaperPlaneTilt size={18} weight="fill" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <FAB />

      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @media (max-width: 768px) {
          .bantuan-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
