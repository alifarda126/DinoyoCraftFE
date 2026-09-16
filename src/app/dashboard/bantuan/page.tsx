"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PaperPlaneTilt } from "@phosphor-icons/react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
    }
  }, [isChatbot]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const messageText = input;
    setInput("");

    if (isChatbot) {
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          sender_id: "user",
          message: messageText,
          is_from_admin: false,
          created_at: new Date().toISOString(),
        },
      ]);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender_id: "bot",
          message: getChatbotResponse(messageText),
          is_from_admin: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("chat_messages").insert({
        sender_id: user.id,
        recipient_id: "admin",
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
              onClick={() => setIsChatbot(true)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                isChatbot
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              Chatbot
            </button>
            <button
              onClick={() => setIsChatbot(false)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                !isChatbot
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              Live Chat
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400 text-sm">
            {isChatbot
              ? "Tanyakan apa saja tentang DinoyoCraft"
              : "Hubungi admin untuk bantuan spesifik"}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
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