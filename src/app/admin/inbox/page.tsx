"use client";

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
    const adminId = "mock-admin-id";
    setAdminId(adminId);
    return adminId;
  };

  const loadConversations = async (currentAdminId: string) => {
    setConversations([
      { user_id: "u1", user_email: "pengguna@dinoyocraft.com", last_message: "Halo min, mau tanya harga tiket", last_message_at: new Date().toISOString(), unread_count: 1 }
    ]);
  };

  const loadMessages = async (userId: string, currentAdminId: string) => {
    setMessages([
      { id: "m1", sender_id: "u1", recipient_id: currentAdminId, message: "Halo min, mau tanya harga tiket", is_from_admin: false, created_at: new Date().toISOString() }
    ]);
  };

  useEffect(() => {
    checkAdmin().then((id) => {
      if (id) loadConversations(id);
    });
  }, []);

  useEffect(() => {
    if (!selectedUser || !adminId) return;
    loadMessages(selectedUser, adminId);
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

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender_id: adminId,
      recipient_id: selectedUser,
      message: messageText,
      is_from_admin: true,
      created_at: new Date().toISOString()
    }]);
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
