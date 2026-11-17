"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Paperclip, PaperPlaneRight, Smiley, X } from "@phosphor-icons/react";

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
  fallback = ""
): string => {
  const cleanText = text?.trim() || "";
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
}

export function ChatMediaComposer({
  message,
  onMessageChange,
  onSubmitText,
  onSelectImage,
  onSelectSticker,
  placeholder,
  disabled = false,
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
            className={`absolute right-2 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
              stickerOpen
                ? "text-zinc-900 bg-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Smiley size={20} weight={stickerOpen ? "fill" : "regular"} />
          </button>
        </div>

        <button
          type="submit"
          disabled={disabled || !message.trim()}
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
