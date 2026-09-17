"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PaperPlaneTilt, Robot, UserCircle } from "@phosphor-icons/react";
import Link from "next/link";

type Message = {
  id: string;
  sender_id: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
};

export default function BantuanPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isChatbot, setIsChatbot] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch the admin's UUID on mount (needed for live chat recipient_id)
  useEffect(() => {
    fetch("/api/admin-id")
      .then((r) => r.json())
      .then((d) => { if (d.id) setAdminId(d.id); })
      .catch(() => {/* admin not configured yet */});
  }, []);

  const loadMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  useEffect(() => {
    if (!isChatbot) {
      loadMessages();
      const channel = supabase
        .channel("chat")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } else {
      // Clear live chat messages when switching to chatbot mode
      setMessages([]);
    }
  }, [isChatbot]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const messageText = input;
    setInput("");

    if (isChatbot) {
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        sender_id: "user",
        message: messageText,
        is_from_admin: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);

      // Simulate slight delay for chatbot response
      setTimeout(() => {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender_id: "bot",
          message: getChatbotResponse(messageText),
          is_from_admin: true,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 600);
    } else {
      if (!adminId) {
        // No admin configured yet – show helpful message
        const fallbackMsg: Message = {
          id: `sys-${Date.now()}`,
          sender_id: "bot",
          message: "Admin belum dikonfigurasi. Silakan hubungi kami melalui telepon atau email.",
          is_from_admin: true,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("chat_messages").insert({
        sender_id: user.id,
        recipient_id: adminId,  // Now uses proper UUID instead of string "admin"
        message: messageText,
        is_from_admin: false,
      });
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function getChatbotResponse(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes("jadwal") || lower.includes("buka")) {
      return "Kelas keramik buka setiap hari Sabtu dan Minggu, pukul 09:00 - 17:00. Silakan cek jadwal tersedia di menu Reservasi.";
    }
    if (lower.includes("harga") || lower.includes("biaya") || lower.includes("tarif")) {
      return "Harga kelas keramik Rp 50.000 per orang, sudah termasuk bahan dan peralatan.";
    }
    if (lower.includes("lokasi") || lower.includes("alamat") || lower.includes("mana")) {
      return "Kampung Keramik Dinoyo berada di Jl. Dinoyo, Kec. Lowokwaru, Kota Malang. Anda bisa menggunakan fitur Peta Gang untuk navigasi.";
    }
    if (lower.includes("kustom") || lower.includes("pesanan") || lower.includes("suvenir")) {
      return "Untuk pesanan kustom, silakan pilih karya di Katalog lalu klik 'Ajukan Pesanan Kustom'. Pengrajin akan menghubungi Anda.";
    }
    if (lower.includes("bayar") || lower.includes("payment") || lower.includes("transfer")) {
      return "Kami menerima pembayaran via Virtual Account (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, Dana), dan QRIS.";
    }
    if (lower.includes("batal") || lower.includes("cancel")) {
      return "Untuk pembatalan reservasi, silakan hubungi admin melalui Live Chat atau telepon langsung ke pengelola kampung keramik.";
    }
    if (lower.includes("rombongan") || lower.includes("grup") || lower.includes("kelompok")) {
      return "Kami melayani rombongan! Cukup masukkan jumlah peserta saat reservasi. Untuk rombongan besar (>20 orang), disarankan memesan jauh-jauh hari.";
    }
    return "Terima kasih atas pertanyaan Anda. Untuk pertanyaan spesifik, silakan gunakan Live Chat dengan Admin.";
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <span>←</span>
          </Link>
          <h1 className="text-xl font-semibold">Bantuan</h1>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => { setIsChatbot(true); setMessages([]); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                isChatbot
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              <Robot className="w-4 h-4" />
              Chatbot
            </button>
            <button
              onClick={() => { setIsChatbot(false); setMessages([]); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                !isChatbot
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              <UserCircle className="w-4 h-4" />
              Live Chat
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400 text-sm">
            <div className="text-center space-y-2">
              {isChatbot ? (
                <>
                  <Robot className="w-10 h-10 mx-auto text-zinc-400" />
                  <p className="font-medium">Tanyakan apa saja tentang DinoyoCraft</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {["Jadwal kelas?", "Harga per orang?", "Lokasi?", "Pesanan kustom?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <UserCircle className="w-10 h-10 mx-auto text-zinc-400" />
                  <p className="font-medium">Hubungi admin untuk bantuan spesifik</p>
                  <p className="text-xs">Admin biasanya membalas dalam 1–2 jam kerja</p>
                </>
              )}
            </div>
          </div>
        )}
        <div className="space-y-3 pb-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.is_from_admin || msg.sender_id === "bot"
                  ? "justify-start"
                  : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  msg.is_from_admin || msg.sender_id === "bot"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </main>

      <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isChatbot ? "Tanyakan sesuatu..." : "Ketik pesan..."}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
          <button
            type="submit"
            className="p-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <PaperPlaneTilt className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}