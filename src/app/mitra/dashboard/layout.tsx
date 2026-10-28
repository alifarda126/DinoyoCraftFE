"use client";

import { usePathname, useRouter } from "next/navigation";
import MitraSidebar from "@/components/layout/MitraSidebar";
import { useState, useEffect } from "react";
import { List, X } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/useAuthStore";
import Pusher from "pusher-js";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initAuth, fetchProfile, updateUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initAuth();
    fetchProfile();
  }, [initAuth, fetchProfile]);

  const isVerified = Boolean(
    user && (
      user.is_verified === 1 ||
      user.is_verified === true ||
      user.is_verified === "1" ||
      Number(user.is_verified) === 1
    )
  );

  // 1. Real-time WebSockets via Pusher untuk auto-refresh status verifikasi seketika
  useEffect(() => {
    if (!user?.id) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b0fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

    let pusher: Pusher | null = null;
    let userChannel: any = null;
    let mitraChannel: any = null;

    try {
      pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });

      userChannel = pusher.subscribe(`user-${user.id}`);
      mitraChannel = pusher.subscribe("mitra-verification");

      const handleVerificationUpdate = async (data: any) => {
        console.log("[Pusher Mitra Layout] Event verifikasi diterima:", data);

        // Jika event spesifik punya userId dan tidak cocok, abaikan
        if (data?.userId && Number(data.userId) !== Number(user.id)) {
          return;
        }

        const isApproved = data?.status === "approved" || Number(data?.is_verified) === 1;

        if (isApproved) {
          updateUser({
            is_verified: 1,
            rejection_reason: undefined,
          });
          toast.success("🎉 Selamat! Toko Anda telah resmi disetujui & diverifikasi oleh Admin. Semua fitur dashboard kini aktif sepenuhnya!", {
            duration: 8000,
            id: "mitra-verification-toast",
          });
        } else {
          updateUser({
            is_verified: 2,
            rejection_reason: data?.rejection_reason || "Pengajuan ditolak oleh admin.",
          });
          toast.error(`Pengajuan toko Anda memerlukan perbaikan dokumen: ${data?.rejection_reason || "Silakan periksa detail profil."}`, {
            duration: 8000,
            id: "mitra-verification-toast",
          });
        }

        // Ambil data profil lengkap & broadcast event ke komponen anak
        await fetchProfile();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("mitra-verification-updated", { detail: data }));
        }
      };

      userChannel.bind("verification-status-updated", handleVerificationUpdate);
      mitraChannel.bind("verification-status-updated", handleVerificationUpdate);
    } catch (err) {
      console.warn("Pusher connect warning di SellerLayout:", err);
    }

    return () => {
      if (userChannel) userChannel.unbind_all();
      if (mitraChannel) mitraChannel.unbind_all();
      if (pusher) pusher.disconnect();
    };
  }, [user?.id, updateUser, fetchProfile]);

  // 2. Smart auto-polling ketika status toko belum diverifikasi (fallback jika WebSockets ada delay)
  useEffect(() => {
    if (isVerified || !user || user.role !== "mitra") return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/auth/profile");
        if (!isMounted) return;

        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          const newlyVerified =
            d.is_verified === 1 ||
            d.is_verified === true ||
            d.is_verified === "1" ||
            Number(d.is_verified) === 1;

          if (newlyVerified) {
            updateUser({
              is_verified: 1,
              rejection_reason: undefined,
              name: d.name,
              store_name: d.store_name,
            });
            toast.success("🎉 Selamat! Toko Anda telah resmi diverifikasi oleh Admin. Semua fitur dashboard kini aktif sepenuhnya!", {
              duration: 8000,
              id: "mitra-verification-toast",
            });
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("mitra-verification-updated", { detail: d }));
            }
          } else if (d.rejection_reason && (!user.rejection_reason || user.is_verified !== 2)) {
            updateUser({
              is_verified: 2,
              rejection_reason: d.rejection_reason,
            });
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("mitra-verification-updated", { detail: d }));
            }
          }
        }
      } catch (err) {
        // abaikan error sementara
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isVerified, user, updateUser]);

  // 3. Navigation guard untuk mengunci rute selain profil toko bagi mitra belum terverifikasi
  useEffect(() => {
    setMobileMenuOpen(false);

    if (user && user.role === "mitra" && !isVerified) {
      if (pathname !== "/mitra/dashboard/profil") {
        router.replace("/mitra/dashboard/profil");
      }
    }
  }, [pathname, isVerified, user, router]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-white" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-zinc-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <span className="font-bold text-lg text-zinc-900">Dinoyo<span className="text-zinc-500">Craft</span> Mitra</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-zinc-900">
          {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 h-full flex transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <MitraSidebar />
      </div>

      {/* Main Content */}
      <main className="no-scrollbar flex-1 overflow-y-auto mt-14 md:mt-0 p-6 md:p-8 overscroll-contain">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
