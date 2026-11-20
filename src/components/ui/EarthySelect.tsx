"use client";

import React, { useState, useRef, useEffect, useCallback, useId, useMemo } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Check, MagnifyingGlass, X } from "@phosphor-icons/react";

export type EarthySelectOption = {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: EarthySelectOption[];
  placeholder?: string;
  style?: React.CSSProperties;
  minWidth?: number;
  maxHeight?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
};

type PanelCoords = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "bottom" | "top";
};

export function EarthySelect({
  value,
  onChange,
  options,
  placeholder,
  style,
  minWidth = 150,
  maxHeight = 280,
  searchable,
  searchPlaceholder = "Cari opsi...",
  disabled = false,
}: Props) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [coords, setCoords] = useState<PanelCoords>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight,
    placement: "bottom",
  });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showSearch = searchable ?? options.length > 10;

  // Only render portal after client hydration to prevent mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const selectedLabel =
    selectedOption?.label ?? placeholder ?? options[0]?.label ?? "";

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const calcCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const spaceBelow = vh - rect.bottom - 16;
    const spaceAbove = rect.top - 16;
    const searchOverhead = showSearch ? 52 : 0;

    const openDownward = spaceBelow >= 180 || spaceBelow >= spaceAbove;
    const placement: "bottom" | "top" = openDownward ? "bottom" : "top";
    const availableVertical = Math.max(
      130,
      (openDownward ? spaceBelow : spaceAbove) - searchOverhead
    );
    const computedMaxHeight = Math.min(maxHeight, availableVertical);

    const targetWidth = Math.min(Math.max(rect.width, minWidth), vw - 24);
    const clampedLeft = Math.max(12, Math.min(rect.left, vw - targetWidth - 12));

    if (openDownward) {
      setCoords({
        top: rect.bottom + 6,
        left: clampedLeft,
        width: rect.width,
        maxHeight: computedMaxHeight,
        placement,
      });
    } else {
      setCoords({
        bottom: vh - rect.top + 6,
        left: clampedLeft,
        width: rect.width,
        maxHeight: computedMaxHeight,
        placement,
      });
    }
  }, [maxHeight, minWidth, showSearch]);

  function handleToggle() {
    if (disabled) return;
    if (!open) {
      calcCoords();
      setSearchQuery("");
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  // Keep panel aligned on external scroll / resize (ignore internal list scroll)
  useEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) {
        return;
      }
      calcCoords();
    };
    const onResize = () => calcCoords();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, calcCoords]);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Scroll selected option into view & focus search input when opened
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      const activeEl = listRef.current?.querySelector('[aria-selected="true"]');
      if (activeEl instanceof HTMLElement) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
      if (showSearch) {
        searchInputRef.current?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [open, showSearch]);

  const panel = open && (
    <div
      ref={panelRef}
      id={`earthy-panel-${uid}`}
      role="listbox"
      style={{
        position: "fixed",
        ...(coords.placement === "bottom"
          ? { top: coords.top }
          : { bottom: coords.bottom }),
        left: coords.left,
        minWidth: Math.max(coords.width, minWidth),
        maxWidth: "calc(100vw - 24px)",
        zIndex: 10050,
        background: "#fff",
        borderRadius: "0.875rem",
        border: "1.5px solid var(--line, #e5e5e5)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
        animationName: "earthyDropIn",
        animationDuration: "0.15s",
        animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
        animationFillMode: "both",
      }}
    >
      {showSearch && (
        <div
          style={{
            padding: "0.5rem 0.65rem",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
          }}
        >
          <MagnifyingGlass
            size={14}
            weight="bold"
            color="var(--bark-muted, #737373)"
            style={{ flexShrink: 0 }}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.8rem",
              fontWeight: 500,
              fontFamily: "var(--font-outfit), sans-serif",
              color: "var(--bark, #000)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Hapus pencarian"
              style={{
                border: "none",
                background: "transparent",
                padding: 2,
                cursor: "pointer",
                color: "var(--bark-muted, #737373)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={13} weight="bold" />
            </button>
          )}
        </div>
      )}

      <div
        ref={listRef}
        style={{
          maxHeight: coords.maxHeight,
          overflowY: "auto",
          overscrollBehavior: "contain",
          scrollbarWidth: "thin",
        }}
      >
        {filteredOptions.length === 0 ? (
          <div
            style={{
              padding: "0.9rem 1rem",
              fontSize: "0.8rem",
              color: "var(--bark-muted, #737373)",
              fontFamily: "var(--font-outfit), sans-serif",
              textAlign: "center",
            }}
          >
            Tidak ada opsi yang cocok.
          </div>
        ) : (
          filteredOptions.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={`${opt.value}-${i}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.65rem",
                  padding: "0.625rem 0.9rem",
                  background: isSelected ? "rgba(0,0,0,0.05)" : "transparent",
                  color: "var(--bark, #000)",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? 700 : 500,
                  fontFamily: "var(--font-outfit), sans-serif",
                  border: "none",
                  borderBottom:
                    i < filteredOptions.length - 1
                      ? "1px solid rgba(0,0,0,0.05)"
                      : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s",
                  whiteSpace: coords.width > 260 ? "normal" : "nowrap",
                  lineHeight: 1.35,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(0,0,0,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {opt.icon && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {opt.icon}
                    </span>
                  )}
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span>{opt.label}</span>
                    {opt.sublabel && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 500,
                          color: "var(--bark-muted, #737373)",
                        }}
                      >
                        {opt.sublabel}
                      </span>
                    )}
                  </span>
                </span>
                {isSelected && (
                  <Check
                    size={14}
                    weight="bold"
                    color="var(--bark, #000)"
                    style={{ flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`earthy-panel-${uid}`}
        suppressHydrationWarning
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          minWidth,
          borderRadius: "0.625rem",
          border: open
            ? "1.5px solid var(--clay, #000)"
            : "1.5px solid var(--line, #e5e5e5)",
          background: disabled ? "#f5f5f5" : "#fff",
          color: "var(--bark, #000)",
          fontSize: "0.85rem",
          fontWeight: 600,
          fontFamily: "var(--font-outfit), sans-serif",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
          outline: "none",
          boxShadow: open
            ? "0 0 0 3px rgba(0,0,0,0.08)"
            : "0 1px 3px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s, box-shadow 0.15s",
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.55rem",
            flex: 1,
            minWidth: 0,
            textAlign: "left",
          }}
        >
          {selectedOption?.icon && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {selectedOption.icon}
            </span>
          )}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedLabel}
          </span>
        </span>
        <CaretDown
          size={13}
          weight="bold"
          color="var(--bark-muted, #737373)"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </button>

      {mounted && createPortal(panel, document.body)}
    </>
  );
}
