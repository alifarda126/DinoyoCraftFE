"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { PaperPlaneRight, UserCircle, Robot, Storefront, ChatCircle } from "@phosphor-icons/react";

type ChatMessage = { role: "user" | "admin"; text: string; time?: string };
type ChatContact = {
  id: number; name: string; lastMsg: string; time: string; unread: number; botHandled: boolean;
  type: "customer" | "mitra";
  messages: ChatMessage[];
};

const INITIAL_CHATS: ChatContact[] = [
  // Customer chats
  {
    id: 1, name: "Budi Santoso", lastMsg: "Apakah bisa pesan suvenir custom 100 pcs?", time: "10:30",
    unread: 2, botHandled: true, type: "customer",
    messages: [
      { role: "user", text: "Halo, saya ingin bertanya tentang pemesanan suvenir pernikahan.", time: "10:25" },
      { role: "admin", text: "Halo Kak! Tentu bisa. Di DinoyoCraft, kami melayani pemesanan suvenir kustom untuk pernikahan. Apakah Kakak sudah ada referensi desain?", time: "10:27" },
      { role: "user", text: "Apakah bisa pesan suvenir custom 100 pcs?", time: "10:30" },
    ]
  },
  {
    id: 2, name: "Siti Aminah", lastMsg: "Terima kasih infonya min", time: "09:15",
    unread: 0, botHandled: false, type: "customer",
    messages: [
      { role: "user", text: "Min, berapa lama pengiriman ke Bandung?", time: "09:10" },
      { role: "admin", text: "Halo, selamat siang. Untuk Bandung estimasi 2-3 hari kerja menggunakan JNE Reguler.", time: "09:12" },
      { role: "user", text: "Terima kasih infonya min", time: "09:15" },
    ]
  },
  {
    id: 3, name: "Joko Anwar", lastMsg: "Lokasi tepatnya dimana ya?", time: "Kemarin",
    unread: 0, botHandled: true, type: "customer",
    messages: [
      { role: "user", text: "Lokasi tepatnya dimana ya?", time: "Kemarin" },
      { role: "admin", text: "Kami berlokasi di Jl. Dinoyo, Kec. Lowokwaru, Kota Malang, Jawa Timur.", time: "Kemarin" },
    ]
  },
  // Mitra chats
  {
    id: 4, name: "Ratna Puspitasari", lastMsg: "Katalog terbaru sudah bisa diakses?", time: "11:05",
    unread: 1, botHandled: false, type: "mitra",
    messages: [
      { role: "user", text: "Halo admin, katalog terbaru sudah bisa diakses belum ya?", time: "11:05" },
    ]
  },
  {
    id: 5, name: "Bagas Anindito", lastMsg: "Terima kasih sudah dibantu!", time: "08:40",
    unread: 0, botHandled: false, type: "mitra",
    messages: [
      { role: "user", text: "Admin, ada kendala di pengiriman ORD-20231022-003, kurir tidak mau menjemput.", time: "08:30" },
      { role: "admin", text: "Halo Kak Bagas, kami bantu koordinasikan dengan kurir. Mohon tunggu sebentar.", time: "08:35" },
      { role: "user", text: "Terima kasih sudah dibantu!", time: "08:40" },
    ]
  },
];

