/*  */"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Check } from "@phosphor-icons/react";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  style?: React.CSSProperties;
  minWidth?: number;
};

export function EarthySelect({
  value,
  onChange,
  options,
  placeholder,
  style,
  minWidth = 150,
}: Props) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Only render portal after client hydration to prevent mismatch
  useEffect(() => { setMounted(true); }, []);

  const selectedLabel =
    options.find(o => o.value === value)?.label ??
    placeholder ??
    options[0]?.label;

  const calcCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }, []);

  function handleToggle() {
    if (!open) calcCoords();
    setOpen(o => !o);
  }

  // Keep panel aligned on scroll / resize
  useEffect(() => {
    if (!open) return;
    const update = () => calcCoords();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, calcCoords]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const panel = open && (
    <div
      ref={panelRef}
      id={`earthy-panel-${uid}`}
      role="listbox"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        minWidth: Math.max(coords.width, minWidth),
        zIndex: 9999,
        background: "#fff",
        borderRadius: "0.875rem",
        border: "1.5px solid var(--line, #e5e5e5)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
        overflow: "hidden",
        animationName: "earthyDropIn",
        animationDuration: "0.15s",
        animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
        animationFillMode: "both",
      }}
    >
      {options.map((opt, i) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
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
              gap: "0.5rem",
              padding: "0.6rem 0.9rem",
              background: isSelected ? "rgba(0,0,0,0.05)" : "transparent",
              color: "var(--bark, #000)",
              fontSize: "0.85rem",
              fontWeight: isSelected ? 700 : 500,
              fontFamily: "var(--font-outfit), sans-serif",
              border: "none",
              borderBottom:
                i < options.length - 1
                  ? "1px solid rgba(0,0,0,0.05)"
                  : "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.12s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              if (!isSelected)
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)";
            }}
            onMouseLeave={e => {
              if (!isSelected)
                (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <span>{opt.label}</span>
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
      })}
    </div>
  );

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
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
          background: "#fff",
          color: "var(--bark, #000)",
          fontSize: "0.85rem",
          fontWeight: 600,
          fontFamily: "var(--font-outfit), sans-serif",
          cursor: "pointer",
          outline: "none",
          boxShadow: open
            ? "0 0 0 3px rgba(0,0,0,0.08)"
            : "0 1px 3px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s, box-shadow 0.15s",
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        <span>{selectedLabel}</span>
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

      {/* Panel — rendered via portal to escape overflow:hidden parents */}
      {mounted && createPortal(panel, document.body)}
    </>
  );
}
