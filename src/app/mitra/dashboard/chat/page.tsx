"use client";

import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import api from "@/lib/axios";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { UserCircle, Storefront, ChatCircle, MagnifyingGlass } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ChatMediaComposer,
  ChatMessageMedia,
  DinoyoSticker,
  formatLastSeen,
  formatMessagePreview,
  isStickerUrl,
} from "@/components/chat/ChatMediaControls";

type ChatMsg = { id?: number; tempId?: string; from: "me" | "other"; text: string; time: string; image_url?: string };
type ChatContact = {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  role?: string;
  is_online?: boolean;
  last_seen_at?: string;
  messages?: ChatMsg[];
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

export default function SellerChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chatTab, setChatTab] = useState<"cs" | "customer">("cs");
  const [activeContact, setActiveContact] = useState<number | null>(null);
  const [chatContacts, setChatContacts] = useState<Record<"cs" | "customer", ChatContact[]>>({
    cs: [],
    customer: [],
  });
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState("");
  const { user, initAuth } = useAuthStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const session = getDemoSession();
  const [myUserId, setMyUserId] = useState<number>(() => {
    return user?.id || getAuthUserId() || (session?.user?.id && !isNaN(Number(session.user.id)) ? Number(session.user.id) : 37) || 37;
  });

  useEffect(() => {
    initAuth();
    const uid = user?.id || getAuthUserId() || (session?.user?.id && !isNaN(Number(session.user.id)) ? Number(session.user.id) : 37);
    if (uid) setMyUserId(uid);
  }, [user?.id, initAuth]);

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!storedToken) {
      router.push("/login");
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
            const csList: ChatContact[] = [];
            const customerList: ChatContact[] = [];

            res.data.data.forEach((c: any) => {
              const displayName = c.role === "admin" ? (c.name || "CS DinoyoCraft") : (c.store_name || c.name || "Customer");
              const initials = displayName
                .split(" ")
                .filter(Boolean)
                .map((w: string) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || (c.role === "admin" ? "CS" : "C");

              let timeStr = "";
              if (c.last_message_time) {
                const d = new Date(c.last_message_time);
                timeStr = isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              }

              const hasChatHistory = Boolean(
                c.last_message_time ||
                (c.last_message && String(c.last_message).trim()) ||
                (c.last_image_url && String(c.last_image_url).trim())
              );

              const contact: ChatContact = {
                id: c.id,
                name: displayName,
                avatar: initials,
                lastMsg: formatMessagePreview(
                  c.last_message,
                  c.last_image_url,
                  "Belum ada percakapan"
                ),
                time: timeStr,
                unread: Number(c.unread_count) || 0,
                role: c.role,
                is_online: Boolean(c.is_online),
                last_seen_at: c.last_seen_at || undefined,
              };

              if (c.role === "admin") {
                csList.push(contact);
              } else if (hasChatHistory) {
                customerList.push(contact);
              }
            });

            setChatContacts({
              cs: csList,
              customer: customerList,
            });

            setActiveContact((current) => {
              const currentList = chatTab === "cs" ? csList : customerList;
              if (current && currentList.some((c) => c.id === current)) {
                return current;
              }
              return currentList.length > 0 ? currentList[0].id : null;
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
  }, [chatTab]);

  // Heartbeat otomatis setiap 30 detik untuk memperbarui status online user
  useEffect(() => {
    const sendHeartbeat = () => {
      api.post("/chat/heartbeat").catch(() => {});
    };
    sendHeartbeat();
    const hbTimer = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(hbTimer);
  }, []);

  // Connect ke Pusher & subscribe event real-time serta smart auto-polling
  useEffect(() => {
    if (!activeContact || !myUserId) {
      setMessages([]);
      return;
    }

    // 1. Paksa konversi ke Number agar format channel backend & frontend 100% sama
    const id1 = Number(myUserId);
    const id2 = Number(activeContact);
    let isFirstFetchForActive = true;
    let lastCount = -1;

    const fetchMessages = () => {
      api.get(`/chat/messages/${id2}`)
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.data)) {
            if (res.data.current_user_id) {
              setMyUserId(Number(res.data.current_user_id));
            }
            const apiMessages: ChatMsg[] = res.data.data.map((m: any) => {
              const date = m.created_at ? new Date(m.created_at) : new Date();
              const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
              return {
                id: Number(m.id),
                from: Number(m.sender_id) == id1 ? ("me" as const) : ("other" as const),
                text: m.message,
                image_url: m.image_url || undefined,
                time,
              };
            });

            // Filter agar array unik berdasarkan id
            const uniqueApiMessages = apiMessages.filter(
              (m, idx, arr) => arr.findIndex((x) => x.id === m.id) === idx
            );

            setMessages((prev) => {
              if (prev.length !== uniqueApiMessages.length) return uniqueApiMessages;
              const hasDiff = uniqueApiMessages.some((msg, idx) => prev[idx]?.id !== msg.id || prev[idx]?.text !== msg.text || prev[idx]?.image_url !== msg.image_url);
              return hasDiff ? uniqueApiMessages : prev;
            });

            const targetOnline = res.data?.is_online !== undefined
              ? Boolean(res.data.is_online)
              : res.data?.target_user?.is_online !== undefined
              ? Boolean(res.data.target_user.is_online)
              : undefined;
            const targetLastSeen = res.data?.last_seen_at || res.data?.target_user?.last_seen_at;

            const lastApiMsg = apiMessages.length > 0 ? apiMessages[apiMessages.length - 1] : null;
            setChatContacts((prev) => {
              const updateList = (list: ChatContact[]) =>
                list.map((c) => {
                  if (c.id != id2) return c;
                  return {
                    ...c,
                    unread: 0,
                    is_online: targetOnline !== undefined ? targetOnline : c.is_online,
                    last_seen_at: targetLastSeen !== undefined ? targetLastSeen : c.last_seen_at,
                    lastMsg: lastApiMsg
                      ? formatMessagePreview(lastApiMsg.text, lastApiMsg.image_url, c.lastMsg)
                      : c.lastMsg,
                    time: lastApiMsg?.time || c.time,
                  };
                });
              return {
                cs: updateList(prev.cs),
                customer: updateList(prev.customer),
              };
            });
            if (typeof window !== "undefined" && (isFirstFetchForActive || apiMessages.length !== lastCount)) {
              isFirstFetchForActive = false;
              lastCount = apiMessages.length;
              window.dispatchEvent(new Event("chat_unread_updated"));
            }
          }
        })
        .catch((err) => {
          console.warn("Gagal memuat pesan dari server:", err?.message || err);
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

        // Set untuk menyimpan message.id yang telah diproses agar tidak double dari multi-channel Pusher
        const processedMsgIds = new Set<number>();

        const handleNewMessage = (data: any) => {
          console.log("Pesan realtime masuk dari Pusher:", data);

          const senderId = Number(data.sender_id);
          const receiverId = Number(data.receiver_id);
          const isForThisChat = id2 == senderId || id2 == receiverId;

          const date = data.created_at ? new Date(data.created_at) : new Date();
          const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
          const isMe = senderId == id1;

          const msgId = Number(data.id);
          if (msgId && processedMsgIds.has(msgId)) {
            console.log(`[Pusher FE] Pesan ${msgId} sudah diproses, abaikan duplikat channel.`);
            return;
          }
          if (msgId) {
            processedMsgIds.add(msgId);
          }

          const incomingMsg: ChatMsg = {
            id: msgId || undefined,
            from: isMe ? "me" : "other",
            text: data.message,
            image_url: data.image_url || undefined,
            time,
          };

          if (isForThisChat) {
            setMessages((prevMessages) => {
              // 1. Cek duplikasi berdasarkan ID
              if (msgId && prevMessages.some((msg) => msg.id === msgId)) {
                return prevMessages;
              }
              // 2. Jika ada pesan optimis tanpa ID yang cocok, update ID-nya
              const optIndex = prevMessages.findIndex(
                (msg) =>
                  !msg.id &&
                  msg.from === incomingMsg.from &&
                  ((msg.text && msg.text === incomingMsg.text) ||
                    (msg.image_url &&
                      incomingMsg.image_url &&
                      ((isStickerUrl(msg.image_url) &&
                        msg.image_url === incomingMsg.image_url) ||
                        (msg.image_url.startsWith("blob:") &&
                          !isStickerUrl(incomingMsg.image_url)))))
              );
              if (optIndex !== -1) {
                const updated = [...prevMessages];
                updated[optIndex] = { ...updated[optIndex], id: msgId, tempId: undefined, image_url: incomingMsg.image_url };
                return updated;
              }
              // 3. Cek duplikasi konten dan waktu
              const isDuplicate = prevMessages.some(
                (msg) =>
                  msg.from === incomingMsg.from &&
                  msg.text === incomingMsg.text &&
                  msg.time === incomingMsg.time &&
                  (msg.image_url || null) === (incomingMsg.image_url || null)
              );
              if (isDuplicate) return prevMessages;
              return [...prevMessages, incomingMsg];
            });
          }

          const pusherPreview = formatMessagePreview(data.message, data.image_url);
          setChatContacts((prev) => {
            const updateList = (list: ChatContact[]) =>
              list.map((c) =>
                c.id == senderId || c.id == receiverId
                  ? { ...c, lastMsg: pusherPreview || c.lastMsg, time: incomingMsg.time || c.time }
                  : c
              );
            return {
              cs: updateList(prev.cs),
              customer: updateList(prev.customer),
            };
          });
        };

        channel.bind("new-message", handleNewMessage);
        userChannel.bind("new-message", handleNewMessage);
      } catch (e) {
        console.warn("Pusher init warning:", e);
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
  }, [myUserId, activeContact]);

  function handleTabSwitch(tab: "cs" | "customer") {
    setChatTab(tab);
    const list = chatContacts[tab];
    setActiveContact(list.length > 0 ? list[0].id : null);
    setSearch("");
  }

  function updateContactPreview(previewText: string, time: string) {
    setChatContacts((prev) => {
      const updateList = (list: ChatContact[]) =>
        list.map((c) =>
          c.id == activeContact
            ? { ...c, lastMsg: previewText, time }
            : c
        );
      return {
        cs: updateList(prev.cs),
        customer: updateList(prev.customer),
      };
    });
  }

  function reconcileOptimisticMsg(tempId: string, serverId: unknown, serverImageUrl?: string) {
    const numericId = Number(serverId);
    if (!numericId) return;
    setMessages((prev) => {
      const alreadyExists = prev.some((m) => m.id === numericId);
      if (alreadyExists) {
        return prev.filter((m) => m.tempId !== tempId);
      }
      return prev.map((m) =>
        m.tempId === tempId
          ? {
              ...m,
              id: numericId,
              tempId: undefined,
              image_url: serverImageUrl || m.image_url,
            }
          : m
      );
    });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !activeContact || !myUserId || isSending) return;

    const currentMsgText = message.trim();
    setIsSending(true);
    setMessage("");

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const tempId = `temp_txt_${Date.now()}`;
    const newMsg: ChatMsg = { tempId, from: "me", text: currentMsgText, time };

    setMessages((prev) => [...prev, newMsg]);
    updateContactPreview(currentMsgText, time);

    try {
      const res = await api.post(`/chat/send/${activeContact}`, { message: currentMsgText });
      reconcileOptimisticMsg(tempId, res.data?.data?.id);
    } catch (err: any) {
      console.warn("Gagal mengirim pesan via backend API:", err?.message || err);
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendImage(file: File) {
    if (!activeContact || !myUserId || isSending) return;

    setIsSending(true);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const tempId = `temp_img_${Date.now()}`;
    const objectUrl = URL.createObjectURL(file);

    setMessages((prev) => [...prev, { tempId, from: "me", text: "", image_url: objectUrl, time }]);
    updateContactPreview("📷 [Foto]", time);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("message", "");
      const res = await api.post(`/chat/send/${activeContact}`, formData);
      reconcileOptimisticMsg(tempId, res.data?.data?.id, res.data?.data?.image_url);
    } catch (err: any) {
      console.warn("Gagal mengirim gambar via backend API:", err?.message || err);
    } finally {
      setIsSending(false);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    }
  }

  async function handleSendSticker(sticker: DinoyoSticker) {
    if (!activeContact || !myUserId || isSending) return;

    setIsSending(true);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const tempId = `temp_stk_${Date.now()}`;

    setMessages((prev) => [...prev, { tempId, from: "me", text: "", image_url: sticker.serverPath, time }]);
    updateContactPreview("🏷️ Stiker", time);

    try {
      const res = await api.post(`/chat/send/${activeContact}`, {
        message: "",
        image_url: sticker.serverPath,
      });
      reconcileOptimisticMsg(tempId, res.data?.data?.id, res.data?.data?.image_url);
    } catch (err: any) {
      console.warn("Gagal mengirim stiker via backend API:", err?.message || err);
    } finally {
      setIsSending(false);
    }
  }

  const filteredContacts = chatContacts[chatTab].filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const activeChatData = chatContacts[chatTab].find(c => c.id === activeContact);

  // Auto-scroll ke bawah saat pesan berubah atau pesan baru masuk
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar kontak */}
        <div className="w-full md:w-80 h-1/3 md:h-auto min-h-[160px] md:min-h-0 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col bg-zinc-50/50 shrink-0">
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
                className={`p-4 border-b border-zinc-100 cursor-pointer transition-colors ${activeContact === contact.id ? "bg-zinc-100" : "hover:bg-zinc-100/50"
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: chatTab === "cs"
                          ? "linear-gradient(135deg, var(--clay, #b85c3c), #c0673d)"
                          : "#e4e4e7",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 800,
                        color: chatTab === "cs" ? "#fff" : "#52525b",
                      }}>
                        {contact.avatar}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          contact.is_online ? "bg-green-500" : "bg-zinc-300"
                        }`}
                        title={contact.is_online ? "Online" : formatLastSeen(contact.last_seen_at)}
                      />
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
                <div className="relative shrink-0">
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
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      activeChatData.is_online ? "bg-green-500" : "bg-zinc-400"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-900">{activeChatData.name}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeChatData.is_online ? "bg-green-500" : "bg-zinc-400"
                      }`}
                    ></span>
                    <span className={activeChatData.is_online ? "text-green-600 font-medium" : "text-zinc-500"}>
                      {activeChatData.is_online
                        ? "Online"
                        : formatLastSeen(activeChatData.last_seen_at)}
                    </span>
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
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-12">
                  <ChatCircle size={40} className="opacity-30 mb-2" />
                  <p className="text-sm font-medium text-zinc-500">Belum ada riwayat pesan</p>
                  <p className="text-xs text-zinc-400">Ketik pesan di bawah untuk memulai obrolan.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const msgIsSticker = isStickerUrl(msg.image_url);

                  return (
                    <div key={msg.id ? `msg-${msg.id}` : msg.tempId || `idx-${i}`} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex flex-col max-w-[75%] ${msg.from === "me" ? "items-end" : "items-start"}`}>
                        <div
                          className={`text-sm inline-block ${
                            msgIsSticker
                              ? "bg-transparent !p-0 shadow-none border-none"
                              : msg.from === "me"
                              ? "p-3 rounded-2xl bg-zinc-900 text-white rounded-tr-sm"
                              : "p-3 rounded-2xl bg-zinc-100 text-zinc-800 rounded-tl-sm"
                          }`}
                        >
                          <ChatMessageMedia imageUrl={msg.image_url} text={msg.text} />
                          {msg.text && (
                            <div className={msgIsSticker ? "mt-1 text-zinc-800 bg-zinc-100 px-3 py-1.5 rounded-xl inline-block" : ""}>
                              {msg.text}
                            </div>
                          )}
                        </div>
                        {msg.time && (
                          <p className="text-[10px] text-zinc-400 mt-1">
                            {msg.time}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {/* Penanda scroll paling bawah */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatMediaComposer
              message={message}
              onMessageChange={setMessage}
              onSubmitText={handleSend}
              onSelectImage={handleSendImage}
              onSelectSticker={handleSendSticker}
              placeholder={chatTab === "cs" ? "Tulis pesan ke CS DinoyoCraft..." : `Balas ${activeChatData.name}...`}
              disabled={isSending}
            />
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
