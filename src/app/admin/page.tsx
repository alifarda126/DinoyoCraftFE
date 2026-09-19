"use client";

// Backend removed
import { getDemoSession, clearDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  UserCheck,
  Image as ImageIcon,
  ChatCircle,
  ChartLineUp,
  SignOut,
} from "@phosphor-icons/react";
import Link from "next/link";

type UserProfile = {
  email?: string;
  id: string;
};

export default function AdminPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const checkAdmin = async () => {
    // Check demo session first
    const demo = getDemoSession();
    if (demo) {
      if (demo.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setUser({ email: demo.user.email, id: demo.user.id });
      setLoading(false);
      return;
    }
    // Mock admin
    setUser({ email: "admin@dinoyocraft.com", id: "mock-admin-id" });
    setLoading(false);
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  async function handleSignOut() {
    clearDemoSession();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Memvalidasi akses...</div>
      </div>
    );
  }

  const menu = [
    {
      href: "/admin/jadwal",
      icon: Calendar,
      title: "Manajemen Jadwal",
      desc: "Atur jam buka, kapasitas, dan kunci jadwal",
    },
    {
      href: "/admin/manifes",
      icon: UserCheck,
      title: "Manifes Kehadiran",
      desc: "Validasi tamu hari-H dengan kode booking",
    },
    {
      href: "/admin/katalog",
      icon: ImageIcon,
      title: "Manajemen Katalog",
      desc: "Kelola karya keramik dan harga",
    },
    {
      href: "/admin/inbox",
      icon: ChatCircle,
      title: "Inbox Live Chat",
      desc: "Balas pesan dan pertanyaan pengguna",
    },
    {
      href: "/admin/laporan",
      icon: ChartLineUp,
      title: "Laporan Keuangan",
      desc: "Pantau omzet, arus kas, dan bagi hasil",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Dasbor Admin</h1>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Keluar"
          >
            <SignOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <item.icon className="w-8 h-8 mb-4 text-zinc-900 dark:text-zinc-100" />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