export default function AdminLiveChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"customer" | "mitra">("customer");
  const [activeChat, setActiveChat] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<ChatContact[]>(INITIAL_CHATS);
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
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setChats(prev => prev.map(chat => {
      if (chat.id !== activeChat) return chat;
      return {
        ...chat,
        lastMsg: message,
        messages: [...chat.messages, { role: "admin" as const, text: message, time }],
      };
    }));
    setMessage("");
  };

  // When switching tab, auto select first in that tab
  const handleTabSwitch = (tab: "customer" | "mitra") => {
    setActiveTab(tab);
    const first = chats.find(c => c.type === tab);
    if (first) setActiveChat(first.id);
  };

  const filteredChats = chats.filter(c =>
    c.type === activeTab &&
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChatData = chats.find(c => c.id === activeChat);

  if (loading) return <div>Memuat...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Live Chat</h1>
          <p className="text-zinc-500 text-sm">Balas pesan dari customer maupun mitra secara langsung.</p>
        </div>
        {/* Tab Switch */}
        <div style={{
          display: "flex", background: "#f4f4f5", borderRadius: "0.75rem",
          padding: "0.25rem", gap: "0.25rem",
        }}>
          {(["customer", "mitra"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.45rem 1rem", borderRadius: "0.5rem",
                fontSize: "0.85rem", fontWeight: 600,
                background: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "var(--bark, #3d2b1f)" : "#71717a",
                border: "none", cursor: "pointer",
                boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.18s",
              }}
            >
              {tab === "customer" ? <UserCircle size={16} /> : <Storefront size={16} />}
              {tab === "customer" ? "Customer" : "Mitra"}
              {/* Unread badge per tab */}
              {(() => {
                const count = chats.filter(c => c.type === tab && c.unread > 0).reduce((a, b) => a + b.unread, 0);
                return count > 0 ? (
                  <span style={{
                    background: "#ef4444", color: "#fff",
                    fontSize: "0.65rem", fontWeight: 800,
                    padding: "0.1rem 0.4rem", borderRadius: "9999px",
                    minWidth: 16, textAlign: "center",
                  }}>{count}</span>
                ) : null;
              })()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col md:flex-row">
        {/* Chat List Sidebar */}
        <div className="w-full md:w-80 h-1/3 md:h-auto min-h-[160px] md:min-h-0 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col bg-zinc-50/50 shrink-0">
          <div className="p-4 border-b border-zinc-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari percakapan ${activeTab === "customer" ? "customer" : "mitra"}...`}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 && (
              <div className="p-8 text-center text-zinc-400 text-sm">Tidak ada percakapan</div>
            )}
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`p-4 border-b border-zinc-100 cursor-pointer transition-colors ${
                  activeChat === chat.id ? "bg-zinc-100" : "hover:bg-zinc-100/50"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: chat.type === "mitra" ? "linear-gradient(135deg,var(--clay,#b85c3c),#c0673d)" : "#e4e4e7",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 700,
                      color: chat.type === "mitra" ? "#fff" : "#52525b",
                      flexShrink: 0,
                    }}>
                      {chat.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-semibold text-sm text-zinc-900">{chat.name}</span>
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">{chat.time}</span>
                </div>
                <div className="flex items-center gap-2 pl-10">
                  {chat.botHandled && (
                    <span title="Dibalas oleh AI"><Robot size={13} className="text-clay" style={{ flexShrink: 0 }} /></span>
                  )}
                  <p className="text-xs text-zinc-500 truncate flex-1">{chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unread}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {activeChatData ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: activeChatData.type === "mitra" ? "linear-gradient(135deg,var(--clay,#b85c3c),#c0673d)" : "#e4e4e7",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.875rem", fontWeight: 700,
                  color: activeChatData.type === "mitra" ? "#fff" : "#52525b",
                }}>
                  {activeChatData.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-900">{activeChatData.name}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Online
                    {activeChatData.type === "mitra" && (
                      <span className="ml-1 text-xs bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded-full">Mitra</span>
                    )}
                  </div>
                </div>
              </div>
              {activeChatData.botHandled && (
                <div className="px-3 py-1 bg-zinc-100 rounded-full flex items-center gap-2 text-xs font-medium text-zinc-600">
                  <Robot size={16} className="text-clay" />
                  AI Mode Aktif
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 pr-6 overflow-y-auto overflow-x-hidden flex flex-col gap-4 bg-zinc-50/30">
              {activeChatData.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`flex flex-col max-w-[75%] ${msg.role === "user" ? "items-start" : "items-end"}`}>
                    <div className={`p-3 rounded-2xl text-sm inline-block ${
                      msg.role === "user"
                        ? "bg-zinc-100 text-zinc-800 rounded-tl-sm"
                        : "bg-zinc-900 text-white rounded-tr-sm"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.time && (
                      <p className="text-[10px] text-zinc-400 mt-1">{msg.time}</p>
                    )}
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
                  placeholder={`Ketik balasan ke ${activeChatData.type === "mitra" ? "Mitra" : "Customer"}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
                />
                <button type="submit" className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors">
                  <PaperPlaneRight size={20} weight="fill" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <ChatCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Pilih percakapan untuk mulai membalas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
