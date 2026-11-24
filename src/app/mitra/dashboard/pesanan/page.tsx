"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Package,
  Receipt,
  Truck,
  CheckCircle,
  Clock,
  User,
  MagnifyingGlass,
  X,
  ChatCircle,
  Star,
  Storefront,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { EarthySelect } from "@/components/ui/EarthySelect";
import { PaymentMethodBadge } from "@/components/ui/PaymentMethodBadge";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_HOST = API_BASE_URL.replace(/\/api\/?$/, "");

type OrderStatus = "unpaid" | "packed" | "shipped" | "completed" | "cancelled";

type OrderItem = {
  id: string;
  productId?: number;
  name: string;
  price: number;
  qty: number;
  image: string;
  variantName?: string;
  variantHex?: string;
};

type Order = {
  id: string;
  numericId: number;
  referenceCode?: string;
  customerId?: number;
  rawStatus?: string;
  customerName: string;
  recipientName?: string;
  recipientPhone?: string | null;
  shippingAddress?: string | null;
  customerNotes?: string | null;
  date: string;
  status: OrderStatus;
  total: number;
  subtotalProduk: number;
  shippingCost: number;
  otherFee: number;
  netSubtotal: number;
  items: OrderItem[];
  resi?: string;
  kurir?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  bank?: string | null;
  gateway?: string;
  paidAt?: string | null;
  reviewId?: number;
  rating?: number;
  ulasan?: string;
  ulasanAvatar?: string;
  ulasanFoto?: string;
  balasanMitra?: string;
};

const formatRp = (val: number) => `Rp ${Math.round(val).toLocaleString("id-ID")}`;

function OrderPriceBreakdown({
  order,
  compact = false,
}: {
  order: Order;
  compact?: boolean;
}) {
  const totalQty = order.items.reduce((s, it) => s + it.qty, 0);
  const totalPembeli = order.netSubtotal + order.otherFee;

  return (
    <div
      className={
        compact
          ? "mt-4 bg-zinc-50/90 border border-zinc-200/80 rounded-xl p-3.5 text-xs space-y-2"
          : "bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm space-y-2.5"
      }
    >
      <div className="flex items-center justify-between text-zinc-600">
        <span>Subtotal Produk ({totalQty} barang)</span>
        <span className="font-medium text-zinc-900">{formatRp(order.subtotalProduk)}</span>
      </div>
      <div className="flex items-center justify-between text-zinc-600">
        <span>
          Ongkos Kirim{order.kurir ? ` (${order.kurir})` : ""}
        </span>
        <span className="font-medium text-zinc-900">
          {order.shippingCost > 0 ? formatRp(order.shippingCost) : "Gratis (Rp 0)"}
        </span>
      </div>
      <div className="flex items-center justify-between text-zinc-600">
        <span>
          Biaya Lain / Layanan
          {order.otherFee > 0 && (
            <span className="ml-1 text-[11px] text-zinc-400">(Ditanggung pembeli)</span>
          )}
        </span>
        <span className="font-medium text-zinc-700">
          {order.otherFee > 0 ? formatRp(order.otherFee) : "Rp 0"}
        </span>
      </div>
      {order.otherFee > 0 && (
        <div className="flex items-center justify-between text-zinc-500">
          <span>Total Dibayar Pembeli</span>
          <span className="font-medium text-zinc-700">{formatRp(totalPembeli)}</span>
        </div>
      )}
      <div className="border-t border-zinc-200 pt-2 flex items-center justify-between">
        <span className="font-semibold text-zinc-900">Subtotal Bersih Didapat</span>
        <span className={`font-bold text-emerald-700 ${compact ? "text-sm" : "text-base"}`}>
          {formatRp(order.netSubtotal)}
        </span>
      </div>
    </div>
  );
}

const COURIER_OPTIONS = ["JNE", "J&T", "SiCepat", "Anteraja", "Pos Indonesia", "Tiki"] as const;

