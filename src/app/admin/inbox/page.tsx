"use client";

import { createClient } from "@/lib/supabase";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChatCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import Link from "next/link";

type Conversation = {
  user_id: string;
  user_email: string;
  last_message: string;
  last_message_at: string;
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
  const [adminId, setAdminId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const checkAdmin = async () => {
    // Check demo session first
    const demo = getDemoSession();
    if (demo) {
      if (demo.role !== "admin") {
        router.push("/dashboard");
        return null;
      }
      setAdminId(demo.user.id);
      return demo.user.id;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return null;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      router.push("/dashboard");
      return null;
    }
    setAdminId(user.id);
    return user.id;
  };

  const loadConversations = async (currentAdminId: string) => {
    // Fetch all messages where admin is either sender or recipient
    const { data } = await supabase
      .from("chat_messages")
      .select(`
        id,
        sender_id,
        recipient_id,
        message,
        is_from_admin,
        read,
        created_at,
        sender_profile:profiles!chat_messages_sender_id_fkey (id, email),
        recipient_profile:profiles!chat_messages_recipient_id_fkey (id, email)
      `)
      .or(`sender_id.eq.${currentAdminId},recipient_id.eq.${currentAdminId}`)
      .order("created_at", { ascending: false });

    if (!data) return;

    // Build conversations map keyed by user UUID (non-admin party)
    const map = new Map<string, Conversation>();
    data.forEach((msg: unknown) => {
      const record = msg as {
        sender_id: string;
        recipient_id: string;
        message: string;
        is_from_admin: boolean;
        read: boolean;
        created_at: string;
        sender_profile: { id: string; email: string } | null;
        recipient_profile: { id: string; email: string } | null;
      };

      // The user in the conversation is the non-admin party
      const isAdminSender = record.sender_id === currentAdminId;
      const userId = isAdminSender ? record.recipient_id : record.sender_id;
      const userEmail = isAdminSender
        ? record.recipient_profile?.email || userId
        : record.sender_profile?.email || userId;

      if (!map.has(userId)) {
        map.set(userId, {
          user_id: userId,
          user_email: userEmail,
          last_message: record.message,
          last_message_at: record.created_at,
          unread_count: (!record.is_from_admin && !record.read) ? 1 : 0,
        });
      } else {
        const conv = map.get(userId)!;
        if (!record.is_from_admin && !record.read) {
          conv.unread_count += 1;
        }
      }
    });

    // Sort by most recent message
    const sorted = Array.from(map.values()).sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
    setConversations(sorted);
  };

  const loadMessages = async (userId: string, currentAdminId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${currentAdminId}),and(sender_id.eq.${currentAdminId},recipient_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });

    if (data) setMessages(data);

    // Mark user's messages as read
    await supabase
      .from("chat_messages")
      .update({ read: true })
      .eq("sender_id", userId)
      .eq("recipient_id", currentAdminId)
      .eq("read", false);
  };

  useEffect(() => {
    checkAdmin().then((id) => {
      if (id) loadConversations(id);
    });
  }, []);

  useEffect(() => {
    if (!selectedUser || !adminId) return;

    loadMessages(selectedUser, adminId);

    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === selectedUser || msg.recipient_id === selectedUser) {
          setMessages((prev) => [...prev, msg]);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }
        // Refresh conversation list for unread count
        if (adminId) loadConversations(adminId);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedUser, adminId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || !adminId) return;

    const messageText = input;
    setInput("");

    await supabase.from("chat_messages").insert({
      sender_id: adminId,
      recipient_id: selectedUser,
      message: messageText,
      is_from_admin: true,
      read: false,
    });
  };

  const selectedConv = conversations.find((c) => c.user_id === selectedUser);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">Inbox Live Chat</h1>
          {conversations.some((c) => c.unread_count > 0) && (
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
              {conversations.reduce((s, c) => s + c.unread_count, 0)} belum dibaca
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversation list */}
          <div className="md:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-semibold text-sm">Percakapan</h3>
            </div>
            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-400 text-sm p-4 text-center">
                  Belum ada pesan masuk
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.user_id}
                    onClick={() => setSelectedUser(conv.user_id)}
                    className={`w-full text-left p-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${
                      selectedUser === conv.user_id ? "bg-zinc-50 dark:bg-zinc-900" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{conv.user_email}</div>
                        <div className="text-xs text-zinc-500 mt-0.5 truncate">
                          {conv.last_message}
                        </div>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-amber-400 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-semibold text-sm">{selectedConv?.user_email || selectedUser}</h3>
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
                  <div ref={messagesEndRef} />
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
                  <p>Pilih percakapan di sebelah kiri</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
