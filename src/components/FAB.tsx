"use client";

import { useState, useRef, useEffect } from "react";
import { ChatTeardropDots, X, PaperPlaneTilt } from "@phosphor-icons/react";

type Message = { role: "user" | "ai"; text: string };

const GREETING: Message = {
  role: "ai",
  text: "Halo! Saya AI Asisten DinoyoCraft. Saya bisa bantu info jadwal kelas, jenis kerajinan, atau panduan berkunjung ke Kampung Keramik Dinoyo. Ada yang bisa saya bantu?",
};

/* ─── Simulasi AI reply sederhana ───────────────────────────────────── */
function getDemoReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("jadwal") || q.includes("kelas"))
    return "Kelas keramik tersedia Senin–Sabtu, pukul 09.00–15.00 WIB. Untuk reservasi rombongan, silakan buka halaman Reservasi Kelas.";
  if (q.includes("harga") || q.includes("biaya") || q.includes("tarif"))
    return "Biaya kelas mulai dari Rp75.000/orang untuk sesi dasar. Suvenir kustom dihitung berdasarkan desain dan jumlah. Cek Katalog untuk detail lengkap.";
  if (q.includes("alamat") || q.includes("lokasi") || q.includes("peta") || q.includes("gang"))
    return "Kampung Keramik Dinoyo berada di Jl. Dinoyo, Kec. Lowokwaru, Kota Malang. Buka halaman Peta Gang untuk navigasi interaktif.";
  if (q.includes("booking") || q.includes("pesan") || q.includes("reservasi"))
    return "Untuk memesan, buka halaman Reservasi Kelas, pilih jadwal tersedia, isi data rombongan, lalu pilih metode pembayaran. Kode booking dikirim via email.";
  if (q.includes("suvenir") || q.includes("kustom") || q.includes("custom") || q.includes("hadiah"))
    return "Suvenir kustom bisa dipesan melalui halaman Katalog & Kustom. Kirimkan referensi desain dan kami akan terhubung dengan pengrajin yang sesuai.";
  return "Terima kasih pertanyaannya! Untuk info lebih detail, silakan hubungi tim CS kami melalui halaman Bantuan, atau langsung datang ke gang keramik Dinoyo.";
}

export default function FAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Scroll to bottom on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* Focus input when chat opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || typing) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setDraft("");
    setTyping(true);

    /* Simulate typing delay */
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: getDemoReply(text) },
      ]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.75rem",
        right: "1.75rem",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "0.75rem",
      }}
    >
      {/* ── Chat popup ──────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="AI Asisten DinoyoCraft"
          style={{
            width: "min(360px, calc(100vw - 2.5rem))",
            borderRadius: "1.25rem",
            background: "#fff",
            border: "1.5px solid var(--line-strong)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "var(--font-outfit), sans-serif",
            /* Slide-up entrance */
            animation: "fab-popup-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--line)",
              background: "var(--surface-elevated)",
            }}
          >
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--bark)", letterSpacing: "-0.01em" }}>
                AI Asisten
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", marginTop: "0.1rem" }}>
                Jadwal · Kerajinan · Panduan Kunjungan
              </p>
            </div>
            <button
              aria-label="Tutup chat"
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32,
                borderRadius: "9999px",
                border: "none",
                background: "transparent",
                color: "var(--bark-muted)",
                cursor: "pointer",
                transition: "background 0.18s, color 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLElement).style.color = "var(--bark)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--bark-muted)";
              }}
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              height: 280,
              overflowY: "auto",
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              scrollbarWidth: "thin",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "0.6rem 0.875rem",
                    borderRadius: msg.role === "user"
                      ? "1rem 1rem 0.25rem 1rem"
                      : "1rem 1rem 1rem 0.25rem",
                    background: msg.role === "user" ? "var(--clay)" : "var(--surface-elevated)",
                    color: msg.role === "user" ? "#fff" : "var(--bark)",
                    fontSize: "0.82rem",
                    lineHeight: 1.55,
                    fontWeight: 400,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "0.6rem 0.875rem",
                    borderRadius: "1rem 1rem 1rem 0.25rem",
                    background: "var(--surface-elevated)",
                    display: "flex", gap: "0.3rem", alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      style={{
                        width: 6, height: 6,
                        borderRadius: "9999px",
                        background: "var(--bark-muted)",
                        animation: `typing-dot 1.2s ease-in-out ${d * 0.2}s infinite`,
                        display: "inline-block",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0.875rem 1rem",
              borderTop: "1px solid var(--line)",
              background: "#fff",
            }}
          >
            <input
              ref={inputRef}
              id="ai-chat-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ketik pesan..."
              disabled={typing}
              style={{
                flex: 1,
                padding: "0.55rem 0.875rem",
                borderRadius: "9999px",
                border: "1.5px solid var(--line-strong)",
                background: "var(--surface-elevated)",
                color: "var(--bark)",
                fontSize: "0.82rem",
                outline: "none",
                transition: "border-color 0.18s",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = "var(--clay)")}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = "var(--line-strong)")}
            />
            <button
              id="ai-chat-send-btn"
              type="submit"
              disabled={!draft.trim() || typing}
              aria-label="Kirim pesan"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, flexShrink: 0,
                borderRadius: "9999px",
                background: draft.trim() && !typing ? "var(--clay)" : "var(--surface-elevated)",
                color: draft.trim() && !typing ? "#fff" : "var(--bark-muted)",
                border: "none", cursor: draft.trim() && !typing ? "pointer" : "not-allowed",
                transition: "background 0.18s, color 0.18s",
              }}
            >
              <PaperPlaneTilt size={16} weight="fill" />
            </button>
          </form>
        </div>
      )}

      {/* ── FAB Button ──────────────────────────────────────────────── */}
      <button
        id="fab-ai-chat-btn"
        aria-label={open ? "Tutup AI Asisten" : "Buka AI Asisten"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fab-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "9999px",
          background: "var(--clay)",
          color: "#fff",
          border: "2.5px solid rgba(255,255,255,0.3)",
          boxShadow: "0 6px 24px rgba(184,92,60,0.38), 0 2px 8px rgba(0,0,0,0.10)",
          cursor: "pointer",
          transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--clay-dark)";
          (e.currentTarget as HTMLElement).style.transform = "scale(1.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = open ? "var(--clay-dark)" : "var(--clay)";
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        }}
      >
        {open
          ? <X size={22} weight="bold" aria-hidden />
          : <ChatTeardropDots weight="fill" size={24} aria-hidden />}
      </button>

      <style>{`
        @keyframes fab-popup-in {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
