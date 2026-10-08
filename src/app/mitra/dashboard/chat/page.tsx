"use client";

import { useState, useEffect } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { PaperPlaneRight, UserCircle, Storefront, ChatCircle, MagnifyingGlass } from "@phosphor-icons/react";

type ChatMsg = { from: "me" | "other"; text: string; time: string };
type ChatContact = {
  id: number; name: string; avatar: string; lastMsg: string;
  time: string; unread: number; messages: ChatMsg[];
};

const CS_CONTACTS: ChatContact[] = [
  {
    id: 1, name: "CS DinoyoCraft", avatar: "CS", lastMsg: "Ada yang bisa kami bantu?", time: "09:00", unread: 0,
    messages: [
      { from: "other", text: "Halo! Selamat datang di DinoyoCraft Support. Ada yang bisa kami bantu?", time: "09:00" },
      { from: "me", text: "Halo kak, saya mau tanya soal pengiriman ke luar Jawa, apakah bisa?", time: "09:02" },
      { from: "other", text: "Tentu bisa, Kak! Kami melayani pengiriman ke seluruh Indonesia. Tarif ongkos kirim disesuaikan dengan kurir yang dipilih saat checkout.", time: "09:03" },
    ],
  },
  {
    id: 2, name: "CS Admin", avatar: "AD", lastMsg: "Pesanan Anda sudah kami proses.", time: "Kemarin", unread: 0,
    messages: [
      { from: "other", text: "Halo Kak, pesanan ORD-20231023-002 sudah kami proses dan siap dikemas.", time: "Kemarin" },
      { from: "me", text: "Terima kasih admin!", time: "Kemarin" },
    ],
  },
];

const CUSTOMER_CONTACTS: ChatContact[] = [
  {
    id: 10, name: "Budi Santoso", avatar: "BS", lastMsg: "Halo kak, pesanan saya sudah sampai belum ya?", time: "10:15", unread: 1,
    messages: [
      { from: "other", text: "Halo kak, pesanan saya sudah sampai belum ya?", time: "10:15" },
      { from: "me", text: "Halo Kak Budi! Pesanan sedang kami proses, sebentar lagi akan kami kirim.", time: "10:20" },
    ],
  },
  {
    id: 11, name: "Siti Aminah", avatar: "SA", lastMsg: "Bisa minta foto produknya dulu?", time: "14:30", unread: 1,
    messages: [
      { from: "other", text: "Kak, bisa minta foto produknya dulu sebelum dikirim?", time: "14:30" },
    ],
  },
  {
    id: 12, name: "Joko Anwar", avatar: "JA", lastMsg: "Kapan pesanan saya dikirim?", time: "Kemarin", unread: 0,
    messages: [
      { from: "other", text: "Kapan pesanan saya dikirim?", time: "Kemarin" },
      { from: "me", text: "Pesanan Kakak sedang dalam proses pengemasan, estimasi dikirim besok.", time: "Kemarin" },
      { from: "other", text: "Oke siap, terima kasih!", time: "Kemarin" },
    ],
  },
];

