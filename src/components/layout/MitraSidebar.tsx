"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Pusher from "pusher-js";
import {
  Storefront, Package, Receipt, SignOut, ArrowLeft, ChartLineUp,
  IdentificationCard, ChatCircle, User, List, Lock
} from "@phosphor-icons/react";
import { clearDemoSession, getDemoSession } from "@/lib/utils/demo";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function NavBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span style={{
      marginLeft: "auto",
      minWidth: 20,
      height: 20,
      borderRadius: 999,
      background: "#ef4444",
      color: "#fff",
      fontSize: "0.68rem",
      fontWeight: 800,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 5px",
      lineHeight: 1,
      flexShrink: 0,
      boxShadow: "0 1px 4px rgba(239,68,68,0.4)",
    }}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

const resolveSidebarAvatar = (url?: string | null): string | null => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
  if (trimmed.includes("googleusercontent.com") || trimmed.includes("google.com")) {
    return null;
  }
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  const apiHost = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${apiHost}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
};

export default function MitraSidebar({
  isMobileOpen = false,
  onCloseMobile,
}: {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
} = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [session, setSession] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar_url]);

  useEffect(() => {
    useAuthStore.getState().initAuth();
    useAuthStore.getState().fetchProfile();
    setSession(getDemoSession());

    const handleSync = () => {
      useAuthStore.getState().fetchProfile();
    };
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("mitra-verification-updated", handleSync);
    window.addEventListener("mitra_profile_updated", handleSync);
    window.addEventListener("auth_state_changed", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("mitra-verification-updated", handleSync);
      window.removeEventListener("mitra_profile_updated", handleSync);
      window.removeEventListener("auth_state_changed", handleSync);
    };
  }, []);

  // Otomatis menutup saat zoom > 100%, otomatis membuka saat zoom <= 100% (khusus layar desktop >= 768px)
  useEffect(() => {
    function handleZoomAndResize() {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth < 768;
      setIsMobileViewport(mobile);
      if (mobile) {
        setIsCollapsed(false);
        return;
      }
      const ratio = window.outerWidth && window.innerWidth ? window.outerWidth / window.innerWidth : 1;
      if (ratio > 1.04) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    }

    handleZoomAndResize();

    window.addEventListener("resize", handleZoomAndResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleZoomAndResize);
    }

    return () => {
      window.removeEventListener("resize", handleZoomAndResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleZoomAndResize);
      }
    };
  }, []);

  async function handleSignOut() {
    logout();
    clearDemoSession();
    router.push("/login");
  }

  const isVerified = Boolean(
    user && (
      user.is_verified === 1 ||
      user.is_verified === true ||
      user.is_verified === "1" ||
      Number(user.is_verified) === 1
    )
  );
  const isUnverified = user && user.role === "mitra" && !isVerified;

  const [badges, setBadges] = useState<Record<string, number>>({
    "/mitra/dashboard/pesanan": 0,
    "/mitra/dashboard/chat": 0,
  });

  const isUpdatingBadgesRef = useRef(false);
  const lastBadgeUpdateAtRef = useRef(0);

  const updateBadges = useCallback(async (force = false) => {
    const storedToken =
      (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");

    if (!storedToken || !isVerified) {
      setBadges({ "/mitra/dashboard/pesanan": 0, "/mitra/dashboard/chat": 0 });
      return;
    }

    const now = Date.now();
    if (isUpdatingBadgesRef.current) return;
    if (!force && now - lastBadgeUpdateAtRef.current < 2000) return;

    isUpdatingBadgesRef.current = true;
    lastBadgeUpdateAtRef.current = now;
    try {
      const headers = { Authorization: `Bearer ${storedToken}` };
      const [ordersRes, chatRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/mitra/orders`, { headers, withCredentials: true, timeout: 15000 }),
        axios.get(`${API_BASE_URL}/chat/unread-count`, { headers, withCredentials: true, timeout: 15000 }),
      ]);

      const nextUpdates: Record<string, number> = {};

      // 1. Pesanan perlu tindakan mitra (status "paid" / "packed" -> Perlu Dikemas)
      if (ordersRes.status === "fulfilled" && ordersRes.value.data?.success && Array.isArray(ordersRes.value.data?.data)) {
        const needActionCount = ordersRes.value.data.data.filter((item: any) => {
          const st = String(item.status || "").toLowerCase();
          return st === "paid" || st === "packed";
        }).length;
        nextUpdates["/mitra/dashboard/pesanan"] = needActionCount;
      }

      // 2. Live Chat (jumlah pesan belum dibaca)
      if (chatRes.status === "fulfilled" && chatRes.value.data?.success) {
        nextUpdates["/mitra/dashboard/chat"] = Number(chatRes.value.data?.data?.unread_count ?? 0);
      }

      if (Object.keys(nextUpdates).length > 0) {
        setBadges((prev) => ({ ...prev, ...nextUpdates }));
      }
    } finally {
      isUpdatingBadgesRef.current = false;
    }
  }, [isVerified]);

  useEffect(() => {
    updateBadges();

    const handleBadgeUpdate = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        updateBadges();
      }
    };
    const handleForceBadgeUpdate = () => {
      updateBadges(true);
    };

    const pollInterval = setInterval(handleBadgeUpdate, 25000);

    window.addEventListener("focus", handleBadgeUpdate);
    document.addEventListener("visibilitychange", handleBadgeUpdate);
    window.addEventListener("mitra_orders_updated", handleForceBadgeUpdate);
    window.addEventListener("chat_unread_updated", handleForceBadgeUpdate);
    window.addEventListener("mitra-verification-updated", handleForceBadgeUpdate);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleBadgeUpdate);
      document.removeEventListener("visibilitychange", handleBadgeUpdate);
      window.removeEventListener("mitra_orders_updated", handleForceBadgeUpdate);
      window.removeEventListener("chat_unread_updated", handleForceBadgeUpdate);
      window.removeEventListener("mitra-verification-updated", handleForceBadgeUpdate);
    };
  }, [pathname, updateBadges]);

  // Real-time update via Pusher untuk pesan & pesanan baru
  useEffect(() => {
    if (!user?.id || !isVerified) return;
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b5fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
    let pusher: Pusher | null = null;
    try {
      pusher = new Pusher(pusherKey, { cluster: pusherCluster });
      const userChannel = pusher.subscribe(`user-${user.id}`);
      userChannel.bind("new-message", updateBadges);
      userChannel.bind("order-status-updated", updateBadges);
      userChannel.bind("new-order", updateBadges);
    } catch {}

    return () => {
      if (pusher) {
        try {
          pusher.disconnect();
        } catch {}
      }
    };
  }, [user?.id, isVerified, updateBadges]);

  const navItems = [
    { href: "/mitra/dashboard/profil", icon: User, label: "Profil Toko" },
    { href: "/mitra/dashboard", icon: Storefront, label: "Beranda Toko" },
    { href: "/mitra/dashboard/katalog", icon: Package, label: "Katalog Produk" },
    { href: "/mitra/dashboard/pesanan", icon: Receipt, label: "Pesanan" },
    { href: "/mitra/dashboard/laporan-keuangan", icon: ChartLineUp, label: "Laporan Keuangan" },
    { href: "/mitra/dashboard/chat", icon: ChatCircle, label: "Live Chat" },
  ];

  const sellerName = user?.store_name || user?.name || session?.profile?.full_name || "Mitra";
  const initials = sellerName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const avatarUrl = resolveSidebarAvatar(user?.avatar_url);
  const isDrawerMode = isMobileOpen || isMobileViewport;
  const effectiveCollapsed = isDrawerMode ? false : isCollapsed;

  const handleToggleSidebar = () => {
    if (onCloseMobile && (isMobileOpen || (typeof window !== "undefined" && window.innerWidth < 768))) {
      onCloseMobile();
      return;
    }
    setIsCollapsed((prev) => !prev);
  };

  return (
    <aside style={{
      width: effectiveCollapsed ? "80px" : "280px", 
      background: "var(--surface-dark)", 
      borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column", padding: "1.5rem 1rem", flexShrink: 0,
      overflowY: "auto", overflowX: "hidden", overscrollBehavior: "none",
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: effectiveCollapsed ? "center" : "space-between", marginBottom: "2rem" }}>
        {!effectiveCollapsed && (
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <ArrowLeft size={16} color="rgba(255,255,255,0.6)" />
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#ffffff", whiteSpace: "nowrap" }}>
              Dinoyo<span style={{ color: "rgba(255,255,255,0.6)" }}>Craft</span> Mitra
            </span>
          </Link>
        )}
        <button 
          type="button"
          onClick={handleToggleSidebar}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.25rem", flexShrink: 0 }}
        >
          <List size={24} weight="bold" />
        </button>
      </div>

      {/* Profil Toko mini */}
      <Link
        href={isUnverified ? "/mitra/dashboard/profil" : "/mitra/dashboard/toko-saya"}
        onClick={() => {
          if (isDrawerMode && onCloseMobile) onCloseMobile();
        }}
        style={{
          display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: effectiveCollapsed ? "center" : "flex-start",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.75rem", padding: effectiveCollapsed ? "0.75rem 0" : "0.75rem", marginBottom: "1.5rem",
          cursor: "pointer", textAlign: "left", transition: "background 0.2s",
          textDecoration: "none",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)")}
      >
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: avatarUrl && !avatarError ? "transparent" : "linear-gradient(135deg, var(--clay), #c0673d)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: "0.8rem", fontWeight: 800, color: "#fff",
          overflow: "hidden",
        }}>
          {avatarUrl && !avatarError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt={sellerName}
              onError={() => setAvatarError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>
        {!effectiveCollapsed && (
          <>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {sellerName}
              </p>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", margin: 0, whiteSpace: "nowrap" }}>
                {isUnverified ? "Verifikasi Profil" : "Toko Saya"}
              </p>
            </div>
            <IdentificationCard size={16} color="rgba(255,255,255,0.4)" style={{ marginLeft: "auto", flexShrink: 0 }} />
          </>
        )}
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isItemLocked = isUnverified && item.href !== "/mitra/dashboard/profil";

          const handleClick = (e: React.MouseEvent) => {
            if (isItemLocked) {
              e.preventDefault();
              toast.info("Menu ini masih terkunci. Akun toko Anda sedang menunggu atau memerlukan verifikasi.");
              return;
            }
            if (isDrawerMode && onCloseMobile) {
              onCloseMobile();
            }
          };

          return (
            <Link 
              key={item.href} 
              href={isItemLocked ? "/mitra/dashboard/profil" : item.href} 
              onClick={handleClick}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: effectiveCollapsed ? "center" : "flex-start",
                padding: effectiveCollapsed ? "0.75rem 0" : "0.75rem 1rem", borderRadius: "0.5rem",
                textDecoration: "none", position: "relative",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isItemLocked ? "rgba(255,255,255,0.35)" : isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                fontWeight: isActive ? 700 : 500,
                cursor: isItemLocked ? "not-allowed" : "pointer",
                transition: "background 0.2s, color 0.2s",
                opacity: isItemLocked ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (!isActive && !isItemLocked) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive && !isItemLocked) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <item.icon size={20} weight={isActive ? "bold" : "regular"} style={{ flexShrink: 0 }} />
              {!effectiveCollapsed && (
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.label}>
                  {item.label}
                </span>
              )}
              
              {isItemLocked && !effectiveCollapsed && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.2rem",
                  fontSize: "0.62rem", color: "rgba(255,255,255,0.45)",
                  background: "rgba(255,255,255,0.08)", padding: "0.15rem 0.4rem",
                  borderRadius: "0.35rem", fontWeight: 600,
                }}>
                  <Lock size={10} weight="bold" /> Terkunci
                </span>
              )}

              {!isItemLocked && !effectiveCollapsed && <NavBadge count={badges[item.href] ?? 0} />}

              {effectiveCollapsed && !isItemLocked && (badges[item.href] ?? 0) > 0 && (
                <div style={{ position: "absolute", top: 4, right: 12, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
              )}
              
              {effectiveCollapsed && isItemLocked && (
                <div style={{ position: "absolute", top: 6, right: 10 }}>
                  <Lock size={10} color="rgba(255,255,255,0.4)" weight="bold" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <button onClick={handleSignOut} style={{
        display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: effectiveCollapsed ? "center" : "flex-start",
        padding: effectiveCollapsed ? "0.75rem 0" : "0.75rem 1rem", borderRadius: "0.5rem",
        border: "none", background: "transparent", color: "#ef4444",
        fontWeight: 600, cursor: "pointer", textAlign: "left",
        fontFamily: "var(--font-outfit), sans-serif",
      }}>
        <SignOut size={20} style={{ flexShrink: 0 }} />
        {!effectiveCollapsed && <span style={{ whiteSpace: "nowrap" }}>Keluar</span>}
      </button>
    </aside>
  );
}
