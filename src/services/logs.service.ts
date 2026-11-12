import api from "@/lib/axios";
import { getDemoSession } from "@/lib/utils/demo";

export type LogSeverity = "debug" | "info" | "success" | "warning" | "error" | "critical";
export type LogCategory =
  | "auth"
  | "transaction"
  | "order"
  | "product_store"
  | "cart_address"
  | "chat"
  | "notification"
  | "moderation"
  | "ai"
  | "external"
  | "mobile"
  | "system"
  | "admin_audit";

export interface SystemLogItem {
  id: number;
  eventId: string;
  occurredAt: string;
  createdAt?: string | null;
  category: LogCategory | string;
  eventName: string;
  severity: LogSeverity;
  outcome: "success" | "failure" | "pending" | "info";
  message: string;
  source: "backend" | "web" | "mobile" | "worker" | "external";
  service: string;
  http?: {
    method: string;
    route: string;
    statusCode: number;
    durationMs: number;
  } | null;
  correlation?: {
    requestId?: string | null;
    traceId?: string | null;
    userId?: number | null;
    role?: string | null;
    orderId?: number | null;
    transactionId?: number | null;
    referenceCode?: string | null;
  } | null;
  client?: {
    platform?: string | null;
    appVersion?: string | null;
    ipMasked?: string | null;
    userAgent?: string | null;
  } | null;
  error?: {
    code?: string | null;
    name?: string | null;
    message?: string | null;
    stack?: string | null;
  } | null;
  metadata?: Record<string, unknown> | null;
  acknowledgedAt?: string | null;
  acknowledgedBy?: number | null;
  deletedAt?: string | null;
  deletedBy?: number | null;
  deleteReason?: string | null;
  retentionExpiresAt?: string | null;
}

export interface LogFilterParams {
  range?: "live" | "24h" | "7d" | "30d" | "custom";
  category?: string;
  severity?: string;
  statusCode?: string;
  source?: string;
  role?: string;
  from?: string;
  to?: string;
  query?: string;
  requestId?: string;
  userId?: string;
  orderId?: string;
  transactionId?: string;
  cursor?: string;
  since?: string;
  onlyDeleted?: boolean;
  includeDeleted?: boolean;
  limit?: number;
}

export interface LogsSummaryData {
  counts: {
    critical: number;
    error: number;
    warning: number;
    success: number;
    info: number;
    debug: number;
  };
  totalEvents: number;
  apiErrorRate: number;
  unacknowledgedErrors15m: number;
  deletedCount: number;
  categoryCounts: Record<string, number>;
  updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || (getDemoSession() as any)?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const cleanQueryParams = (params: LogFilterParams): Record<string, string> => {
  const out: Record<string, string> = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      out[k] = String(v);
    }
  });
  return out;
};

export const logsService = {
  getLogs: async (params: LogFilterParams = {}) => {
    const query = cleanQueryParams(params);
    const response = await api.get("/admin/logs", {
      params: query,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getSummary: async (params: LogFilterParams = {}) => {
    const query = cleanQueryParams(params);
    const response = await api.get("/admin/logs/summary", {
      params: query,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getLogDetail: async (eventId: string) => {
    const response = await api.get(`/admin/logs/${encodeURIComponent(eventId)}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getRelatedLogs: async (eventId: string) => {
    const response = await api.get(`/admin/logs/${encodeURIComponent(eventId)}/related`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  acknowledgeLog: async (eventId: string) => {
    const response = await api.post(
      `/admin/logs/${encodeURIComponent(eventId)}/acknowledge`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  softDeleteLog: async (eventId: string, reason?: string) => {
    const response = await api.delete(`/admin/logs/${encodeURIComponent(eventId)}`, {
      data: { reason },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  bulkDeleteLogs: async (payload: {
    eventIds?: string[];
    filter?: LogFilterParams;
    confirmText: string;
    reason?: string;
  }) => {
    const response = await api.post("/admin/logs/bulk-delete", payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  restoreLog: async (eventId: string) => {
    const response = await api.post(
      `/admin/logs/${encodeURIComponent(eventId)}/restore`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  purgeLog: async (eventId: string, confirmText: string) => {
    const response = await api.delete(`/admin/logs/${encodeURIComponent(eventId)}/purge`, {
      data: { confirmText },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  exportCsv: async (params: LogFilterParams = {}) => {
    const query = new URLSearchParams(cleanQueryParams(params)).toString();
    const url = `${API_BASE_URL}/admin/logs/export${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Gagal mengekspor CSV (HTTP ${response.status})`);
    }
    const blob = await response.blob();
    const dateStr = new Date().toISOString().split("T")[0];
    const rangeStr = params.range || "live";
    const filename = `dinoyocraft-logs-${dateStr}-${rangeStr}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    return filename;
  },

  reportWebError: async (payload: {
    category?: string;
    eventName: string;
    severity?: LogSeverity;
    message: string;
    route?: string;
    statusCode?: number;
    requestId?: string;
  }) => {
    try {
      await fetch(`${API_BASE_URL}/internal/logs/web`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          source: "web",
          service: "web-admin",
          category: payload.category || "system",
          eventName: payload.eventName,
          severity: payload.severity || "error",
          message: payload.message,
          requestId: payload.requestId,
          http: payload.route
            ? {
                method: "CLIENT",
                route: payload.route,
                statusCode: payload.statusCode || 0,
                durationMs: 0,
              }
            : undefined,
        }),
      });
    } catch {
      // Jangan pernah memblokir UI jika pengiriman error telemetry gagal
    }
  },
};
