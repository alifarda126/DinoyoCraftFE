"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Pusher from "pusher-js";
import { toast } from "sonner";
import {
  TerminalWindow,
  WarningOctagon,
  WarningCircle,
  Warning,
  CheckCircle,
  Info,
  Bug,
  Play,
  Pause,
  ArrowsClockwise,
  DownloadSimple,
  Trash,
  ArrowCounterClockwise,
  MagnifyingGlass,
  Funnel,
  X,
  Copy,
  Check,
  ShieldWarning,
  LinkSimple,
  Clock,
  Pulse,
  CaretDown,
} from "@phosphor-icons/react";
import {
  logsService,
  SystemLogItem,
  LogSeverity,
  LogFilterParams,
  LogsSummaryData,
} from "@/services/logs.service";
import { getDemoSession } from "@/lib/utils/demo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const CATEGORY_TABS = [
  { id: "all", label: "Live Logs" },
  { id: "auth", label: "Auth" },
  { id: "transaction", label: "Transaction" },
  { id: "order", label: "Order" },
  { id: "product_store", label: "Product & Store" },
  { id: "cart_address", label: "Cart & Address" },
  { id: "chat", label: "Chat" },
  { id: "notification", label: "Notification" },
  { id: "moderation", label: "Moderation" },
  { id: "ai", label: "AI" },
  { id: "external", label: "External" },
  { id: "mobile", label: "Mobile" },
  { id: "system", label: "System" },
  { id: "admin_audit", label: "Admin Audit" },
] as const;

const TIME_RANGES = [
  { id: "live", label: "Live" },
  { id: "24h", label: "24 jam" },
  { id: "7d", label: "7 hari" },
  { id: "30d", label: "1 bulan" },
  { id: "custom", label: "Kustom" },
] as const;

const SEVERITY_OPTIONS: { id: LogSeverity; label: string }[] = [
  { id: "critical", label: "Critical" },
  { id: "error", label: "Error" },
  { id: "warning", label: "Warning" },
  { id: "info", label: "Info" },
  { id: "success", label: "Success" },
  { id: "debug", label: "Debug" },
];

function formatWibTime(iso?: string | null, fullDate = true): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: fullDate ? "2-digit" : undefined,
      month: fullDate ? "short" : undefined,
      year: fullDate ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return `${formatter.format(d)} WIB`;
  } catch {
    return String(iso);
  }
}

function getHttpReasonLabel(statusCode?: number | null): string {
  if (!statusCode || statusCode === 0) return "EVENT";
  if (statusCode === 401) return "401 Unauthorized";
  if (statusCode === 403) return "403 Forbidden";
  if (statusCode === 404) return "404 Not Found";
  if (statusCode === 422) return "422 Invalid Data";
  if (statusCode === 429) return "429 Rate Limit";
  return String(statusCode);
}

/**
 * Badge Status HTTP sesuai PRD §7:
 * - 2xx: chip hijau (#16A34A), angka status berwarna putih (#FFFFFF)
 * - 3xx: chip biru
 * - 4xx: chip amber/oranye dengan label manusiawi
 * - 5xx: chip merah
 * - 0 / tanpa HTTP: mengikuti severity
 */
function HttpStatusChip({
  statusCode,
  severity,
}: {
  statusCode?: number | null;
  severity: LogSeverity;
}) {
  const code = statusCode ?? 0;

  if (code >= 200 && code < 300) {
    return (
      <span
        style={{
          backgroundColor: "#16A34A",
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: "0.72rem",
          padding: "0.2rem 0.55rem",
          borderRadius: "999px",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          whiteSpace: "nowrap",
        }}
      >
        <CheckCircle size={13} weight="bold" color="#FFFFFF" />
        {code}
      </span>
    );
  }

  if (code >= 300 && code < 400) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white whitespace-nowrap">
        <Info size={13} weight="bold" />
        {code}
      </span>
    );
  }

  if (code >= 400 && code < 500) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
        <Warning size={13} weight="bold" />
        {getHttpReasonLabel(code)}
      </span>
    );
  }

  if (code >= 500) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white whitespace-nowrap">
        <WarningOctagon size={13} weight="bold" />
        {code}
      </span>
    );
  }

  // Non-HTTP event (statusCode = 0)
  const sevMap: Record<LogSeverity, { bg: string; text: string; label: string }> = {
    critical: { bg: "#7F1D1D", text: "#FCA5A5", label: "CRITICAL" },
    error: { bg: "#FEE2E2", text: "#DC2626", label: "ERR" },
    warning: { bg: "#FEF3C7", text: "#B45309", label: "WARN" },
    info: { bg: "#DBEAFE", text: "#1D4ED8", label: "EVENT" },
    success: { bg: "#16A34A", text: "#FFFFFF", label: "OK" },
    debug: { bg: "#F4F4F5", text: "#52525B", label: "DBG" },
  };
  const cfg = sevMap[severity] || sevMap.info;

  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        fontWeight: 700,
        fontSize: "0.7rem",
        padding: "0.2rem 0.55rem",
        borderRadius: "999px",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

/**
 * Badge Severity dengan Icon + Teks (Aksesibilitas §7 & §13)
 */
function SeverityBadge({ severity }: { severity: LogSeverity }) {
  switch (severity) {
    case "critical":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold bg-red-950 text-red-200 border border-red-700">
          <WarningOctagon size={14} weight="fill" className="text-red-400" />
          CRITICAL
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <WarningCircle size={14} weight="fill" className="text-red-600" />
          ERROR
        </span>
      );
    case "warning":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Warning size={14} weight="fill" className="text-amber-600" />
          WARNING
        </span>
      );
    case "success":
      return (
        <span
          style={{ backgroundColor: "#16A34A", color: "#FFFFFF" }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold"
        >
          <CheckCircle size={14} weight="fill" color="#FFFFFF" />
          SUCCESS
        </span>
      );
    case "debug":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
          <Bug size={14} />
          DEBUG
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Info size={14} weight="fill" className="text-blue-600" />
          INFO
        </span>
      );
  }
}

function AdminSystemLogsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State Filter dari URL (§8.3)
  const [range, setRange] = useState<"live" | "24h" | "7d" | "30d" | "custom">(
    (searchParams.get("range") as any) || "live"
  );
  const [category, setCategory] = useState<string>(searchParams.get("category") || "all");
  const [selectedSeverities, setSelectedSeverities] = useState<LogSeverity[]>(() => {
    const raw = searchParams.get("severity");
    return raw ? (raw.split(",") as LogSeverity[]) : [];
  });
  const [statusCodeFilter, setStatusCodeFilter] = useState<string>(
    searchParams.get("statusCode") || "all"
  );
  const [sourceFilter, setSourceFilter] = useState<string>(searchParams.get("source") || "all");
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get("role") || "all");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("query") || "");
  const [requestIdFilter, setRequestIdFilter] = useState<string>(
    searchParams.get("requestId") || ""
  );
  const [orderIdFilter, setOrderIdFilter] = useState<string>(searchParams.get("orderId") || "");
  const [transactionIdFilter, setTransactionIdFilter] = useState<string>(
    searchParams.get("transactionId") || ""
  );
  const [userIdFilter, setUserIdFilter] = useState<string>(searchParams.get("userId") || "");
  const [customFrom, setCustomFrom] = useState<string>(searchParams.get("from") || "");
  const [customTo, setCustomTo] = useState<string>(searchParams.get("to") || "");
  const [onlyDeleted, setOnlyDeleted] = useState<boolean>(
    searchParams.get("onlyDeleted") === "true"
  );

  // State Data & UI
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [summary, setSummary] = useState<LogsSummaryData | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // State Real-Time Stream & Pause (§8.4)
  const [connectionState, setConnectionState] = useState<
    "Live" | "Reconnecting" | "Polling fallback" | "Offline"
  >("Live");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pausedBuffer, setPausedBuffer] = useState<SystemLogItem[]>([]);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const latestOccurredAtRef = useRef<string | null>(null);

  // State Pilihan Baris, Drawer Detail, dan Modal Konfirmasi (§8.2, §8.5)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeLog, setActiveLog] = useState<SystemLogItem | null>(null);
  const [activeLogLoading, setActiveLogLoading] = useState<boolean>(false);
  const [relatedLogs, setRelatedLogs] = useState<SystemLogItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Modal Hapus / Purge
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    mode: "single" | "selected" | "filter" | "purge";
    targetEventId?: string;
    count: number;
  }>({ open: false, mode: "single", count: 0 });
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>("");
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Sinkronisasi filter ke URL agar persisten saat halaman dimuat ulang (§8.3)
  useEffect(() => {
    const params = new URLSearchParams();
    if (range && range !== "live") params.set("range", range);
    if (category && category !== "all") params.set("category", category);
    if (selectedSeverities.length > 0) params.set("severity", selectedSeverities.join(","));
    if (statusCodeFilter && statusCodeFilter !== "all") params.set("statusCode", statusCodeFilter);
    if (sourceFilter && sourceFilter !== "all") params.set("source", sourceFilter);
    if (roleFilter && roleFilter !== "all") params.set("role", roleFilter);
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (requestIdFilter.trim()) params.set("requestId", requestIdFilter.trim());
    if (orderIdFilter.trim()) params.set("orderId", orderIdFilter.trim());
    if (transactionIdFilter.trim()) params.set("transactionId", transactionIdFilter.trim());
    if (userIdFilter.trim()) params.set("userId", userIdFilter.trim());
    if (range === "custom" && customFrom) params.set("from", customFrom);
    if (range === "custom" && customTo) params.set("to", customTo);
    if (onlyDeleted) params.set("onlyDeleted", "true");

    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [
    range,
    category,
    selectedSeverities,
    statusCodeFilter,
    sourceFilter,
    roleFilter,
    searchQuery,
    requestIdFilter,
    orderIdFilter,
    transactionIdFilter,
    userIdFilter,
    customFrom,
    customTo,
    onlyDeleted,
    pathname,
    router,
  ]);

  const currentFilterParams = useMemo<LogFilterParams>(
    () => ({
      range,
      category: category === "all" ? undefined : category,
      severity: selectedSeverities.length > 0 ? selectedSeverities.join(",") : undefined,
      statusCode: statusCodeFilter === "all" ? undefined : statusCodeFilter,
      source: sourceFilter === "all" ? undefined : sourceFilter,
      role: roleFilter === "all" ? undefined : roleFilter,
      query: searchQuery.trim() || undefined,
      requestId: requestIdFilter.trim() || undefined,
      orderId: orderIdFilter.trim() || undefined,
      transactionId: transactionIdFilter.trim() || undefined,
      userId: userIdFilter.trim() || undefined,
      from: range === "custom" && customFrom ? customFrom : undefined,
      to: range === "custom" && customTo ? customTo : undefined,
      onlyDeleted: onlyDeleted || undefined,
      limit: 100,
    }),
    [
      range,
      category,
      selectedSeverities,
      statusCodeFilter,
      sourceFilter,
      roleFilter,
      searchQuery,
      requestIdFilter,
      orderIdFilter,
      transactionIdFilter,
      userIdFilter,
      customFrom,
      customTo,
      onlyDeleted,
    ]
  );

  // Fungsi pencocokan filter di sisi client untuk event real-time Pusher (§8.4)
  const matchesActiveFilter = useCallback(
    (item: SystemLogItem): boolean => {
      if (onlyDeleted) return Boolean(item.deletedAt);
      if (item.deletedAt) return false;
      if (category !== "all" && item.category !== category) return false;
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(item.severity)) {
        return false;
      }
      if (statusCodeFilter !== "all") {
        const code = item.http?.statusCode ?? 0;
        if (statusCodeFilter === "2xx" && !(code >= 200 && code < 300)) return false;
        if (statusCodeFilter === "3xx" && !(code >= 300 && code < 400)) return false;
        if (statusCodeFilter === "4xx" && !(code >= 400 && code < 500)) return false;
        if (statusCodeFilter === "5xx" && !(code >= 500 && code < 600)) return false;
        if (statusCodeFilter === "0" && code !== 0) return false;
      }
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
      if (roleFilter !== "all" && item.correlation?.role !== roleFilter) return false;
      if (
        requestIdFilter.trim() &&
        !item.correlation?.requestId?.toLowerCase().includes(requestIdFilter.trim().toLowerCase())
      ) {
        return false;
      }
      if (orderIdFilter.trim() && String(item.correlation?.orderId || "") !== orderIdFilter.trim()) {
        return false;
      }
      if (
        transactionIdFilter.trim() &&
        String(item.correlation?.transactionId || "") !== transactionIdFilter.trim() &&
        !item.correlation?.referenceCode
          ?.toLowerCase()
          .includes(transactionIdFilter.trim().toLowerCase())
      ) {
        return false;
      }
      if (userIdFilter.trim() && String(item.correlation?.userId || "") !== userIdFilter.trim()) {
        return false;
      }
      if (searchQuery.trim()) {
        const kw = searchQuery.trim().toLowerCase();
        const hay = `${item.message} ${item.eventName} ${item.http?.route || ""} ${item.eventId} ${
          item.correlation?.requestId || ""
        }`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    },
    [
      onlyDeleted,
      category,
      selectedSeverities,
      statusCodeFilter,
      sourceFilter,
      roleFilter,
      requestIdFilter,
      orderIdFilter,
      transactionIdFilter,
      userIdFilter,
      searchQuery,
    ]
  );

  // Muat daftar log & ringkasan dari Backend
  const fetchLogsAndSummary = useCallback(
    async (isReset = true) => {
      if (isReset) {
        setLoading(true);
        setLoadError(null);
      }
      try {
        const [logsRes, summaryRes] = await Promise.all([
          logsService.getLogs(currentFilterParams),
          logsService.getSummary(currentFilterParams),
        ]);

        if (logsRes?.success && logsRes?.data) {
          const items: SystemLogItem[] = logsRes.data.items || [];
          seenEventIdsRef.current = new Set(items.map((i) => i.eventId));
          if (items.length > 0) {
            latestOccurredAtRef.current = items[0].occurredAt;
          }
          setLogs(items);
          setNextCursor(logsRes.data.nextCursor || null);
          setHasMore(Boolean(logsRes.data.hasMore));
          setLastUpdated(new Date().toISOString());
          setAccessDenied(false);
        }

        if (summaryRes?.success && summaryRes?.data) {
          setSummary(summaryRes.data);
          window.dispatchEvent(new Event("admin_logs_updated"));
        }
      } catch (err: any) {
        if (err?.response?.status === 403) {
          setAccessDenied(true);
        } else {
          setLoadError(
            err?.response?.data?.message ||
              err?.message ||
              "Gagal memuat data log dari server. Data sebelumnya tetap dipertahankan."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [currentFilterParams]
  );

  useEffect(() => {
    fetchLogsAndSummary(true);
  }, [fetchLogsAndSummary]);

  // Muat halaman berikutnya (Cursor Pagination §9.2)
  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await logsService.getLogs({
        ...currentFilterParams,
        cursor: nextCursor,
      });
      if (res?.success && res?.data?.items) {
        const moreItems: SystemLogItem[] = res.data.items;
        setLogs((prev) => {
          const merged = [...prev];
          for (const item of moreItems) {
            if (!seenEventIdsRef.current.has(item.eventId)) {
              seenEventIdsRef.current.add(item.eventId);
              merged.push(item);
            }
          }
          return merged;
        });
        setNextCursor(res.data.nextCursor || null);
        setHasMore(Boolean(res.data.hasMore));
      }
    } catch {
      toast.error("Gagal memuat halaman log berikutnya");
    } finally {
      setLoadingMore(false);
    }
  };

  // Delta Catch-Up saat Reconnect / Polling Fallback (§8.4)
  const fetchDeltaLogs = useCallback(async () => {
    if (onlyDeleted || (range !== "live" && range !== "24h")) return;
    try {
      const res = await logsService.getLogs({
        ...currentFilterParams,
        since: latestOccurredAtRef.current || undefined,
        limit: 50,
      });
      if (res?.success && Array.isArray(res?.data?.items) && res.data.items.length > 0) {
        const fresh: SystemLogItem[] = res.data.items.filter(
          (it: SystemLogItem) => !seenEventIdsRef.current.has(it.eventId)
        );
        if (fresh.length > 0) {
          fresh.forEach((it) => seenEventIdsRef.current.add(it.eventId));
          latestOccurredAtRef.current = fresh[0].occurredAt;
          setLastUpdated(new Date().toISOString());
          if (isPaused) {
            setPausedBuffer((prev) => [...fresh, ...prev]);
          } else {
            setLogs((prev) => [...fresh, ...prev].slice(0, 200));
          }
        }
      }
    } catch {}
  }, [currentFilterParams, isPaused, onlyDeleted, range]);

  // Integrasi Pusher Real-Time + Reconnect Catch-Up + Polling Fallback (§8.4)
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b0fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || (getDemoSession() as any)?.token
        : null;

    let pusher: Pusher | null = null;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    const handleIncomingEvent = (rawEvent: SystemLogItem) => {
      if (!rawEvent || !rawEvent.eventId) return;
      if (seenEventIdsRef.current.has(rawEvent.eventId)) return;
      seenEventIdsRef.current.add(rawEvent.eventId);
      latestOccurredAtRef.current = rawEvent.occurredAt || new Date().toISOString();
      setLastUpdated(new Date().toISOString());

      // Perbarui angka ringkasan secara reaktif
      setSummary((prev) => {
        if (!prev) return prev;
        const sev = rawEvent.severity || "info";
        return {
          ...prev,
          totalEvents: prev.totalEvents + 1,
          counts: {
            ...prev.counts,
            [sev]: (prev.counts[sev as keyof typeof prev.counts] || 0) + 1,
          },
        };
      });

      if (!matchesActiveFilter(rawEvent)) return;

      if (isPaused || range !== "live") {
        setPausedBuffer((prev) => [rawEvent, ...prev]);
      } else {
        setLogs((prev) => [rawEvent, ...prev].slice(0, 150));
      }
    };

    try {
      pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        channelAuthorization: {
          endpoint: `${API_BASE_URL}/admin/logs/pusher-auth`,
          transport: "ajax",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      });

      pusher.connection.bind("connected", () => {
        setConnectionState("Live");
        fetchDeltaLogs();
      });

      pusher.connection.bind("connecting", () => {
        setConnectionState("Reconnecting");
      });

      pusher.connection.bind("unavailable", () => {
        setConnectionState("Polling fallback");
      });

      pusher.connection.bind("error", () => {
        setConnectionState("Polling fallback");
      });

      const privateChannel = pusher.subscribe("private-admin-system-logs");
      privateChannel.bind("system-log.created", handleIncomingEvent);

      const publicAdminChannel = pusher.subscribe("admin-system-logs");
      publicAdminChannel.bind("system-log.created", handleIncomingEvent);
    } catch {
      setConnectionState("Polling fallback");
    }

    // Polling fallback setiap 10 detik (§8.4)
    fallbackTimer = setInterval(() => {
      fetchDeltaLogs();
    }, 10_000);

    return () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      if (pusher) {
        try {
          pusher.unsubscribe("private-admin-system-logs");
          pusher.unsubscribe("admin-system-logs");
          pusher.disconnect();
        } catch {}
      }
    };
  }, [fetchDeltaLogs, isPaused, matchesActiveFilter, range]);

  // Buka Drawer Detail & Muat Detail Lengkap + Chain Korelasi (§8.2)
  const openLogDetail = async (item: SystemLogItem) => {
    setActiveLog(item);
    setActiveLogLoading(true);
    setRelatedLogs([]);
    try {
      const [detailRes, relatedRes] = await Promise.all([
        logsService.getLogDetail(item.eventId),
        logsService.getRelatedLogs(item.eventId),
      ]);
      if (detailRes?.success && detailRes?.data) {
        setActiveLog(detailRes.data);
      }
      if (relatedRes?.success && Array.isArray(relatedRes?.data)) {
        setRelatedLogs(relatedRes.data);
      }
    } catch {
      toast.error("Gagal memuat detail lengkap log");
    } finally {
      setActiveLogLoading(false);
    }
  };

  // Tutup drawer dengan tombol Escape (Aksesibilitas §13)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLog(null);
        setDeleteModal((prev) => ({ ...prev, open: false }));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fungsi Salin Teks / Request ID
  const handleCopy = (text: string, label = "ID") => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`${label} disalin ke clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Acknowledge Error/Critical (§11)
  const handleAcknowledge = async (eventId: string) => {
    try {
      const res = await logsService.acknowledgeLog(eventId);
      if (res?.success) {
        toast.success("Log ditandai telah diperiksa (Acknowledged)");
        const ackTime = new Date().toISOString();
        setLogs((prev) =>
          prev.map((l) => (l.eventId === eventId ? { ...l, acknowledgedAt: ackTime } : l))
        );
        if (activeLog?.eventId === eventId) {
          setActiveLog((prev) => (prev ? { ...prev, acknowledgedAt: ackTime } : null));
        }
        fetchLogsAndSummary(false);
      }
    } catch {
      toast.error("Gagal menandai log");
    }
  };

  // Ekspor CSV (§8.5)
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const filename = await logsService.exportCsv(currentFilterParams);
      toast.success(`Berhasil mengunduh ${filename}`);
      fetchLogsAndSummary(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengekspor log ke CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // Gabungkan buffer saat Resume atau klik banner event baru (§8.4)
  const handleFlushPausedBuffer = () => {
    if (pausedBuffer.length > 0) {
      setLogs((prev) => [...pausedBuffer, ...prev].slice(0, 150));
      setPausedBuffer([]);
    }
    setIsPaused(false);
  };

  // Toggle Severity Multi-pilih
  const toggleSeverity = (sev: LogSeverity) => {
    setSelectedSeverities((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
    );
  };

  // Reset Semua Filter (§8.6)
  const handleResetFilters = () => {
    setRange("live");
    setCategory("all");
    setSelectedSeverities([]);
    setStatusCodeFilter("all");
    setSourceFilter("all");
    setRoleFilter("all");
    setSearchQuery("");
    setRequestIdFilter("");
    setOrderIdFilter("");
    setTransactionIdFilter("");
    setUserIdFilter("");
    setCustomFrom("");
    setCustomTo("");
    setOnlyDeleted(false);
    setSelectedIds(new Set());
  };

  // Eksekusi Hapus / Bulk Delete / Purge (§8.5)
  const executeDeleteAction = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.mode === "single" && deleteModal.targetEventId) {
        await logsService.softDeleteLog(deleteModal.targetEventId, deleteReason || undefined);
        toast.success("Log dipindahkan ke tempat sampah (dapat dipulihkan 30 hari)");
        if (activeLog?.eventId === deleteModal.targetEventId) setActiveLog(null);
      } else if (deleteModal.mode === "selected") {
        const ids = Array.from(selectedIds);
        await logsService.bulkDeleteLogs({
          eventIds: ids,
          confirmText: deleteConfirmText.trim(),
          reason: deleteReason || "Hapus pilihan oleh Admin",
        });
        toast.success(`${ids.length} log dipindahkan ke tempat sampah`);
        setSelectedIds(new Set());
      } else if (deleteModal.mode === "filter") {
        await logsService.bulkDeleteLogs({
          filter: currentFilterParams,
          confirmText: deleteConfirmText.trim(),
          reason: deleteReason || "Hapus hasil filter oleh Admin",
        });
        toast.success("Seluruh log pada filter aktif dipindahkan ke tempat sampah");
      } else if (deleteModal.mode === "purge" && deleteModal.targetEventId) {
        await logsService.purgeLog(deleteModal.targetEventId, deleteConfirmText.trim());
        toast.success("Log telah dihapus secara permanen (Purged)");
        if (activeLog?.eventId === deleteModal.targetEventId) setActiveLog(null);
      }
      setDeleteModal({ open: false, mode: "single", count: 0 });
      setDeleteConfirmText("");
      setDeleteReason("");
      fetchLogsAndSummary(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memproses penghapusan log");
    } finally {
      setIsDeleting(false);
    }
  };

  // Pulihkan Log Soft-Deleted (§8.5)
  const handleRestoreLog = async (eventId: string) => {
    try {
      await logsService.restoreLog(eventId);
      toast.success("Log berhasil dipulihkan ke daftar aktif");
      if (activeLog?.eventId === eventId) setActiveLog(null);
      fetchLogsAndSummary(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memulihkan log");
    }
  };

  if (accessDenied) {
    return (
      <div className="p-10 bg-red-50 border border-red-200 rounded-2xl text-center my-8">
        <ShieldWarning size={48} weight="duotone" className="text-red-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-red-900">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-sm text-red-700 mt-1">
          Halaman System Logs & Live Monitoring hanya dapat diakses oleh akun dengan peran{" "}
          <strong>Admin</strong>.
        </p>
      </div>
    );
  }

  const requiredBulkConfirm = `HAPUS ${deleteModal.count}`;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER & STATUS REAL-TIME (§8.2) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
              <TerminalWindow size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                  System Logs &amp; Live Monitoring
                </h1>
                {/* Indikator Koneksi Real-Time */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    connectionState === "Live" && !isPaused
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : connectionState === "Reconnecting"
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-zinc-100 text-zinc-700 border-zinc-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connectionState === "Live" && !isPaused
                        ? "bg-emerald-500 animate-pulse"
                        : connectionState === "Reconnecting"
                        ? "bg-amber-500 animate-ping"
                        : "bg-zinc-500"
                    }`}
                  />
                  {isPaused ? "Paused" : connectionState}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                <Clock size={13} />
                Pembaruan terakhir: <strong>{formatWibTime(lastUpdated)}</strong> • Data sensitif
                (password, OTP, token, isi chat) disamarkan otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Kontrol Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (isPaused) {
                handleFlushPausedBuffer();
              } else {
                setIsPaused(true);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition ${
              isPaused
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {isPaused ? <Play size={15} weight="fill" /> : <Pause size={15} weight="fill" />}
            {isPaused ? "Resume Live" : "Pause Stream"}
          </button>

          <button
            type="button"
            onClick={() => fetchLogsAndSummary(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 transition"
          >
            <ArrowsClockwise size={15} weight="bold" className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting || logs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            <DownloadSimple size={15} weight="bold" />
            {isExporting ? "Mengekspor..." : "Ekspor CSV"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedIds.size > 0) {
                setDeleteModal({
                  open: true,
                  mode: "selected",
                  count: selectedIds.size,
                });
              } else {
                setDeleteModal({
                  open: true,
                  mode: "filter",
                  count: logs.length,
                });
              }
            }}
            disabled={logs.length === 0 || onlyDeleted}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-40 transition"
          >
            <Trash size={15} weight="bold" />
            {selectedIds.size > 0 ? `Hapus (${selectedIds.size})` : "Hapus Hasil Filter"}
          </button>
        </div>
      </div>

      {/* 2. KARTU RINGKASAN 24 JAM / RENTANG AKTIF (§8.2) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <button
          type="button"
          onClick={() => toggleSeverity("critical")}
          className={`text-left p-4 rounded-xl border transition ${
            selectedSeverities.includes("critical")
              ? "bg-red-950 text-white border-red-700 ring-2 ring-red-500"
              : "bg-white border-zinc-200 hover:border-red-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedSeverities.includes("critical") ? "text-red-200" : "text-red-800"
              }`}
            >
              Critical
            </span>
            <WarningOctagon
              size={20}
              weight="fill"
              className={selectedSeverities.includes("critical") ? "text-red-300" : "text-red-600"}
            />
          </div>
          <div className="text-2xl font-extrabold mt-1">
            {summary?.counts.critical ?? 0}
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              selectedSeverities.includes("critical") ? "text-red-200" : "text-zinc-500"
            }`}
          >
            Klik untuk memfilter
          </p>
        </button>

        <button
          type="button"
          onClick={() => toggleSeverity("error")}
          className={`text-left p-4 rounded-xl border transition ${
            selectedSeverities.includes("error")
              ? "bg-red-600 text-white border-red-700 ring-2 ring-red-400"
              : "bg-white border-zinc-200 hover:border-red-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedSeverities.includes("error") ? "text-red-100" : "text-red-600"
              }`}
            >
              Error (5xx)
            </span>
            <WarningCircle
              size={20}
              weight="fill"
              className={selectedSeverities.includes("error") ? "text-white" : "text-red-500"}
            />
          </div>
          <div className="text-2xl font-extrabold mt-1">
            {summary?.counts.error ?? 0}
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              selectedSeverities.includes("error") ? "text-red-100" : "text-zinc-500"
            }`}
          >
            {summary?.unacknowledgedErrors15m ?? 0} belum diperiksa (15m)
          </p>
        </button>

        <button
          type="button"
          onClick={() => toggleSeverity("warning")}
          className={`text-left p-4 rounded-xl border transition ${
            selectedSeverities.includes("warning")
              ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300"
              : "bg-white border-zinc-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedSeverities.includes("warning") ? "text-amber-50" : "text-amber-700"
              }`}
            >
              Warning (4xx)
            </span>
            <Warning
              size={20}
              weight="fill"
              className={selectedSeverities.includes("warning") ? "text-white" : "text-amber-500"}
            />
          </div>
          <div className="text-2xl font-extrabold mt-1">
            {summary?.counts.warning ?? 0}
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              selectedSeverities.includes("warning") ? "text-amber-50" : "text-zinc-500"
            }`}
          >
            Validasi, 401/404, fallback
          </p>
        </button>

        <button
          type="button"
          onClick={() => toggleSeverity("success")}
          className={`text-left p-4 rounded-xl border transition ${
            selectedSeverities.includes("success")
              ? "bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300"
              : "bg-white border-zinc-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedSeverities.includes("success") ? "text-emerald-50" : "text-emerald-700"
              }`}
            >
              Success (2xx)
            </span>
            <CheckCircle
              size={20}
              weight="fill"
              className={selectedSeverities.includes("success") ? "text-white" : "text-emerald-600"}
            />
          </div>
          <div className="text-2xl font-extrabold mt-1">
            {summary?.counts.success ?? 0}
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              selectedSeverities.includes("success") ? "text-emerald-50" : "text-zinc-500"
            }`}
          >
            Transaksi &amp; aksi berhasil
          </p>
        </button>

        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              API Error Rate
            </span>
            <Pulse size={20} weight="bold" className="text-zinc-700" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 mt-1">
            {summary?.apiErrorRate ?? 0}%
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Total {summary?.totalEvents ?? 0} event tercatat
          </p>
        </div>
      </div>

      {/* 3. PILIHAN JANGKAUAN WAKTU & TAB KATEGORI (§8.2, §8.3) */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 pb-3.5">
          {/* Jangkauan Waktu (§8.3) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-zinc-500 mr-1.5 uppercase tracking-wider">
              Rentang Waktu:
            </span>
            {TIME_RANGES.map((tr) => {
              const active = range === tr.id && !onlyDeleted;
              return (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => {
                    setOnlyDeleted(false);
                    setRange(tr.id);
                    if (tr.id === "live") setIsPaused(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    active
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {tr.id === "live" && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                  )}
                  {tr.label}
                </button>
              );
            })}

            {/* Tombol Tempat Sampah Soft-Delete (30 Hari) */}
            <button
              type="button"
              onClick={() => setOnlyDeleted(!onlyDeleted)}
              className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition inline-flex items-center gap-1.5 ${
                onlyDeleted
                  ? "bg-red-700 text-white border-red-800"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <Trash size={14} />
              Tempat Sampah ({summary?.deletedCount ?? 0})
            </button>
          </div>

          {/* Input Tanggal Kustom bila range === 'custom' */}
          {range === "custom" && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="datetime-local"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-zinc-300 rounded-lg"
              />
              <span className="text-xs text-zinc-500">s/d</span>
              <input
                type="datetime-local"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-zinc-300 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Tab Kategori (§6, §8.2) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const active = category === tab.id;
            const count =
              tab.id === "all"
                ? summary?.totalEvents
                : summary?.categoryCounts?.[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  active
                    ? "bg-amber-900 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                <span>{tab.label}</span>
                {typeof count === "number" && count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 4. PANEL PENCARIAN & FILTER (§8.2) */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Pencarian Kata Kunci */}
            <div className="md:col-span-5 relative">
              <MagnifyingGlass
                size={16}
                className="text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pesan error, route (/api/orders), eventName, atau Event ID..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter HTTP Status Group */}
            <div className="md:col-span-2">
              <select
                value={statusCodeFilter}
                onChange={(e) => setStatusCodeFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-lg bg-white font-semibold text-zinc-700"
              >
                <option value="all">Semua Status HTTP</option>
                <option value="2xx">2xx (Success)</option>
                <option value="3xx">3xx (Redirect/Info)</option>
                <option value="4xx">4xx (Client Warning)</option>
                <option value="5xx">5xx (Server Error)</option>
                <option value="0">Non-HTTP / Worker</option>
              </select>
            </div>

            {/* Filter Source */}
            <div className="md:col-span-2">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-lg bg-white font-semibold text-zinc-700"
              >
                <option value="all">Semua Sumber</option>
                <option value="backend">Backend API</option>
                <option value="external">External (Pusher/FCM/Gateway)</option>
                <option value="mobile">Mobile Flutter</option>
                <option value="web">Web Frontend</option>
                <option value="worker">Background Worker</option>
              </select>
            </div>

            {/* Tombol Filter Korelasi & Reset */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition ${
                  showAdvancedFilters ||
                  requestIdFilter ||
                  orderIdFilter ||
                  transactionIdFilter ||
                  userIdFilter
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <Funnel size={14} weight="bold" />
                ID Korelasi
                <CaretDown size={12} />
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-lg text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Filter Severity Multi-Pilih Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-zinc-500 mr-1">Level Severity:</span>
            {SEVERITY_OPTIONS.map((sev) => {
              const active = selectedSeverities.includes(sev.id);
              return (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => toggleSeverity(sev.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border transition ${
                    active
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {sev.label}
                </button>
              );
            })}
          </div>

          {/* Panel Filter ID Korelasi Lanjutan */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Request / Trace ID
                </label>
                <input
                  type="text"
                  value={requestIdFilter}
                  onChange={(e) => setRequestIdFilter(e.target.value)}
                  placeholder="cth: req_demo_trx_01"
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  value={orderIdFilter}
                  onChange={(e) => setOrderIdFilter(e.target.value)}
                  placeholder="cth: 8"
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Transaction / Ref ID
                </label>
                <input
                  type="text"
                  value={transactionIdFilter}
                  onChange={(e) => setTransactionIdFilter(e.target.value)}
                  placeholder="cth: TRX-2026-0008"
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  placeholder="cth: 40"
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Peran Aktor (Role)
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md bg-white"
                >
                  <option value="all">Semua Peran</option>
                  <option value="admin">Admin</option>
                  <option value="mitra">Mitra</option>
                  <option value="pengunjung">Pengunjung / Buyer</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BANNER PAUSED / EVENT BARU (§8.4) */}
      {pausedBuffer.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Pulse size={18} weight="bold" className="text-amber-600" />
            <span>
              Terdapat <strong>{pausedBuffer.length} event baru</strong> sejak stream dijeda.
            </span>
          </div>
          <button
            type="button"
            onClick={handleFlushPausedBuffer}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition"
          >
            Tampilkan Event Baru &amp; Lanjutkan Live
          </button>
        </div>
      )}

      {/* BANNER ERROR LOAD HISTORIS (§8.6) */}
      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-red-800">{loadError}</div>
          <button
            type="button"
            onClick={() => fetchLogsAndSummary(false)}
            className="px-3 py-1 rounded-md text-xs font-bold bg-red-600 text-white hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 5. TABEL / STREAM LOG (§7, §8.2) */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-9 text-center">
                  <input
                    type="checkbox"
                    checked={logs.length > 0 && selectedIds.size === logs.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(logs.map((l) => l.eventId)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="py-3 px-3">Waktu (WIB)</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Event</th>
                <th className="py-3 px-3 min-w-[260px]">Ringkasan</th>
                <th className="py-3 px-3">Aktor</th>
                <th className="py-3 px-3">Sumber</th>
                <th className="py-3 px-3 text-right">Durasi</th>
                <th className="py-3 px-3">Request / Korelasi ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs">
              {loading && logs.length === 0 ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={11} className="py-4 px-4">
                      <div className="h-4 bg-zinc-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 px-6 text-center">
                    <TerminalWindow size={36} className="text-zinc-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-zinc-800">
                      Tidak ada event log yang cocok dengan filter aktif
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Kategori: <strong>{category}</strong> • Rentang: <strong>{range}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              ) : (
                logs.map((item) => {
                  const isErrorOrCritical =
                    item.severity === "error" ||
                    item.severity === "critical" ||
                    (item.http?.statusCode ?? 0) >= 500;
                  const isWarning =
                    item.severity === "warning" ||
                    ((item.http?.statusCode ?? 0) >= 400 && (item.http?.statusCode ?? 0) < 500);
                  const isSelected = selectedIds.has(item.eventId);

                  return (
                    <tr
                      key={item.eventId}
                      onClick={() => openLogDetail(item)}
                      className={`cursor-pointer transition ${
                        item.severity === "critical"
                          ? "bg-red-950/[0.06] hover:bg-red-950/[0.10] border-l-4 border-l-red-700"
                          : isErrorOrCritical
                          ? "bg-red-50/50 hover:bg-red-50 border-l-4 border-l-red-500"
                          : isWarning
                          ? "bg-amber-50/30 hover:bg-amber-50/70 border-l-4 border-l-amber-400"
                          : "hover:bg-zinc-50"
                      }`}
                    >
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            if (e.target.checked) next.add(item.eventId);
                            else next.delete(item.eventId);
                            setSelectedIds(next);
                          }}
                          className="rounded"
                        />
                      </td>

                      {/* Waktu WIB */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-zinc-600">
                        {formatWibTime(item.occurredAt)}
                      </td>

                      {/* Level Severity */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <SeverityBadge severity={item.severity} />
                      </td>

                      {/* Kategori */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-semibold text-[11px]">
                          {item.category}
                        </span>
                      </td>

                      {/* Status HTTP (§7: 2xx hijau teks putih, 5xx merah) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <HttpStatusChip
                          statusCode={item.http?.statusCode}
                          severity={item.severity}
                        />
                      </td>

                      {/* Event Name */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] font-semibold text-zinc-800">
                        {item.eventName}
                      </td>

                      {/* Ringkasan (§7: Error berwarna merah, Success tetap netral agar mudah dibaca) */}
                      <td className="py-2.5 px-3 max-w-md">
                        <p
                          className={`truncate font-medium ${
                            isErrorOrCritical ? "text-red-600 font-semibold" : "text-zinc-800"
                          }`}
                          title={item.message}
                        >
                          {item.message}
                        </p>
                        {item.http?.route && item.http.route !== "-" && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            {item.http.method} {item.http.route}
                          </span>
                        )}
                      </td>

                      {/* Aktor */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-zinc-700">
                        {item.correlation?.userId ? (
                          <span className="font-semibold">
                            {item.correlation.role || "user"} #{item.correlation.userId}
                          </span>
                        ) : (
                          <span className="text-zinc-400">
                            {item.correlation?.role || "system"}
                          </span>
                        )}
                      </td>

                      {/* Sumber */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-zinc-600">
                        <span className="font-medium">{item.source}</span>
                        <span className="text-zinc-400">/{item.service}</span>
                      </td>

                      {/* Durasi */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono text-[11px] text-zinc-600">
                        {item.http?.durationMs ? `${item.http.durationMs} ms` : "-"}
                      </td>

                      {/* Request ID / Korelasi */}
                      <td
                        className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          {item.correlation?.requestId ? (
                            <button
                              type="button"
                              onClick={() => handleCopy(item.correlation!.requestId!, "Request ID")}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                              title="Salin Request ID"
                            >
                              <span>{item.correlation.requestId}</span>
                              {copiedId === item.correlation.requestId ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                          {item.correlation?.orderId && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                              Ord #{item.correlation.orderId}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Cursor */}
        {hasMore && (
          <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100 disabled:opacity-50"
            >
              {loadingMore ? "Memuat..." : "Muat Event Lebih Lama (Cursor Berikutnya)"}
            </button>
          </div>
        )}
      </div>

      {/* 6. DRAWER DETAIL LOG & CHAIN KORELASI (§8.2) */}
      {activeLog && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
          onClick={() => setActiveLog(null)}
        >
          <div
            className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <SeverityBadge severity={activeLog.severity} />
                  <HttpStatusChip
                    statusCode={activeLog.http?.statusCode}
                    severity={activeLog.severity}
                  />
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold text-xs">
                    {activeLog.category}
                  </span>
                  {activeLog.acknowledgedAt && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                      ✓ Diperiksa
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-zinc-900 mt-2 font-mono">
                  {activeLog.eventName}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {formatWibTime(activeLog.occurredAt)} • Event ID:{" "}
                  <span className="font-mono">{activeLog.eventId}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLog(null)}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100"
                aria-label="Tutup detail log"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Ringkasan Pesan */}
            <div
              className={`p-4 rounded-xl border ${
                activeLog.severity === "critical" || activeLog.severity === "error"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-zinc-50 border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
                Ringkasan Kejadian
              </div>
              <p
                className={`text-sm font-semibold ${
                  activeLog.severity === "critical" || activeLog.severity === "error"
                    ? "text-red-700"
                    : "text-zinc-900"
                }`}
              >
                {activeLog.message}
              </p>
            </div>

            {/* Aksi Cepat Drawer */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeLog.correlation?.requestId && (
                <button
                  type="button"
                  onClick={() => handleCopy(activeLog.correlation!.requestId!, "Request ID")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  <Copy size={14} />
                  Salin Request ID ({activeLog.correlation.requestId})
                </button>
              )}

              {(activeLog.severity === "error" || activeLog.severity === "critical") &&
                !activeLog.acknowledgedAt && (
                  <button
                    type="button"
                    onClick={() => handleAcknowledge(activeLog.eventId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check size={14} weight="bold" />
                    Tandai Telah Diperiksa (Acknowledge)
                  </button>
                )}

              {activeLog.correlation?.orderId && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderIdFilter(String(activeLog.correlation?.orderId));
                    setShowAdvancedFilters(true);
                    setActiveLog(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200"
                >
                  <LinkSimple size={14} weight="bold" />
                  Telusuri Order #{activeLog.correlation.orderId}
                </button>
              )}

              {!activeLog.deletedAt && activeLog.category !== "admin_audit" && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({
                      open: true,
                      mode: "single",
                      targetEventId: activeLog.eventId,
                      count: 1,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                >
                  <Trash size={14} />
                  Soft Delete
                </button>
              )}

              {activeLog.deletedAt && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRestoreLog(activeLog.eventId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <ArrowCounterClockwise size={14} weight="bold" />
                    Pulihkan Log
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModal({
                        open: true,
                        mode: "purge",
                        targetEventId: activeLog.eventId,
                        count: 1,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-700 text-white hover:bg-red-800"
                  >
                    <Trash size={14} weight="bold" />
                    Purge Permanen
                  </button>
                </>
              )}
            </div>

            {/* Metadata HTTP, Korelasi & Klien */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div>
                <span className="text-zinc-500 block">Method &amp; Route Template</span>
                <span className="font-mono font-bold text-zinc-900">
                  {activeLog.http ? `${activeLog.http.method} ${activeLog.http.route}` : "-"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Durasi Respons</span>
                <span className="font-mono font-bold text-zinc-900">
                  {activeLog.http?.durationMs ? `${activeLog.http.durationMs} ms` : "-"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Aktor &amp; Role</span>
                <span className="font-bold text-zinc-900">
                  {activeLog.correlation?.role || "guest"}{" "}
                  {activeLog.correlation?.userId ? `(#${activeLog.correlation.userId})` : ""}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Sumber &amp; Service</span>
                <span className="font-bold text-zinc-900">
                  {activeLog.source} / {activeLog.service}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Order / Transaction ID</span>
                <span className="font-mono font-bold text-zinc-900">
                  Order: {activeLog.correlation?.orderId ?? "-"} | Trx:{" "}
                  {activeLog.correlation?.referenceCode ||
                    activeLog.correlation?.transactionId ||
                    "-"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">IP (Masked) &amp; Platform</span>
                <span className="font-mono font-bold text-zinc-900">
                  {activeLog.client?.ipMasked || "-"} ({activeLog.client?.platform || "-"})
                </span>
              </div>
            </div>

            {/* Detail Error & Stack Trace Tersanitasi (§7, §9.3) */}
            {activeLog.error && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-700">
                  Diagnostik Error (Tersanitasi untuk Admin)
                </h4>
                <div className="p-3.5 rounded-xl bg-red-950 text-red-100 font-mono text-xs overflow-x-auto space-y-1.5">
                  <div>
                    <span className="text-red-400 font-bold">
                      [{activeLog.error.code || "ERR"}] {activeLog.error.name || "Error"}:
                    </span>{" "}
                    {activeLog.error.message}
                  </div>
                  {activeLog.error.stack && (
                    <pre className="text-[11px] text-red-200/90 whitespace-pre-wrap pt-2 border-t border-red-900">
                      {activeLog.error.stack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Metadata JSON Tersanitasi */}
            {activeLog.metadata && Object.keys(activeLog.metadata).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                  Metadata Konteks (Disanitasi)
                </h4>
                <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto">
                  {JSON.stringify(activeLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Rangkaian Event Terkait (Correlation Chain §8.2, §11) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                Rangkaian Event Terkait (Correlation Timeline)
              </h4>
              {activeLogLoading ? (
                <div className="text-xs text-zinc-500">Memuat rangkaian korelasi...</div>
              ) : relatedLogs.length === 0 ? (
                <div className="text-xs text-zinc-500">Tidak ada event terkait lainnya.</div>
              ) : (
                <div className="space-y-2 border-l-2 border-zinc-300 pl-3">
                  {relatedLogs.map((rel) => {
                    const isCurrent = rel.eventId === activeLog.eventId;
                    return (
                      <div
                        key={rel.eventId}
                        onClick={() => openLogDetail(rel)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          isCurrent
                            ? "bg-amber-50 border-amber-400"
                            : "bg-white border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <HttpStatusChip
                              statusCode={rel.http?.statusCode}
                              severity={rel.severity}
                            />
                            <span className="font-mono font-bold text-zinc-900">
                              {rel.eventName}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {formatWibTime(rel.occurredAt, false)}
                          </span>
                        </div>
                        <p className="text-zinc-700 mt-1">{rel.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS / BULK DELETE / PURGE (§8.5) */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Trash size={20} weight="bold" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">
                  {deleteModal.mode === "purge"
                    ? "Konfirmasi Purge Permanen"
                    : "Konfirmasi Penghapusan Log (Soft Delete)"}
                </h3>
                <p className="text-xs text-zinc-500">
                  Kategori: <strong>{category}</strong> • Rentang: <strong>{range}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-700 leading-relaxed">
              {deleteModal.mode === "purge" ? (
                <>
                  Tindakan ini akan menghapus log secara <strong>permanen</strong> dari database dan{" "}
                  <strong>tidak dapat dibatalkan</strong>. Ketik <code>PURGE</code> di bawah ini:
                </>
              ) : (
                <>
                  Sebanyak <strong>{deleteModal.count} log</strong> akan dipindahkan ke tempat
                  sampah (soft delete) dan masih dapat dipulihkan selama <strong>30 hari</strong>.
                  Log kategori <code>admin_audit</code> tidak akan ikut terhapus.
                </>
              )}
            </p>

            {deleteModal.mode !== "purge" && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Alasan Penghapusan (Opsional, tercatat di Audit)
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="cth: Pembersihan log pengujian mingguan"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg"
                />
              </div>
            )}

            {(deleteModal.mode === "selected" ||
              deleteModal.mode === "filter" ||
              deleteModal.mode === "purge") && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Ketik{" "}
                  <code className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded">
                    {deleteModal.mode === "purge" ? "PURGE" : requiredBulkConfirm}
                  </code>{" "}
                  untuk mengaktifkan tombol:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={deleteModal.mode === "purge" ? "PURGE" : requiredBulkConfirm}
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-300 rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModal({ open: false, mode: "single", count: 0 });
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteAction}
                disabled={
                  isDeleting ||
                  ((deleteModal.mode === "selected" || deleteModal.mode === "filter") &&
                    deleteConfirmText.trim().toUpperCase() !== requiredBulkConfirm) ||
                  (deleteModal.mode === "purge" &&
                    deleteConfirmText.trim().toUpperCase() !== "PURGE")
                }
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
              >
                {isDeleting ? "Memproses..." : "Konfirmasi Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSystemLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-500">
          Memuat halaman System Logs &amp; Live Monitoring...
        </div>
      }
    >
      <AdminSystemLogsContent />
    </Suspense>
  );
}
