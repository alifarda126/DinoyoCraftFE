"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { CalendarBlank, ShoppingBag, MapPin, ChatCircle, User as UserIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      setLoading(false);
    }
    loadUser();
  }, [router, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">DinoyoCraft</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight mb-1">Dashboard</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard/reservasi"
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <CalendarBlank className="w-8 h-8 mb-4 text-zinc-900 dark:text-zinc-100" />
            <h3 className="font-semibold mb-2">Reservasi Kelas</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Pesan kelas keramik untuk rombongan
            </p>
          </Link>

          <Link
            href="/dashboard/katalog"
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <ShoppingBag className="w-8 h-8 mb-4 text-zinc-900 dark:text-zinc-100" />
            <h3 className="font-semibold mb-2">Katalog Keramik</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Lihat karya dan pesan kustom
            </p>
          </Link>

          <Link
            href="/dashboard/peta"
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <MapPin className="w-8 h-8 mb-4 text-zinc-900 dark:text-zinc-100" />
            <h3 className="font-semibold mb-2">Peta Gang</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Navigasi ke bengkel pengrajin
            </p>
          </Link>

          <Link
            href="/dashboard/bantuan"
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <ChatCircle className="w-8 h-8 mb-4 text-zinc-900 dark:text-zinc-100" />
            <h3 className="font-semibold mb-2">Bantuan</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Chatbot AI & live chat admin
            </p>
          </Link>

          <Link
            href="/dashboard/profil"
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <UserIcon className="w-8 h-8 mb-4 text-zinc-900 dark:text-zinc-100" />
            <h3 className="font-semibold mb-2">Profil</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Kelola profil & riwayat pesanan
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
