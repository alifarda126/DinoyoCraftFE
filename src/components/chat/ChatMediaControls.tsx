"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Paperclip,
  PaperPlaneRight,
  Smiley,
  X,
  Package,
  Truck,
  Clock,
  CheckCircle,
  WarningCircle,
  ShoppingBag,
  ArrowSquareOut,
  Star,
} from "@phosphor-icons/react";

export interface ChatContextMetadata {
  context_type: "product" | "order";
  initiated_by?: "customer" | "mitra" | "admin";
  badge?: string;
  // Product fields
  product_id?: string | number;
  product_name?: string;
  studio?: string;
  store_name?: string;
  price?: number;
  unit_price?: number;
  rating?: number;
  sold_count?: number;
  image_url?: string;
  // Order fields
  order_id?: number | string;
  order_code?: string;
  mitra_order_code?: string;
  reference_code?: string;
  status?: string;
  status_label?: string;
  section_label?: string;
  customer_id?: number;
  customer_name?: string;
  variant?: string;
  quantity?: number;
  total_items?: number;
  other_items_count?: number;
  total_amount?: number;
  tracking_number?: string;
  shipping_method?: string;
}

export const getValidMitraOrderCode = (meta?: ChatContextMetadata | null): string => {
  const raw = (meta?.mitra_order_code || "").trim();
  if (raw && !raw.toUpperCase().startsWith("TRX-")) return raw;
  return "";
};

export const parseChatMetadata = (raw: unknown): ChatContextMetadata | null => {
  if (!raw) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj.context_type === "product" || obj.context_type === "order") {
      return obj as unknown as ChatContextMetadata;
    }
    return null;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed.context_type === "product" || parsed.context_type === "order")
      ) {
        return parsed as ChatContextMetadata;
      }
    } catch {
      return null;
    }
  }
  return null;
};

export interface DinoyoSticker {
  filename: string;
  title: string;
  previewSrc: string;
  serverPath: string;
}

export const DINOYO_STICKERS: DinoyoSticker[] = [
  {
    filename: "sticker_clay_halo.jpg",
    title: "Halo!",
    previewSrc: "/stickers/sticker_clay_halo.jpg",
    serverPath: "/uploads/stickers/sticker_clay_halo.jpg",
  },
  {
    filename: "sticker_clay_thumbsup.jpg",
    title: "Mantap 👍",
    previewSrc: "/stickers/sticker_clay_thumbsup.jpg",
    serverPath: "/uploads/stickers/sticker_clay_thumbsup.jpg",
  },
  {
    filename: "sticker_clay_packing.jpg",
    title: "Packing Aman",
    previewSrc: "/stickers/sticker_clay_packing.jpg",
    serverPath: "/uploads/stickers/sticker_clay_packing.jpg",
  },
  {
    filename: "sticker_clay_love.jpg",
    title: "Suka Banget ❤️",
    previewSrc: "/stickers/sticker_clay_love.jpg",
    serverPath: "/uploads/stickers/sticker_clay_love.jpg",
  },
  {
    filename: "sticker_clay_crafting.jpg",
    title: "Workshop",
    previewSrc: "/stickers/sticker_clay_crafting.jpg",
    serverPath: "/uploads/stickers/sticker_clay_crafting.jpg",
  },
  {
    filename: "sticker_clay_tanya.jpg",
    title: "Tanya Dulu",
    previewSrc: "/stickers/sticker_clay_tanya.jpg",
    serverPath: "/uploads/stickers/sticker_clay_tanya.jpg",
  },
  {
    filename: "sticker_clay_diskon.jpg",
    title: "Ada Diskon?",
    previewSrc: "/stickers/sticker_clay_diskon.jpg",
    serverPath: "/uploads/stickers/sticker_clay_diskon.jpg",
  },
  {
    filename: "sticker_clay_makasih.jpg",
    title: "Terima Kasih",
    previewSrc: "/stickers/sticker_clay_makasih.jpg",
    serverPath: "/uploads/stickers/sticker_clay_makasih.jpg",
  },
];

export const isStickerUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return url.includes("sticker") || url.includes("/stickers/");
};