export default function SellerChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chatTab, setChatTab] = useState<"cs" | "customer">("cs");
  const [activeContact, setActiveContact] = useState<number>(1);
  const [chatContacts, setChatContacts] = useState<Record<"cs" | "customer", ChatContact[]>>({
    cs: CS_CONTACTS,
    customer: CUSTOMER_CONTACTS,
  });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/mitra/login");
      return;
    }
    setLoading(false);
  }, [router]);

  function handleTabSwitch(tab: "cs" | "customer") {
    setChatTab(tab);
    const first = chatContacts[tab][0];
    if (first) setActiveContact(first.id);
    setSearch("");
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: ChatMsg = { from: "me", text: message.trim(), time };
    setChatContacts(prev => ({
      ...prev,
      [chatTab]: prev[chatTab].map(c =>
        c.id === activeContact
          ? { ...c, lastMsg: message.trim(), messages: [...c.messages, newMsg] }
          : c
      ),
    }));
    setMessage("");
    if (chatTab === "cs") {
      setTimeout(() => {
        const reply: ChatMsg = { from: "other", text: "Terima kasih pesannya, Kak! Tim kami segera merespons dalam 1–5 menit.", time };
        setChatContacts(prev => ({
          ...prev,
          [chatTab]: prev[chatTab].map(c =>
            c.id === activeContact
              ? { ...c, messages: [...c.messages, reply] }
              : c
          ),
        }));
      }, 1200);
    }
  }

  const filteredContacts = chatContacts[chatTab].filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const activeChatData = chatContacts[chatTab].find(c => c.id === activeContact);

  if (loading) return <div>Memuat...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Live Chat</h1>
          <p className="text-zinc-500 text-sm">Balas pesan dari CS DinoyoCraft maupun customer toko Anda.</p>
        </div>

        {/* Tab Switch */}
        <div style={{
          display: "flex", background: "#f4f4f5", borderRadius: "0.75rem",
          padding: "0.25rem", gap: "0.25rem",
        }}>
          {(["cs", "customer"] as const).map(tab => {
            const count = chatContacts[tab].reduce((a, b) => a + b.unread, 0);
            return (
              <button
                key={tab}
                onClick={() => handleTabSwitch(tab)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.45rem 1rem", borderRadius: "0.5rem",
                  fontSize: "0.85rem", fontWeight: 600,
                  background: chatTab === tab ? "#fff" : "transparent",
                  color: chatTab === tab ? "var(--bark, #3d2b1f)" : "#71717a",
                  border: "none", cursor: "pointer",
                  boxShadow: chatTab === tab ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.18s",
                }}
              >
                {tab === "cs" ? <UserCircle size={16} /> : <Storefront size={16} />}
                {tab === "cs" ? "CS DinoyoCraft" : "Customer"}
                {count > 0 && (
                  <span style={{
                    background: "#ef4444", color: "#fff",
                    fontSize: "0.65rem", fontWeight: 800,
                    padding: "0.1rem 0.4rem", borderRadius: "9999px",
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex">
        {/* Sidebar kontak */}
        <div className="w-80 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
          <div className="p-4 border-b border-zinc-200">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Cari ${chatTab === "cs" ? "CS" : "customer"}...`}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-zinc-400 text-sm">Tidak ada percakapan</div>
            )}
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => setActiveContact(contact.id)}
                className={`p-4 border-b border-zinc-100 cursor-pointer transition-colors ${
                  activeContact === contact.id ? "bg-zinc-100" : "hover:bg-zinc-100/50"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2.5">
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: chatTab === "cs"
                        ? "linear-gradient(135deg, var(--clay, #b85c3c), #c0673d)"
                        : "#e4e4e7",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 800,
                      color: chatTab === "cs" ? "#fff" : "#52525b",
                    }}>
                      {contact.avatar}
                    </div>
                    <span className="font-semibold text-sm text-zinc-900">{contact.name}</span>
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">{contact.time}</span>
                </div>
                <div className="flex items-center gap-2 pl-[52px]">
                  <p className="text-xs text-zinc-500 truncate flex-1">{contact.lastMsg}</p>
                  {contact.unread > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Area Chat */}
        {activeChatData ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Header chat */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: chatTab === "cs"
                    ? "linear-gradient(135deg, var(--clay, #b85c3c), #c0673d)"
                    : "#e4e4e7",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 800,
                  color: chatTab === "cs" ? "#fff" : "#52525b",
                }}>
                  {activeChatData.avatar}
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-900">{activeChatData.name}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Online
                    {chatTab === "customer" && (
                      <span className="ml-1 text-xs bg-zinc-100 text-zinc-600 font-semibold px-1.5 py-0.5 rounded-full">
                        Customer
                      </span>
                    )}
                    {chatTab === "cs" && (
                      <span className="ml-1 text-xs bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded-full">
                        CS Support
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pesan */}
            <div className="flex-1 p-4 pr-6 overflow-y-auto overflow-x-hidden flex flex-col gap-4 bg-zinc-50/30">
              {activeChatData.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex flex-col max-w-[75%] ${msg.from === "me" ? "items-end" : "items-start"}`}>
                    <div className={`p-3 rounded-2xl text-sm inline-block ${
                      msg.from === "me"
                        ? "bg-zinc-900 text-white rounded-tr-sm"
                        : "bg-zinc-100 text-zinc-800 rounded-tl-sm"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.time && (
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {msg.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-200">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={chatTab === "cs" ? "Tulis pesan ke CS DinoyoCraft..." : `Balas ${activeChatData.name}...`}
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
