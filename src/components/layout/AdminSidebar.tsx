"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { 
  ChartLineUp, 
  Storefront, 
  ShieldCheck, 
  ChatCircle,
  Robot,
  TerminalWindow,
  SignOut, 
  ArrowLeft,
  List
} from "@phosphor-icons/react";
import { clearDemoSession } from "@/lib/utils/demo";
import { adminService } from "@/services/admin.service";
import { logsService } from "@/services/logs.service";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Komponen badge angka kecil ───────────────────────────────────────────────
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

export default function AdminSidebar({
  isMobileOpen = false,
  onCloseMobile,
}: {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
} = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Badge dinamis mengikuti jumlah data riil yang membutuhkan tindakan
  const [badges, setBadges] = useState<Record<string, number>>({
    "/admin/verifikasi": 0,
    "/admin/moderasi": 0,
    "/admin/chat": 0,
    "/admin/logs": 0,
  });

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    useAuthStore.getState().initAuth();
  }, []);

  const isUpdatingBadgesRef = useRef(false);
  const lastBadgeUpdateAtRef = useRef(0);

  const updateBadges = useCallback(async (force = false) => {
    const now = Date.now();
    if (isUpdatingBadgesRef.current) return;
    if (!force && now - lastBadgeUpdateAtRef.current < 2500) return;

    isUpdatingBadgesRef.current = true;
    lastBadgeUpdateAtRef.current = now;
    try {
      const [verifRes, reportsRes, deletionsRes, chatRes, logSummaryRes] = await Promise.allSettled([
        adminService.getVerifikasiList(),
        adminService.getModerationReports({ status: "pending", limit: 1 }),
        adminService.getAccountDeletions({ status: "pending", limit: 1 }),
        adminService.getUnreadChatCount(),
        logsService.getSummary({ range: "24h" }),
      ]);

      const nextUpdates: Record<string, number> = {};

      // 1. Verifikasi Toko (sinkron persis dengan status "pending" di /admin/verifikasi)
      if (verifRes.status === "fulfilled") {
        const list = verifRes.value?.data || verifRes.value;
        if (Array.isArray(list)) {
          nextUpdates["/admin/verifikasi"] = list.filter(
            (item: any) =>
              item.is_verified !== 1 &&
              !(
                item.is_verified === 2 ||
                item.rejection_reason ||
                (item.is_verified === 0 && item.is_active === 0)
              )
          ).length;
        }
      } else {
        try {
          const stats = await adminService.getDashboardStats();
          if (stats?.success && typeof stats?.data?.pengajuanTokoBaru !== "undefined") {
            nextUpdates["/admin/verifikasi"] = Number(stats.data.pengajuanTokoBaru);
          }
        } catch {}
      }

      // 2. Moderasi & Keamanan (laporan pelanggaran pending + pengajuan hapus akun pending)
      if (reportsRes.status === "fulfilled" || deletionsRes.status === "fulfilled") {
        const pendingReports =
          reportsRes.status === "fulfilled" && reportsRes.value?.success
            ? Number(reportsRes.value.total ?? (Array.isArray(reportsRes.value.data) ? reportsRes.value.data.length : 0))
            : 0;
        const pendingDeletions =
          deletionsRes.status === "fulfilled" && deletionsRes.value?.success
            ? Number(deletionsRes.value.total ?? (Array.isArray(deletionsRes.value.data) ? deletionsRes.value.data.length : 0))
            : 0;
        nextUpdates["/admin/moderasi"] = pendingReports + pendingDeletions;
      }

      // 3. Live Chat (jumlah pesan belum dibaca di DB)
      if (chatRes.status === "fulfilled" && chatRes.value?.success) {
        nextUpdates["/admin/chat"] = Number(chatRes.value?.data?.unread_count ?? 0);
      }

      // 4. System Logs (critical + error belum diperiksa 15m)
      if (logSummaryRes.status === "fulfilled" && logSummaryRes.value?.success && logSummaryRes.value?.data) {
        nextUpdates["/admin/logs"] = Number(logSummaryRes.value.data.unacknowledgedErrors15m ?? 0);
      }

      if (Object.keys(nextUpdates).length > 0) {
        setBadges((prev) => ({ ...prev, ...nextUpdates }));
      }
    } finally {
      isUpdatingBadgesRef.current = false;
    }
  }, []);

  useEffect(() => {
    updateBadges();

    const handleUpdate = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        updateBadges();
      }
    };
    const handleForceUpdate = () => {
      updateBadges(true);
    };

    const pollInterval = setInterval(handleUpdate, 30000);

    window.addEventListener("focus", handleUpdate);
    document.addEventListener("visibilitychange", handleUpdate);
    window.addEventListener("admin_verifikasi_updated", handleForceUpdate);
    window.addEventListener("admin_moderasi_updated", handleForceUpdate);
    window.addEventListener("admin_logs_updated", handleForceUpdate);
    window.addEventListener("chat_unread_updated", handleForceUpdate);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleUpdate);
      document.removeEventListener("visibilitychange", handleUpdate);
      window.removeEventListener("admin_verifikasi_updated", handleForceUpdate);
      window.removeEventListener("admin_moderasi_updated", handleForceUpdate);
      window.removeEventListener("admin_logs_updated", handleForceUpdate);
      window.removeEventListener("chat_unread_updated", handleForceUpdate);
    };
  }, [pathname, updateBadges]);

  // Real-time update via Pusher untuk chat & log baru (hanya event relevan, tanpa loop!)
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b5fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
    let adminId = user?.id;
    if (!adminId && typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          adminId = Number(parsed?.id || parsed?.userId) || undefined;
        }
      } catch {}
    }

    let pusher: Pusher | null = null;
    try {
      pusher = new Pusher(pusherKey, { cluster: pusherCluster });
      const logsChannel = pusher.subscribe("admin-system-logs");
      const handleLogEvent = (evt: any) => {
        const sev = String(evt?.severity || evt?.level || "").toLowerCase();
        const cat = String(evt?.category || "").toLowerCase();
        const name = String(evt?.eventName || evt?.event_name || "").toLowerCase();
        if (
          sev === "error" ||
          sev === "critical" ||
          cat === "moderation" ||
          name.includes("verif") ||
          name.includes("register_pending") ||
          name.includes("report") ||
          name.includes("deletion")
        ) {
          updateBadges();
        }
      };
      logsChannel.bind("system-log.created", handleLogEvent);
      logsChannel.bind("new-log", handleLogEvent);

      const verifChannel = pusher.subscribe("mitra-verification");
      verifChannel.bind("verification-status-updated", () => updateBadges(true));

      if (adminId) {
        const userChannel = pusher.subscribe(`user-${adminId}`);
        userChannel.bind("new-message", () => updateBadges(true));
        userChannel.bind("order-status-changed", () => updateBadges());
        userChannel.bind("new-paid-order", () => updateBadges());
      }
    } catch {}

    return () => {
      if (pusher) {
        try {
          pusher.disconnect();
        } catch {}
      }
    };
  }, [user?.id, updateBadges]);

  // Otomatis menutup saat zoom > 100%, otomatis membuka saat zoom <= 100%
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
      
      // Patokan: jika zoom > 100% (ambang batas 1.04 untuk 110% ke atas) -> otomatis menutup (collapsed)
      // Jika zoom <= 100% (100%, 90%, 80%, dst.) -> otomatis membuka (expanded)
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
    clearDemoSession();
    logout();
    router.push("/login");
  }

  const navItems = [
    { href: "/admin", icon: ChartLineUp, label: "Dasbor Admin" },
    { href: "/admin/transaksi", icon: Storefront, label: "Transaksi Lintas Toko" },
    { href: "/admin/verifikasi", icon: ShieldCheck, label: "Verifikasi Toko" },
    { href: "/admin/moderasi", icon: ShieldCheck, label: "Moderasi & Keamanan" },
    { href: "/admin/chat", icon: ChatCircle, label: "Live Chat" },
    { href: "/admin/pengaturan-ai", icon: Robot, label: "Pengaturan AI" },
    { href: "/admin/logs", icon: TerminalWindow, label: "System Logs" },
  ];

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
              Dinoyo<span style={{ color: "rgba(255,255,255,0.6)" }}>Craft</span> Admin
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

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const badge = badges[item.href] ?? 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isDrawerMode && onCloseMobile) onCloseMobile();
              }}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: effectiveCollapsed ? "center" : "flex-start",
                padding: effectiveCollapsed ? "0.75rem 0" : "0.75rem 1rem", borderRadius: "0.5rem",
                textDecoration: "none", position: "relative",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.8)",
                fontWeight: isActive ? 700 : 500,
                transition: "background 0.2s",
              }}
            >
              <item.icon size={20} weight={isActive ? "bold" : "regular"} style={{ flexShrink: 0 }} />
              {!effectiveCollapsed && <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.label}>{item.label}</span>}
              {!effectiveCollapsed && <NavBadge count={badge} />}
              {effectiveCollapsed && badge > 0 && (
                <div style={{ position: "absolute", top: 4, right: 12, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
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
