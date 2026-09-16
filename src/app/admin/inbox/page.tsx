"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChatCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import Link from "next/link";

type Conversation = {
  user_id: string;
  user_email: string;
  last_message: string;
  unread_count: number;
};

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
};

export default function AdminInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      router.push("/dashboard");
    }
  };

  const loadConversations = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("sender_id, recipient_id, message, read, created_at, sender:profiles!chat_messages_sender_id_fkey (email)")
      .order("created_at", { ascending: false });

    if (!data) return;

    const map = new Map<string, Conversation>();
    data.forEach((msg: unknown) => {
      const record = msg as { sender_id: string; recipient_id: string; message: string; read: boolean; is_from_admin?: boolean; sender?: { email?: string } };
      const otherId = record.is_from_admin ? record.recipient_id : record.sender_id;
      if (!map.has(otherId)) {
        map.set(otherId, {
          user_id: otherId,
          user_email: record.sender?.email || otherId,
          last_message: record.message,
          unread_count: record.is_from_admin || record.read ? 0 : 1,
        });
      } else {
        const conv = map.get(otherId)!;
        if (!record.is_from_admin && !record.read) {
          conv.unread_count += 1;
        }
      }
    });

    setConversations(Array.from(map.values()));
  };

  const loadMessages = async (userId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);

    await supabase
      .from("chat_messages")
      .update({ read: true })
      .eq("sender_id", userId)
      .eq("read", false);
  };

  useEffect(() => {
    checkAdmin();
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    loadMessages(selectedUser);
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === selectedUser || msg.recipient_id === selectedUser) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      recipient_id: selectedUser,
      message: input,
      is_from_admin: true,
      read: false,
    });

    setInput("");
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">Inbox Live Chat</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          <div className="md:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-semibold">Percakapan</h3>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => setSelectedUser(conv.user_id)}
                  className={`w-full text-left p-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${
                    selectedUser === conv.user_id ? "bg-zinc-50 dark:bg-zinc-900" : ""
                  }`}
                >
                  <div className="font-medium text-sm truncate">{conv.user_email}</div>
                  <div className="text-xs text-zinc-500 mt-1 truncate">
                    {conv.last_message}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                      {conv.unread_count} baru
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-semibold">
                    {conversations.find((c) => c.user_id === selectedUser)?.user_email}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_from_admin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                          msg.is_from_admin
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Balas pesan..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    <PaperPlaneTilt className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <ChatCircle className="w-12 h-12 mx-auto mb-3" />
                  <p>Pilih percakapan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