export const formatMessagePreview = (
  text?: string | null,
  imageUrl?: string | null,
  fallback = "",
  metadata?: unknown
): string => {
  const cleanText = text?.trim() || "";
  const parsedMeta = parseChatMetadata(metadata);
  if (parsedMeta && !cleanText) {
    if (parsedMeta.context_type === "product") {
      return `🛍️ [Produk] ${parsedMeta.product_name || "Keramik"}`;
    }
    if (parsedMeta.context_type === "order") {
      const code =
        parsedMeta.mitra_order_code ||
        parsedMeta.order_code ||
        `#DNC-${parsedMeta.order_id || ""}`;
      return `📦 [${code}] ${parsedMeta.product_name || "Pesanan"}`;
    }
  }
  if (
    imageUrl &&
    imageUrl.trim() &&
    imageUrl !== "null" &&
    (!cleanText || cleanText === "📷 [Foto]" || cleanText === "🏷️ Stiker")
  ) {
    return isStickerUrl(imageUrl) ? "🏷️ Stiker" : "📷 [Foto]";
  }
  if (cleanText) return cleanText;
  if (imageUrl && imageUrl.trim() && imageUrl !== "null") {
    return isStickerUrl(imageUrl) ? "🏷️ Stiker" : "📷 [Foto]";
  }
  return fallback;
};

export const resolveChatImageUrl = (url?: string | null): string => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  let normalized = url;
  if (normalized.startsWith("assets/stickers/")) {
    normalized = `/uploads/stickers/${normalized.replace("assets/stickers/", "")}`;
  } else if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  const apiHost =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "").replace(/\/+$/, "") ||
    "http://localhost:5000";
  return `${apiHost}${normalized}`;
};

export const isAiChatMetadata = (raw: unknown): boolean => {
  if (!raw) return false;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return Boolean((raw as Record<string, unknown>).is_ai);
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Boolean(parsed && typeof parsed === "object" && parsed.is_ai);
    } catch {
      return false;
    }
  }
  return false;
};

export const formatChatTime = (value?: string | Date | null): string => {
  if (!value) return "";
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "";
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch {
    return "";
  }
};

export const formatLastSeen = (lastSeen?: string): string => {
  if (!lastSeen) return "Offline";
  try {
    const d = new Date(lastSeen);
    if (isNaN(d.getTime())) return "Offline";
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `Terakhir dilihat ${hours}:${minutes}`;
  } catch {
    return "Offline";
  }
};

interface ChatMessageMediaProps {
  imageUrl?: string | null;
  text?: string;
}