export default function PesananSellerPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchPesanan, setSearchPesanan] = useState("");
  const [highlightOrderId, setHighlightOrderId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState("terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Kemas & Atur Pengiriman state
  const [packingOrderId, setPackingOrderId] = useState<string | null>(null);
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [kurir, setKurir] = useState("JNE");
  const [resi, setResi] = useState("");
  const [isSubmittingShipping, setIsSubmittingShipping] = useState(false);

  // Balasan ulasan state
  const [replyOrder, setReplyOrder] = useState<Order | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    useAuthStore.getState().initAuth();

    const fetchOrders = async (isInitial = false) => {
      const storedToken = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");

      if (!storedToken) {
        router.push("/login");
        return;
      }

      try {
        if (isInitial) setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/mitra/orders`, {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
          withCredentials: true,
        });

        if (res.data?.success && Array.isArray(res.data?.data)) {
          const mapStatus = (s: string): OrderStatus => {
            const st = (s || "").toLowerCase();
            if (st === "pending" || st === "unpaid") return "unpaid";
            if (st === "paid" || st === "packed") return "packed";
            if (st === "shipped") return "shipped";
            if (st === "completed" || st === "selesai" || st === "delivered") return "completed";
            if (st === "cancelled" || st === "expired" || st === "failed") return "cancelled";
            return "packed";
          };

          const formatOrderDate = (dateVal: string | Date) => {
            if (!dateVal) return "";
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return String(dateVal);
            return d.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          };

          const mappedOrders: Order[] = res.data.data.map((item: any, idx: number) => {
            const d = item.tanggal ? formatOrderDate(item.tanggal) : (item.date || "");
            const orderItems: OrderItem[] = (item.items || []).map((it: any, itIdx: number) => {
              let img = it.image || it.image_url;
              if (img && !img.startsWith("http")) {
                img = `${API_HOST}${img.startsWith("/") ? "" : "/"}${img}`;
              }
              return {
                id: it.id ? String(it.id) : `item-${idx}-${itIdx}`,
                productId: it.productId ? Number(it.productId) : undefined,
                name: it.productName || it.name || "Produk Keramik",
                price: Number(it.price || 0),
                qty: Number(it.quantity || it.qty || 1),
                image: img || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=150&auto=format&fit=crop",
                variantName: it.variantName,
                variantHex: it.variantHex,
              };
            });

            const numericId =
              Number(item.id) ||
              Number(String(item.orderId || "").replace(/\D/g, "")) ||
              0;
            const rawStatus = String(item.status || "").toLowerCase();
            const totalOrder = Number(item.totalBelanja || item.total || 0);
            const itemsSubtotal = orderItems.reduce(
              (sum, it) => sum + it.price * it.qty,
              0
            );
            const subtotalProduk =
              item.subtotalProduk !== undefined
                ? Number(item.subtotalProduk)
                : itemsSubtotal;
            const shippingCost =
              item.shippingCost !== undefined
                ? Number(item.shippingCost)
                : Math.max(0, totalOrder - subtotalProduk);
            const otherFee = Number(item.gatewayFee ?? item.gateway_fee ?? 0);
            const netSubtotal =
              item.subtotalBersih !== undefined
                ? Number(item.subtotalBersih)
                : totalOrder;

            let revPhoto = item.ulasanFoto;
            if (revPhoto && !String(revPhoto).startsWith("http")) {
              revPhoto = `${API_HOST}${String(revPhoto).startsWith("/") ? "" : "/"}${revPhoto}`;
            }
            let revAvatar = item.ulasanAvatar;
            if (revAvatar && !String(revAvatar).startsWith("http")) {
              revAvatar = `${API_HOST}${String(revAvatar).startsWith("/") ? "" : "/"}${revAvatar}`;
            }

            return {
              id: item.orderId || item.id || `ORD-${idx + 1}`,
              numericId,
              referenceCode: item.referenceCode || `#DNC-${numericId || idx + 1}`,
              customerId: item.customerId ? Number(item.customerId) : undefined,
              rawStatus,
              customerName: item.customerName || item.customer || "Customer",
              recipientName: item.recipientName || item.customerName || "Customer",
              recipientPhone: item.recipientPhone || null,
              shippingAddress: item.shippingAddress || null,
              customerNotes: item.customerNotes || null,
              date: d,
              status: mapStatus(item.status),
              total: totalOrder,
              subtotalProduk,
              shippingCost,
              otherFee,
              netSubtotal,
              items: orderItems,
              resi: item.resi,
              kurir: item.kurir,
              paymentMethod: item.payment_method,
              paymentStatus: item.payment_status,
              bank: item.bank,
              gateway: item.gateway,
              paidAt: item.paid_at,
              reviewId: item.reviewId ? Number(item.reviewId) : undefined,
              rating: item.rating,
              ulasan: item.ulasan,
              ulasanAvatar: revAvatar,
              ulasanFoto: revPhoto,
              balasanMitra: item.balasanMitra,
            };
          });

          setOrders(mappedOrders);
          if (isInitial && typeof window !== "undefined") {
            window.dispatchEvent(new Event("mitra_orders_updated"));
          }
        }
      } catch (error) {
        console.error("Gagal memuat pesanan:", error);
        if (isInitial) toast.error("Gagal memuat data pesanan");
      } finally {
        if (isInitial) {
          setLoading(false);
        }
      }
    };

    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const qParam = sp.get("search");
      const oidParam = sp.get("orderId");
      if (qParam) {
        setSearchPesanan(qParam);
        setActiveTab("all");
      }
      if (oidParam && !isNaN(Number(oidParam)) && Number(oidParam) > 0) {
        setHighlightOrderId(Number(oidParam));
        setActiveTab("all");
      }
    }
    fetchOrders(true);

    const onRefresh = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        fetchOrders(false);
      }
    };

    const pollInterval = setInterval(onRefresh, 30_000);
    window.addEventListener("focus", onRefresh);
    document.addEventListener("visibilitychange", onRefresh);

    let userId: number | undefined;
    try {
      const uStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (uStr) {
        const parsed = JSON.parse(uStr);
        userId = Number(parsed?.id || parsed?.userId) || undefined;
      }
    } catch {}

    let cleanupPusher: (() => void) | null = null;
    if (userId) {
      import("pusher-js")
        .then(({ default: PusherClient }) => {
          const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b5fa050e0050acfb222a";
          const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
          const p = new PusherClient(pusherKey, { cluster: pusherCluster });
          const ch = p.subscribe(`user-${userId}`);
          ch.bind("new-paid-order", () => {
            toast.info("Pesanan baru telah dibayar!");
            fetchOrders(false);
          });
          ch.bind("order-status-changed", () => fetchOrders(false));
          ch.bind("order-completed", () => fetchOrders(false));
          cleanupPusher = () => {
            try {
              p.unsubscribe(`user-${userId}`);
              p.disconnect();
            } catch {}
          };
        })
        .catch(() => {});
    }

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", onRefresh);
      document.removeEventListener("visibilitychange", onRefresh);
      if (cleanupPusher) cleanupPusher();
    };
  }, [router]);

  const tabs = [
    { id: "all", label: "Semua" },
    { id: "unpaid", label: "Belum Dibayar" },
    { id: "packed", label: "Perlu Dikemas" },
    { id: "shipped", label: "Sedang Dikirim" },
    { id: "completed", label: "Selesai" },
    { id: "cancelled", label: "Dibatalkan" },
  ];

  const filteredOrders = (() => {
    let list = activeTab === "all" ? orders : orders.filter(o => o.status === activeTab);
    if (searchPesanan.trim()) {
      const q = searchPesanan.trim().toLowerCase();
      const qDigits = q.startsWith("#dnc-")
        ? q.replace(/^#dnc-0*/, "")
        : q.startsWith("dnc-")
        ? q.replace(/^dnc-0*/, "")
        : null;
      list = list.filter((o) => {
        const dncShort = `#dnc-${o.numericId}`;
        const dncPadded = `#dnc-${String(o.numericId).padStart(4, "0")}`;
        return (
          o.id.toLowerCase().includes(q) ||
          (o.referenceCode || "").toLowerCase().includes(q) ||
          (o.numericId > 0 &&
            (dncShort.includes(q) ||
              dncPadded.includes(q) ||
              q === String(o.numericId) ||
              q === `#${o.numericId}` ||
              (qDigits !== null && qDigits === String(o.numericId)))) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.recipientName || "").toLowerCase().includes(q) ||
          (o.resi || "").toLowerCase().includes(q) ||
          o.items.some((it) => it.name.toLowerCase().includes(q))
        );
      });
    }
    if (sortOrder === "tertinggi") list = [...list].sort((a, b) => b.total - a.total);
    if (sortOrder === "terendah") list = [...list].sort((a, b) => a.total - b.total);
    return list;
  })();

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const lastJumpedHighlightRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchPesanan, sortOrder, itemsPerPage]);

  useEffect(() => {
    if (highlightOrderId === null) {
      lastJumpedHighlightRef.current = null;
      return;
    }
    if (lastJumpedHighlightRef.current === highlightOrderId) return;
    const idx = filteredOrders.findIndex((o) => o.numericId === highlightOrderId);
    if (idx >= 0) {
      lastJumpedHighlightRef.current = highlightOrderId;
      setCurrentPage(Math.floor(idx / itemsPerPage) + 1);
    }
  }, [highlightOrderId, orders, activeTab, itemsPerPage]);

  const handlePageChange = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getVisiblePages = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (safeCurrentPage > 3) pages.push("...");
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    if (safeCurrentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const getStoredToken = () =>
    (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");

  async function markAsPacked(order: Order) {
    if (!order.numericId) {
      toast.error("ID pesanan tidak valid.");
      return;
    }
    const storedToken = getStoredToken();
    setPackingOrderId(order.id);
    try {
      await axios.patch(
        `${API_BASE_URL}/orders/${order.numericId}/status`,
        { status: "packed" },
        {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
          withCredentials: true,
        }
      );
      setOrders(prev =>
        prev.map(o =>
          o.id === order.id ? { ...o, status: "packed" as OrderStatus, rawStatus: "packed" } : o
        )
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mitra_orders_updated"));
      }
      toast.success(`Pesanan ${order.id} ditandai sedang dikemas.`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal memperbarui status pengemasan.";
      toast.error(msg);
    } finally {
      setPackingOrderId(null);
    }
  }

  function openChat(order: Order) {
    const firstItem = order.items[0];
    const totalQty = order.items.reduce((s, it) => s + it.qty, 0);
    const otherItemsCount = Math.max(0, order.items.length - 1);

    const sectionLabelByStatus: Record<OrderStatus, string> = {
      unpaid: "Konfirmasi Pembayaran",
      packed: order.rawStatus === "paid" ? "Pesanan Baru • Perlu Dikemas" : "Produk Sedang Dikemas",
      shipped: "Pesanan Sedang Dikirim",
      completed: "Pesanan Selesai",
      cancelled: "Pesanan Dibatalkan",
    };

    const statusLabelByStatus: Record<OrderStatus, string> = {
      unpaid: "Belum Dibayar",
      packed: "Perlu Dikemas",
      shipped: "Sedang Dikirim",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };

    const orderChatContext = {
      context_type: "order" as const,
      initiated_by: "mitra" as const,
      badge: sectionLabelByStatus[order.status],
      order_id: order.numericId,
      order_code: `#DNC-${order.numericId || order.id}`,
      mitra_order_code: order.id,
      reference_code: order.referenceCode,
      status: order.status === "completed" ? "completed" : (order.rawStatus || order.status),
      ui_status: order.status,
      status_label: statusLabelByStatus[order.status],
      section_label: sectionLabelByStatus[order.status],
      customer_id: order.customerId,
      customer_name: order.customerName,
      store_name: user?.store_name || user?.name || "Toko Keramik",
      product_id: firstItem?.productId,
      product_name: firstItem?.name || "Pesanan Keramik",
      variant: firstItem?.variantName,
      quantity: firstItem?.qty || 1,
      total_items: totalQty,
      other_items_count: otherItemsCount,
      unit_price: firstItem?.price || 0,
      total_amount: order.total,
      image_url: firstItem?.image,
      tracking_number: order.resi,
      shipping_method: order.kurir,
      has_review: Boolean(order.rating),
    };

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "mitra_chat_order_context",
          JSON.stringify(orderChatContext)
        );
      } catch {}
    }

    const params = new URLSearchParams();
    if (order.customerId) params.set("customerId", String(order.customerId));
    if (order.customerName) params.set("customerName", order.customerName);
    params.set("orderId", String(order.numericId || order.id));
    router.push(`/mitra/dashboard/chat?${params.toString()}`);
  }

  function openShipping(order: Order) {
    setShippingOrder(order);
    const currentCourier = order.kurir || "";
    setKurir(
      COURIER_OPTIONS.includes(currentCourier as (typeof COURIER_OPTIONS)[number])
        ? currentCourier
        : "JNE"
    );
    setResi(order.resi ?? "");
  }

  async function submitShipping(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingOrder || !resi.trim()) return;
    if (!shippingOrder.numericId) {
      toast.error("ID pesanan tidak valid.");
      return;
    }
    const storedToken = getStoredToken();
    const submittedResi = resi.trim();
    setIsSubmittingShipping(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/orders/${shippingOrder.numericId}/status`,
        {
          status: "shipped",
          tracking_number: submittedResi,
          shipping_method: kurir,
        },
        {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
          withCredentials: true,
        }
      );
      setOrders(prev => prev.map(o =>
        o.id === shippingOrder.id
          ? { ...o, status: "shipped" as OrderStatus, rawStatus: "shipped", resi: submittedResi, kurir }
          : o
      ));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mitra_orders_updated"));
      }
      toast.success(`Pesanan ${shippingOrder.id} berhasil diserahkan ke ${kurir}. Resi: ${submittedResi}`);
      setShippingOrder(null);
      setResi("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menyimpan pengiriman ke server.";
      toast.error(msg);
    } finally {
      setIsSubmittingShipping(false);
    }
  }

  async function submitReply(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!replyOrder || !replyInput.trim()) return;
    setIsSubmittingReply(true);
    try {
      if (replyOrder.reviewId) {
        const storedToken = getStoredToken();
        await axios.post(
          `${API_BASE_URL}/reviews/${replyOrder.reviewId}/reply`,
          { seller_reply: replyInput.trim() },
          {
            headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
            withCredentials: true,
          }
        );
      }
      setOrders(prev => prev.map(o =>
        o.id === replyOrder.id
          ? { ...o, balasanMitra: replyInput.trim() }
          : o
      ));
      toast.success("Balasan ulasan berhasil dikirim.");
      setReplyOrder(null);
      setReplyInput("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengirim balasan ulasan.");
    } finally {
      setIsSubmittingReply(false);
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "unpaid": return <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Clock size={14} /> Belum Dibayar</div>;
      case "packed": return <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Package size={14} /> Perlu Dikemas</div>;
      case "shipped": return <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Truck size={14} /> Sedang Dikirim</div>;
      case "completed": return <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold"><CheckCircle size={14} /> Selesai</div>;
      case "cancelled": return <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-md text-xs font-semibold"><X size={14} /> Dibatalkan</div>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem" }}>
        <div style={{ height: "32px", width: "240px", background: "var(--surface)", borderRadius: "8px" }} />
        <div style={{ height: "400px", background: "#fff", borderRadius: "12px", border: "1px solid var(--line)" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-end flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Manajemen Pesanan</h1>
          <p className="text-zinc-500 text-sm">Pantau dan kelola pesanan masuk dari pelanggan Anda.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchPesanan}
              onChange={(e) => {
                setSearchPesanan(e.target.value);
                if (!e.target.value.trim()) setHighlightOrderId(null);
              }}
              placeholder="Cari ID, #DNC, resi, customer..."
              className="pl-9 pr-8 py-2 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none"
              style={{ width: 250 }}
            />
            {searchPesanan && (
              <button
                type="button"
                onClick={() => {
                  setSearchPesanan("");
                  setHighlightOrderId(null);
                  router.replace("/mitra/dashboard/pesanan");
                }}
                title="Reset pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>
          <EarthySelect
            value={sortOrder}
            onChange={setSortOrder}
            options={[
              { value: "terbaru", label: "Terbaru" },
              { value: "tertinggi", label: "Nominal Tertinggi" },
              { value: "terendah", label: "Nominal Terendah" },
            ]}
            minWidth={160}
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-zinc-200 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "all" | OrderStatus)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab.id
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
              )}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="p-0">
          {filteredOrders.length > 0 ? (
            <>
            <div className="divide-y divide-zinc-200">
              {paginatedOrders.map((order) => {
                const isHighlighted =
                  highlightOrderId !== null && order.numericId === highlightOrderId;
                return (
                <div
                  key={order.id}
                  className={`p-6 transition-colors ${
                    isHighlighted
                      ? "bg-amber-50/40 ring-1 ring-inset ring-amber-300"
                      : "hover:bg-zinc-50/50"
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Customer & Items */}
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-zinc-900 font-semibold">
                          <User size={16} className="text-zinc-500" />
                          {order.customerName}
                        </div>
                        <span className="text-zinc-300">•</span>
                        <span className="text-sm text-zinc-500">{order.date}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-sm font-mono text-zinc-500">{order.id}</span>
                        {order.numericId > 0 && (
                          <span className="text-xs font-mono font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                            #DNC-{order.numericId}
                          </span>
                        )}
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-zinc-200" />
                            <div>
                              <h3 className="font-medium text-zinc-900 mb-1">{item.name}</h3>
                              <p className="text-sm text-zinc-500 mb-1">{item.qty} barang x Rp {item.price.toLocaleString("id-ID")}</p>
                              {item.variantName && (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "#f5f5f5", borderRadius: "999px", padding: "0.2rem 0.6rem 0.2rem 0.35rem", border: "1px solid #e5e5e5" }}>
                                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: item.variantHex, border: "1.5px solid rgba(0,0,0,0.12)", flexShrink: 0, display: "inline-block" }} />
                                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#52525b" }}>{item.variantName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Rincian spesifik harga, ongkir, biaya lain, dan subtotal bersih */}
                      <OrderPriceBreakdown order={order} compact />

                      {order.customerNotes && (
                        <p className="mt-2.5 text-xs text-zinc-500">
                          <span className="font-semibold text-zinc-700">Catatan pembeli:</span>{" "}
                          {order.customerNotes}
                        </p>
                      )}

                      {/* Resi info jika sudah dikirim */}
                      {order.resi && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                          <Truck size={13} />
                          {order.kurir} · No. Resi: {order.resi}
                        </div>
                      )}
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="w-full md:w-64 flex flex-col border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 justify-between gap-3">
                      <div className="w-full flex-1 flex flex-col justify-center items-center text-center rounded-xl bg-zinc-50 border border-zinc-200 p-4 gap-3">
                        <div className="w-full flex flex-col items-center gap-0.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            Total Belanja
                          </p>
                          <p className="text-2xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                            Rp {order.total.toLocaleString("id-ID")}
                          </p>
                        </div>
                        {order.paymentMethod && (
                          <div className="w-full border-t border-zinc-200 pt-3 flex flex-col items-center gap-1.5">
                            <span className="text-[11px] font-medium text-zinc-400">
                              Metode Pembayaran
                            </span>
                            <PaymentMethodBadge
                              method={order.paymentMethod}
                              bank={order.bank}
                              size="lg"
                              statusSuffix={
                                order.paymentStatus === "paid"
                                  ? "· Lunas"
                                  : order.paymentStatus === "pending"
                                  ? "· Menunggu"
                                  : undefined
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="w-full flex flex-col gap-2">
                        {/* Action Buttons */}
                        {order.status === "packed" && (
                          <div className="flex flex-col gap-2">
                            {order.rawStatus === "paid" && (
                              <button
                                onClick={() => markAsPacked(order)}
                                disabled={packingOrderId === order.id}
                                className="w-full px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-60"
                              >
                                {packingOrderId === order.id ? "Memproses..." : "Kemas Pesanan"}
                              </button>
                            )}
                            <button
                              onClick={() => openShipping(order)}
                              className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                            >
                              Atur Pengiriman
                            </button>
                          </div>
                        )}

                        {order.status === "shipped" && (
                          <div className="w-full px-4 py-2 bg-purple-50 text-purple-500 rounded-lg text-sm font-semibold text-center cursor-default select-none border border-purple-200">
                            Menunggu Pembeli Konfirmasi
                          </div>
                        )}

                        {order.status === "unpaid" && (
                          <div className="w-full px-4 py-2 bg-zinc-100 text-zinc-400 rounded-lg text-sm font-semibold text-center cursor-default select-none">
                            Menunggu Pembayaran
                          </div>
                        )}

                        {order.status === "cancelled" && (
                          <div className="w-full px-4 py-2 bg-red-50 text-red-400 rounded-lg text-sm font-semibold text-center cursor-default select-none">
                            Pesanan Dibatalkan / Kedaluwarsa
                          </div>
                        )}

                        {/* Chat dengan customer */}
                        <button
                          onClick={() => openChat(order)}
                          className="w-full px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ChatCircle size={15} />
                          Chat Customer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ulasan jika Selesai */}
                  {order.status === "completed" && (
                    <div className="mt-6 pt-5 border-t border-zinc-100">
                      <p className="text-sm font-bold text-zinc-900 mb-3">Ulasan dari pembeli</p>
                      {order.rating ? (
                        <div style={{ padding: "1.25rem", border: "1px solid var(--line)", borderRadius: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.65rem" }}>
                            {order.ulasanAvatar ? (
                              <img src={order.ulasanAvatar} alt={order.customerName} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--line)", flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--clay)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                                {order.customerName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--bark)", margin: 0 }}>{order.customerName}</p>
                              <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: 0 }}>{order.date.split(" ")[0]} {order.date.split(" ")[1]} {order.date.split(" ")[2]}</p>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "2px", color: "#f59e0b", marginBottom: "0.35rem" }}>
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} weight={i <= order.rating! ? "fill" : "regular"} />)}
                          </div>

                          <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: "0 0 0.6rem" }}>
                            Varian: <strong style={{ color: "var(--bark)" }}>{order.items[0]?.variantName} â€” {order.items[0]?.variantName === "Sand White" ? "Glossy Finish" : "Standard"}</strong>
                          </p>

                          <p style={{ fontSize: "0.88rem", color: "var(--bark)", lineHeight: 1.55, margin: "0 0 0.75rem" }}>
                            {order.ulasan}
                          </p>

                          {order.ulasanFoto && (
                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                              <img src={order.ulasanFoto} alt="Foto ulasan" style={{ width: 88, height: 72, borderRadius: "0.5rem", objectFit: "cover", border: "1px solid var(--line)" }} />
                            </div>
                          )}

                          {order.balasanMitra ? (
                            <div style={{ marginTop: "1rem", background: "var(--surface)", padding: "1rem", borderRadius: "0.75rem", position: "relative" }}>
                              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--bark)", margin: "0 0 0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <Storefront size={14} /> {user?.store_name || "Balasan Toko"}
                              </p>
                              <p style={{ fontSize: "0.8rem", color: "var(--bark-muted)", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                                "{order.balasanMitra}"
                              </p>
                            </div>
                          ) : replyOrder?.id === order.id ? (
                            <div style={{ marginTop: "1rem" }}>
                              <textarea
                                value={replyInput}
                                onChange={(e) => setReplyInput(e.target.value)}
                                placeholder="Tulis balasan Anda untuk pembeli ini..."
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line-strong)", fontSize: "0.85rem", resize: "vertical", minHeight: 80, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box" }}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem" }}>
                                <button onClick={() => setReplyOrder(null)} style={{ padding: "0.4rem 0.8rem", borderRadius: "0.5rem", border: "1px solid var(--line-strong)", background: "#fff", color: "var(--bark)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Batal</button>
                                <button onClick={() => submitReply()} style={{ padding: "0.4rem 0.8rem", borderRadius: "0.5rem", border: "none", background: "var(--bark)", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Simpan Balasan</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ marginTop: "1rem", textAlign: "right" }}>
                              <button onClick={() => { setReplyOrder(order); setReplyInput(""); }} style={{ padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid var(--clay)", background: "#fff", color: "var(--clay)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                                Balas Ulasan
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-center text-zinc-500 bg-zinc-50 py-4 rounded-xl border border-zinc-100">
                          Belum ada ulasan
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center flex-wrap gap-3 text-xs text-zinc-600">
                <span>
                  Menampilkan <strong className="text-zinc-900">{startIndex + 1}â€“{endIndex}</strong> dari{" "}
                  <strong className="text-zinc-900">{totalItems}</strong> pesanan
                </span>
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-zinc-500">Per halaman:</span>
                  <EarthySelect
                    value={String(itemsPerPage)}
                    onChange={(val) => setItemsPerPage(Number(val))}
                    options={[
                      { value: "5", label: "5" },
                      { value: "10", label: "10" },
                      { value: "20", label: "20" },
                      { value: "50", label: "50" },
                    ]}
                    minWidth={80}
                    style={{
                      height: 32,
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      borderRadius: "0.5rem",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <CaretLeft size={13} weight="bold" />
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1">
                  {getVisiblePages().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 py-1 text-xs text-zinc-400 select-none"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          safeCurrentPage === page
                            ? "bg-zinc-900 text-white"
                            : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Berikutnya
                  <CaretRight size={13} weight="bold" />
                </button>
              </div>
            </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Receipt size={48} className="text-zinc-300 mx-auto mb-4" />
              <h3 className="text-zinc-900 font-semibold mb-1">Belum ada pesanan</h3>
              <p className="text-zinc-500 text-sm">Tidak ada pesanan masuk untuk status ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Modal Atur Pengiriman â”€â”€ */}
      {shippingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div style={{ background: "linear-gradient(135deg, #3b3025, #5a3d28)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="flex items-center gap-2">
                <Truck size={20} color="#fff" weight="fill" />
                <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", margin: 0 }}>Atur Pengiriman</h2>
              </div>
              <button onClick={() => setShippingOrder(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={14} weight="bold" />
              </button>
            </div>

            <form onSubmit={submitShipping} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Info pesanan */}
              <div style={{ background: "var(--surface)", borderRadius: "0.75rem", padding: "1rem", border: "1px solid var(--line)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", marginBottom: "0.25rem" }}>Pesanan</p>
                <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--bark)", margin: 0 }}>{shippingOrder.id} Â· {shippingOrder.customerName}</p>
              </div>

              {/* Pilih kurir */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Kurir Pengiriman</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {COURIER_OPTIONS.map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKurir(k)}
                      style={{
                        padding: "0.6rem 0.5rem",
                        borderRadius: "0.6rem",
                        border: `1.5px solid ${kurir === k ? "var(--clay)" : "var(--line)"}`,
                        background: kurir === k ? "var(--clay-muted, #f5ede0)" : "#fff",
                        color: kurir === k ? "var(--clay)" : "var(--bark)",
                        fontSize: "0.78rem", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                        fontFamily: "var(--font-outfit), sans-serif",
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nomor resi */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Nomor Resi</label>
                <input
                  type="text"
                  required
                  value={resi}
                  onChange={e => setResi(e.target.value)}
                  placeholder={`Masukkan nomor resi ${kurir}`}
                  style={{
                    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                    border: "1px solid var(--line)", fontSize: "0.9rem",
                    outline: "none", boxSizing: "border-box",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={() => setShippingOrder(null)}
                  style={{ flex: 1, padding: "0.8rem", borderRadius: "0.75rem", background: "#fff", border: "1px solid var(--line-strong)", color: "var(--bark)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShipping || !resi.trim()}
                  style={{
                    flex: 2, padding: "0.8rem", borderRadius: "0.75rem",
                    background: isSubmittingShipping ? "var(--clay-light)" : "var(--clay)",
                    color: "#fff", fontWeight: 700, border: "none",
                    cursor: isSubmittingShipping ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-outfit), sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  }}
                >
                  <Truck size={16} />
                  {isSubmittingShipping ? "Memproses..." : "Konfirmasi Pengiriman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
