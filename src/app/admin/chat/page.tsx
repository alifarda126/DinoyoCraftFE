"use client";

import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import api from "@/lib/axios";
import { getDemoSession } from "@/lib/utils/demo";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { PaperPlaneRight, UserCircle, Robot, Storefront, ChatCircle } from "@phosphor-icons/react";

type ChatMessage = { id?: number; role: "user" | "admin"; text: string; time?: string; sender_id?: number };
type ChatContact = {
  id: number; name: string; lastMsg: string; time: string; unread: number; botHandled: boolean;
  type: "customer" | "mitra";
  messages: ChatMessage[];
};

const getAuthUserId = (): number => {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
          const uid = Number(decoded.userId || decoded.id);
          if (!isNaN(uid) && uid > 0) return uid;
        }
      }
    } catch {}
    try {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        const u = JSON.parse(uStr);
        const uid = Number(u.id || u.userId);
        if (!isNaN(uid) && uid > 0) return uid;
      }
    } catch {}
  }
  return 0;
};

export default function AdminLiveChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"customer" | "mitra">("customer");
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<ChatContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, initAuth } = useAuthStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const session = getDemoSession();
  const [myUserId, setMyUserId] = useState<number>(() => {
    return user?.id || getAuthUserId() || (session?.user?.id && !isNaN(Number(session.user.id)) ? Number(session.user.id) : 1) || 1;
  });

  useEffect(() => {
    initAuth();
    const uid = user?.id || getAuthUserId() || (session?.user?.id && !isNaN(Number(session.user.id)) ? Number(session.user.id) : 1);
    if (uid) setMyUserId(uid);
  }, [user?.id, initAuth]);

  useEffect(() => {
    const sessionData = getDemoSession();
    if (!sessionData || sessionData.role !== "admin") {
      router.push("/auth/login");
      return;
    }
    setLoading(false);
  }, [router]);

  // Fetch daftar kontak dari backend database
  useEffect(() => {
    const loadContacts = () => {
      api.get("/chat/contacts")
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.data)) {
            if (res.data.current_user_id) {
              setMyUserId(Number(res.data.current_user_id));
            }
            const apiContacts: ChatContact[] = res.data.data.map((c: any) => ({
              id: c.id,
              name: c.store_name || c.name,
              lastMsg: c.last_message || "Belum ada percakapan",
              time: c.last_message_time
                ? new Date(c.last_message_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "",
              unread: c.unread_count || 0,
              botHandled: false,
              type: c.role === "mitra" ? ("mitra" as const) : ("customer" as const),
              messages: [],
            }));

            setChats(apiContacts);

            setActiveChat((currentActive) => {
              if (currentActive && apiContacts.some((c) => c.id === currentActive)) {
                return currentActive;
              }
              const firstInTab = apiContacts.find((c) => c.type === activeTab);
              return firstInTab ? firstInTab.id : (apiContacts[0]?.id || null);
            });
          }
        })
        .catch((err) => {
          console.warn("Gagal memuat kontak dari database:", err?.message || err);
        });
    };

    loadContacts();
    const contactPoll = setInterval(loadContacts, 5000);
    return () => clearInterval(contactPoll);
  }, [activeTab]);

  // Connect ke Pusher & subscribe event real-time serta smart auto-polling
  useEffect(() => {
    if (!activeChat || !myUserId) {
      setMessages([]);
      return;
    }

    // 1. Paksa konversi ke Number agar format channel backend & frontend 100% sama
    const id1 = Number(myUserId);
    const id2 = Number(activeChat);

    const fetchMessages = () => {
      api.get(`/chat/messages/${id2}`)
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.data)) {
            if (res.data.current_user_id) {
              setMyUserId(Number(res.data.current_user_id));
            }
            const apiMessages: ChatMessage[] = res.data.data.map((m: any) => {
              const date = m.created_at ? new Date(m.created_at) : new Date();
              const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
              return {
                id: Number(m.id),
                role: Number(m.sender_id) == id1 ? ("admin" as const) : ("user" as const),
                text: m.message,
                time,
                sender_id: Number(m.sender_id),
              };
            });

            setMessages((prev) => {
              if (prev.length !== apiMessages.length) return apiMessages;
              const hasDiff = apiMessages.some((msg, idx) => prev[idx]?.id !== msg.id || prev[idx]?.text !== msg.text);
              return hasDiff ? apiMessages : prev;
            });

            const lastApiMsg = apiMessages.length > 0 ? apiMessages[apiMessages.length - 1] : null;
            if (lastApiMsg) {
              setChats((prev) =>
                prev.map((c) =>
                  c.id == id2
                    ? {
                        ...c,
                        lastMsg: lastApiMsg.text,
                        time: lastApiMsg.time || c.time,
                      }
                    : c
                )
              );
            }
          }
        })
        .catch((err) => {
          console.warn("Gagal mengambil riwayat dari server:", err?.message || err);
        });
    };

    fetchMessages();
    // Auto-polling: pesan baru otomatis tampil di layar setiap 2 detik tanpa harus klik kontak lain
    const pollTimer = setInterval(fetchMessages, 2000);

    // 2. Pusher connection
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b0fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

    let channel: any = null;
    let userChannel: any = null;
    let pusher: any = null;

    if (pusherKey) {
      try {
        pusher = new Pusher(pusherKey, {
          cluster: pusherCluster,
        });

        const channelName = `chat-${Math.min(id1, id2)}-${Math.max(id1, id2)}`;
        console.log("Mencoba subscribe ke channel:", channelName);
        channel = pusher.subscribe(channelName);
        userChannel = pusher.subscribe(`user-${id1}`);

        const handleNewMessage = (data: any) => {
          console.log("Pesan realtime masuk dari Pusher:", data);

          const senderId = Number(data.sender_id);
          const receiverId = Number(data.receiver_id);
          const isForThisChat = id2 == senderId || id2 == receiverId;

          const date = data.created_at ? new Date(data.created_at) : new Date();
          const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
          const isMe = senderId == id1;

          const incomingMsg: ChatMessage = {
            id: Number(data.id),
            role: isMe ? "admin" : "user",
            text: data.message,
            time,
            sender_id: senderId,
          };

          if (isForThisChat) {
            setMessages((prevMessages) => {
              const isDuplicate = prevMessages.some(
                (msg) =>
                  msg.id == data.id ||
                  (msg.text === incomingMsg.text && msg.time === incomingMsg.time)
              );
              if (isDuplicate) return prevMessages;
              return [...prevMessages, incomingMsg];
            });
          }

          setChats((prevChats) =>
            prevChats.map((contact) =>
              contact.id == senderId || contact.id == receiverId
                ? { ...contact, lastMsg: data.message, time: incomingMsg.time || contact.time }
                : contact
            )
          );
        };

        channel.bind("new-message", handleNewMessage);
        userChannel.bind("new-message", handleNewMessage);
      } catch (e) {
        console.warn("Pusher init error:", e);
      }
    }

    return () => {
      clearInterval(pollTimer);
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      if (userChannel) {
        userChannel.unbind_all();
        userChannel.unsubscribe();
      }
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [myUserId, activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat || !myUserId) return;

    const currentMsgText = message.trim();
    setMessage("");

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: ChatMessage = {
      role: "admin",
      text: currentMsgText,
      time,
      sender_id: Number(myUserId),
    };

    // Update optimis ke layar chat aktif
    setMessages((prev) => [...prev, newMsg]);

    // Update optimis ke preview sidebar kontak
    setChats(prev => prev.map(chat => {
      if (chat.id != activeChat) return chat;
      return {
        ...chat,
        lastMsg: currentMsgText,
        time,
      };
    }));

    // Trigger ke Express backend yang akan meneruskannya ke Pusher
    try {
      await api.post(`/chat/send/${activeChat}`, { message: currentMsgText });
    } catch (err: any) {
      console.warn("Gagal mengirim pesan via API backend:", err?.message || err);
    }
  };

  // When switching tab, auto select first in that tab
  const handleTabSwitch = (tab: "customer" | "mitra") => {
    setActiveTab(tab);
    const first = chats.find(c => c.type === tab);
    setActiveChat(first ? first.id : null);
  };

  const filteredChats = chats.filter(c =>
    c.type === activeTab &&
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChatData = chats.find(c => c.id === activeChat);

  // Auto-scroll ke bawah saat pesan bertambah atau berubah
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-12">
                  <ChatCircle size={40} className="opacity-30 mb-2" />
                  <p className="text-sm font-medium text-zinc-500">Belum ada riwayat pesan</p>
                  <p className="text-xs text-zinc-400">Ketik pesan di bawah untuk memulai obrolan.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
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
                ))
              )}
              {/* Penanda scroll paling bawah */}
              <div ref={messagesEndRef} />
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