export function ChatMessageMedia({ imageUrl, text }: ChatMessageMediaProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const sticker = isStickerUrl(imageUrl);
  const fullImgUrl = resolveChatImageUrl(imageUrl);

  useEffect(() => {
    if (!previewOpen) return;
    const handleEsc = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setPreviewOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [previewOpen]);

  if (!imageUrl) return null;

  if (sticker) {
    return (
      <div className="p-0 select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullImgUrl}
          alt="Stiker Si Clay"
          className="w-[120px] h-[120px] object-contain drop-shadow-sm hover:scale-105 transition-transform"
          loading="lazy"
          onError={(e) => {
            const filename = imageUrl.split("/").pop();
            if (filename && !e.currentTarget.src.includes(`/stickers/${filename}`)) {
              e.currentTarget.src = `/stickers/${filename}`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className={`block overflow-hidden rounded-xl border border-zinc-200/60 cursor-pointer focus:outline-none ${text ? "mb-2" : ""}`}
        aria-label="Lihat preview foto"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullImgUrl}
          alt="Foto chat"
          className="max-w-[220px] max-h-[220px] object-cover rounded-xl hover:opacity-95 transition-opacity"
          loading="lazy"
        />
      </button>

      {previewOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Preview foto"
            onClick={() => setPreviewOpen(false)}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label="Tutup preview foto"
              className="fixed top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={20} weight="bold" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullImgUrl}
              alt="Preview foto chat"
              onClick={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl select-none"
            />
          </div>,
          document.body
        )}
    </>
  );
}

interface ChatMediaComposerProps {
  message: string;
  onMessageChange: (val: string) => void;
  onSubmitText: (e: React.FormEvent) => void;
  onSelectImage: (file: File) => void;
  onSelectSticker: (sticker: DinoyoSticker) => void;
  placeholder: string;
  disabled?: boolean;
  canSubmitEmptyText?: boolean;
}

export function ChatMediaComposer({
  message,
  onMessageChange,
  onSubmitText,
  onSelectImage,
  onSelectSticker,
  placeholder,
  disabled = false,
  canSubmitEmptyText = false,
}: ChatMediaComposerProps) {
  const [stickerOpen, setStickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stickerOpen) return;
    const handleOutsideClick = (ev: MouseEvent) => {
      if (
        stickerWrapperRef.current &&
        !stickerWrapperRef.current.contains(ev.target as Node)
      ) {
        setStickerOpen(false);
      }
    };
    const handleEsc = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setStickerOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [stickerOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    onSelectImage(file);
  };

  return (
    <div className="p-4 border-t border-zinc-200 relative" ref={stickerWrapperRef}>
      {stickerOpen && (
        <div className="absolute bottom-full left-4 right-4 sm:left-auto sm:right-14 mb-2 sm:w-[340px] bg-white border border-zinc-200 rounded-2xl shadow-xl p-3.5 z-30">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-sm font-bold text-zinc-900 leading-tight">Stiker Si Clay</p>
              <p className="text-[11px] text-zinc-500">Ketuk stiker untuk langsung mengirim</p>
            </div>
            <button
              type="button"
              onClick={() => setStickerOpen(false)}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Tutup stiker"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DINOYO_STICKERS.map((stk) => (
              <button
                key={stk.filename}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setStickerOpen(false);
                  onSelectSticker(stk);
                }}
                className="flex flex-col items-center p-1.5 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer disabled:opacity-50"
                title={stk.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stk.previewSrc}
                  alt={stk.title}
                  className="w-14 h-14 object-contain"
                />
                <span className="mt-1 text-[10px] font-medium text-zinc-600 truncate w-full text-center">
                  {stk.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmitText} className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          title="Kirim gambar / foto"
          aria-label="Kirim gambar atau foto"
          className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl border border-zinc-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Paperclip size={20} />
        </button>

        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setStickerOpen((prev) => !prev)}
            title="Stiker Si Clay"
            aria-label="Pilih stiker"
            className={`absolute right-2 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${stickerOpen
                ? "text-zinc-900 bg-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              }`}
          >
            <Smiley size={20} weight={stickerOpen ? "fill" : "regular"} />
          </button>
        </div>

        <button
          type="submit"
          disabled={disabled || (!message.trim() && !canSubmitEmptyText)}
          title="Kirim pesan"
          aria-label="Kirim pesan"
          className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <PaperPlaneRight size={20} weight="fill" />
        </button>
      </form>
    </div>
  );
}

const formatRupiahCard = (val?: number | null) =>
  `Rp ${Math.round(Number(val || 0)).toLocaleString("id-ID")}`;

const getOrderStatusTheme = (rawStatus?: string) => {
  const st = (rawStatus || "").toLowerCase();
  if (st === "pending" || st === "unpaid") {
    return {
      label: "Belum Dibayar",
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      icon: Clock,
    };
  }
  if (st === "paid" || st === "packed") {
    return {
      label: st === "paid" ? "Dibayar • Perlu Dikemas" : "Produk Dikemas",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Package,
    };
  }
  if (st === "shipped") {
    return {
      label: "Sedang Dikirim",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Truck,
    };
  }
  if (st === "completed" || st === "selesai" || st === "delivered") {
    return {
      label: "Pesanan Selesai",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
    };
  }
  return {
    label: "Pesanan Dibatalkan",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    icon: WarningCircle,
  };
};

export function ChatMessageContextCard({
  metadata,
  viewerRole = "mitra",
  onOpenOrder,
  onOpenProduct,
}: {
  metadata?: ChatContextMetadata | null;
  viewerRole?: "mitra" | "admin";
  onOpenOrder?: (meta: ChatContextMetadata) => void;
  onOpenProduct?: (meta: ChatContextMetadata) => void;
}) {
  if (!metadata) return null;
  const imgSrc =
    resolveChatImageUrl(metadata.image_url) ||
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80";

  if (metadata.context_type === "product") {
    const ratingVal = Number(metadata.rating || 0);
    const soldVal = Number(metadata.sold_count || 0);
    return (
      <div className="w-[268px] sm:w-[288px] rounded-xl bg-white text-zinc-900 border border-zinc-200 p-3 shadow-xs">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
            <ShoppingBag size={11} weight="fill" />
            {metadata.badge || "Ditanyakan"}
          </span>
          {(metadata.studio || metadata.store_name) && (
            <span className="text-[11px] text-zinc-500 truncate">
              {metadata.studio || metadata.store_name}
            </span>
          )}
        </div>
        <div className="flex gap-2.5 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={metadata.product_name || "Produk"}
            className="w-16 h-16 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">
              {metadata.product_name || "Produk Keramik"}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
              <Star size={12} weight="fill" className="text-amber-500 shrink-0" />
              <span className="font-semibold text-zinc-700">
                {ratingVal > 0 ? ratingVal.toFixed(1) : "Baru"}
              </span>
              <span>• Terjual {soldVal}</span>
            </div>
            <p className="text-xs font-extrabold text-zinc-900 mt-1">
              {formatRupiahCard(metadata.price ?? metadata.unit_price)}
            </p>
          </div>
        </div>
        {onOpenProduct && (
          <button
            type="button"
            onClick={() => onOpenProduct(metadata)}
            className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingBag size={13} />
            {viewerRole === "mitra" ? "Lihat di Katalog Toko" : "Lihat Detail Produk"}
          </button>
        )}
      </div>
    );
  }

  // context_type === "order"
  const theme = getOrderStatusTheme(metadata.status);
  const StatusIcon = theme.icon;
  const validMitraCode = getValidMitraOrderCode(metadata);
  const fallbackDncCode =
    metadata.order_code || (metadata.order_id ? `#DNC-${metadata.order_id}` : "");
  const codeDisplay =
    viewerRole === "mitra"
      ? validMitraCode || fallbackDncCode || metadata.mitra_order_code || ""
      : fallbackDncCode || validMitraCode || metadata.reference_code || "";
  const qty = Number(metadata.quantity || 1);
  const otherCount = Number(metadata.other_items_count || 0);

  return (
    <div className="w-[276px] sm:w-[304px] rounded-xl bg-white text-zinc-900 border border-zinc-200 p-3 shadow-xs">
      <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-zinc-100">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${theme.badgeClass}`}
        >
          <StatusIcon size={11} weight="bold" />
          {metadata.section_label || metadata.status_label || theme.label}
        </span>
        <span className="text-[11px] font-mono font-semibold text-zinc-500 truncate">
          {codeDisplay}
        </span>
      </div>

      <div className="flex gap-2.5 items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={metadata.product_name || "Pesanan"}
          className="w-16 h-16 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">
            {metadata.product_name || "Pesanan Keramik"}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            {metadata.variant ? `${metadata.variant} • ` : ""}
            {qty}x
            {otherCount > 0 ? ` (+${otherCount} produk lain)` : ""}
          </p>
          <p className="text-xs font-extrabold text-zinc-900 mt-1">
            Total: {formatRupiahCard(metadata.total_amount ?? metadata.price)}
          </p>
        </div>
      </div>

      {metadata.tracking_number && (
        <div className="mt-2 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold flex items-center gap-1.5">
          <Truck size={12} />
          <span className="truncate">
            {metadata.shipping_method ? `${metadata.shipping_method} • ` : ""}
            Resi: {metadata.tracking_number}
          </span>
        </div>
      )}

      {onOpenOrder && (
        <button
          type="button"
          onClick={() => onOpenOrder(metadata)}
          className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowSquareOut size={13} />
          {viewerRole === "mitra" ? "Buka di Manajemen Pesanan" : "Lihat Transaksi"}
        </button>
      )}
    </div>
  );
}

interface QuickReplyOption {
  label: string;
  text: string;
}

const getQuickTemplatesForStatus = (
  rawStatus?: string,
  orderCode?: string,
  productName?: string
): QuickReplyOption[] => {
  const st = (rawStatus || "").toLowerCase();
  const codeRef = orderCode ? ` (${orderCode})` : "";
  const prodRef = productName || "produk keramik";

  if (st === "pending" || st === "unpaid") {
    return [
      {
        label: "Ingatkan pembayaran",
        text: `Halo Kak, pesanan ${prodRef}${codeRef} sudah kami terima. Silakan selesaikan pembayaran agar segera kami kemas ya 🙏`,
      },
      {
        label: "Tanya kendala bayar",
        text: `Halo Kak, apakah ada kendala saat proses pembayaran pesanan${codeRef}? Kami siap membantu.`,
      },
    ];
  }
  if (st === "paid" || st === "packed") {
    return [
      {
        label: "Info sedang dikemas",
        text: `Halo Kak, pesanan ${prodRef}${codeRef} sedang kami siapkan & kemas ekstra aman dengan bubble wrap + rangka kayu 📦`,
      },
      {
        label: "Konfirmasi detail pesanan",
        text: `Halo Kak, mohon konfirmasi apakah detail pesanan ${prodRef}${codeRef} sudah sesuai ya 🙏`,
      },
    ];
  }
  if (st === "shipped") {
    return [
      {
        label: "Info sudah dikirim",
        text: `Halo Kak, paket ${prodRef}${codeRef} sudah kami serahkan ke kurir pengiriman. Silakan dipantau resinya ya 🚚`,
      },
      {
        label: "Minta konfirmasi terima",
        text: `Halo Kak, jika paket ${prodRef}${codeRef} sudah diterima dengan aman, mohon konfirmasi Pesanan Diterima ya 🙏`,
      },
    ];
  }
  if (st === "completed" || st === "selesai" || st === "delivered") {
    return [
      {
        label: "Terima kasih & minta rating ⭐",
        text: `Terima kasih telah membeli ${prodRef}${codeRef} di toko kami Kak! Jika berkenan, mohon berikan rating & ulasan untuk membantu toko kami ya ⭐🙏`,
      },
      {
        label: "Tanya kondisi paket",
        text: `Halo Kak, terima kasih sudah berbelanja di toko kami! Semoga ${prodRef}${codeRef} diterima dalam kondisi baik dan berkenan di hati Kakak. Ditunggu ulasannya ya 😊`,
      },
      {
        label: "Ucapan & undang repeat order",
        text: `Pesanan${codeRef} sudah selesai. Terima kasih banyak atas kepercayaannya Kak! Jangan ragu beri bintang & ulasan jika puas, kami tunggu pesanan berikutnya 🙏`,
      },
    ];
  }
  return [
    {
      label: "Tawarkan pesan ulang",
      text: `Halo Kak, terkait pesanan${codeRef} yang dibatalkan, silakan kabari kami jika ingin memesan kembali ya 🙏`,
    },
  ];
};

export function ChatComposerContextBanner({
  context,
  onClear,
  onPickQuickReply,
}: {
  context: ChatContextMetadata;
  onClear: () => void;
  onPickQuickReply?: (text: string) => void;
}) {
  const theme = getOrderStatusTheme(context.status);
  const StatusIcon = theme.icon;
  const imgSrc =
    resolveChatImageUrl(context.image_url) ||
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80";
  const displayCode =
    getValidMitraOrderCode(context) ||
    context.order_code ||
    (context.order_id ? `#DNC-${context.order_id}` : "");
  const templates =
    context.context_type === "order"
      ? getQuickTemplatesForStatus(context.status, displayCode, context.product_name)
      : [];

  return (
    <div className="px-4 pt-3 pb-2.5 bg-zinc-50 border-t border-zinc-200 flex flex-col gap-2 min-w-0 overflow-hidden">
      <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-2.5 shadow-2xs min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={context.product_name || "Preview"}
          className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${theme.badgeClass}`}
            >
              <StatusIcon size={11} weight="bold" />
              {context.section_label || context.status_label || theme.label}
            </span>
            {displayCode && (
              <span className="text-[11px] font-mono font-semibold text-zinc-500 truncate">
                {displayCode}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-zinc-900 truncate mt-1">
            {context.product_name || "Pesanan Keramik"}
            {context.variant ? ` • ${context.variant}` : ""}
            {context.quantity ? ` (${context.quantity}x)` : ""}
            {Number(context.other_items_count || 0) > 0
              ? ` +${context.other_items_count} produk lain`
              : ""}
          </p>
          <p className="text-xs font-extrabold text-zinc-800 mt-0.5">
            Total: {formatRupiahCard(context.total_amount ?? context.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          title="Hapus lampiran pesanan"
          aria-label="Hapus lampiran pesanan"
          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X size={16} weight="bold" />
        </button>
      </div>

      {onPickQuickReply && templates.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {templates.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onPickQuickReply(tpl.text)}
              title={tpl.text}
              className="text-[11px] font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1 transition-colors cursor-pointer text-left max-w-full truncate"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
