"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { ChatCircle, PaperPlaneRight, UserCircle, Robot } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function AdminLiveChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(0);
  const [message, setMessage] = useState("");

  type ChatMessage = { role: "user" | "admin"; text: string };

  const [chats, setChats] = useState([
    { id: 1, name: "Budi Santoso", lastMsg: "Apakah bisa pesan suvenir custom 100 pcs?", time: "10:30", unread: 2, botHandled: true,
      messages: [
        { role: "user" as const, text: "Halo, saya ingin bertanya tentang pemesanan suvenir pernikahan." },
        { role: "admin" as const, text: "Halo Kak! Tentu bisa. Di DinoyoCraft, kami melayani pemesanan suvenir kustom untuk pernikahan. Apakah Kakak sudah ada referensi desain?" },
        { role: "user" as const, text: "Apakah bisa pesan suvenir custom 100 pcs?" },
      ]
    },
    { id: 2, name: "Siti Aminah", lastMsg: "Terima kasih infonya min", time: "09:15", unread: 0, botHandled: false,
      messages: [
        { role: "user" as const, text: "Min, berapa lama pengiriman ke Bandung?" },
        { role: "admin" as const, text: "Halo, selamat siang. Untuk Bandung estimasi 2-3 hari kerja menggunakan JNE Reguler." },
        { role: "user" as const, text: "Terima kasih infonya min" },
      ]
    },
    { id: 3, name: "Joko Anwar", lastMsg: "Lokasi tepatnya dimana ya?", time: "Kemarin", unread: 0, botHandled: true,
      messages: [
        { role: "user" as const, text: "Lokasi tepatnya dimana ya?" },
        { role: "admin" as const, text: "Kami berlokasi di Jl. Dinoyo, Kec. Lowokwaru, Kota Malang, Jawa Timur." },
      ]
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "admin") {
      router.push("/admin/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChats(prev => prev.map((chat, idx) => {
      if (idx !== activeChat) return chat;
      return {
        ...chat,
        lastMsg: message,
        messages: [...chat.messages, { role: "admin" as const, text: message }],
      };
    }));
    setMessage("");
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Live Chat Pengunjung</h1>
        <p className="text-zinc-500 text-sm">Balas pertanyaan pengunjung secara manual atau pantau respons AI Chatbot.</p>
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
          <div className="p-4 border-b border-zinc-200">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari percakapan..." 
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((chat, idx) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chats.findIndex(c => c.id === chat.id))}
                className={`p-4 border-b border-zinc-100 cursor-pointer transition-colors ${
                  activeChat === chats.findIndex(c => c.id === chat.id) ? "bg-zinc-100" : "hover:bg-zinc-100/50"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-zinc-900">{chat.name}</span>
                  <span className="text-xs text-zinc-400">{chat.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  {chat.botHandled && (
                    <span title="Dibalas oleh AI"><Robot size={14} className="text-clay" /></span>
                  )}
                  <p className="text-xs text-zinc-500 truncate flex-1">{chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <span className="bg-clay text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircle size={40} className="text-zinc-300" weight="fill" />
              <div>
                <h2 className="font-semibold text-zinc-900">{chats[activeChat].name}</h2>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Online
                </div>
              </div>
            </div>
            {chats[activeChat].botHandled && (
              <div className="px-3 py-1 bg-zinc-100 rounded-full flex items-center gap-2 text-xs font-medium text-zinc-600">
                <Robot size={16} className="text-clay" />
                AI Mode Aktif
              </div>
            )}
          </div>

          {/* Chat Messages — dynamic from state */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-zinc-50/30">
            {chats[activeChat].messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`p-3 rounded-2xl max-w-[75%] text-sm ${
                  msg.role === "user"
                    ? "bg-zinc-100 text-zinc-800 rounded-tl-sm"
                    : "bg-zinc-900 text-white rounded-tr-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-zinc-200">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik balasan Anda (mengambil alih dari AI)..." 
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
              />
              <button 
                type="submit"
                className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <PaperPlaneRight size={20} weight="fill" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
