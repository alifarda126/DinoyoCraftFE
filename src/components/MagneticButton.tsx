"use client";

import React, { useRef } from "react";
import Link from "next/link";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  innerClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  strength?: number;
  textStrength?: number;
  target?: string;
  rel?: string;
}

export default function MagneticButton({
  children,
  href,
  className = "",
  innerClassName = "",
  onClick,
  strength = 0.3,
  textStrength = 0.2,
  target,
  rel,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    // Avoid magnetic pull on touch devices to allow natural scrolling
    if (e.pointerType === "touch") return;
    if (!buttonRef.current || !textRef.current) return;

    const { clientX, clientY } = e;
    const rect = buttonRef.current.getBoundingClientRect();

    // Kalkulasi posisi X dan Y dari titik tengah tombol
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);

    // Terapkan transform langsung ke style untuk performa animasi yang mulus
    buttonRef.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    textRef.current.style.transform = `translate(${x * textStrength}px, ${y * textStrength}px)`;
  };

  const handleReset = () => {
    if (!buttonRef.current || !textRef.current) return;

    // Kembalikan posisi ke awal saat pointer keluar (0px, 0px)
    buttonRef.current.style.transform = "translate(0px, 0px)";
    textRef.current.style.transform = "translate(0px, 0px)";
  };

  const combinedButtonClass = `relative select-none transition-transform duration-100 ease-out will-change-transform ${className}`.trim();
  const combinedTextClass = `inline-flex items-center gap-2 transition-transform duration-100 ease-out will-change-transform pointer-events-none ${innerClassName}`.trim();

  const innerContent = (
    <span ref={textRef} className={combinedTextClass}>
      {children}
    </span>
  );

  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link
          href={href}
          ref={(node) => {
            buttonRef.current = node;
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handleReset}
          onBlur={handleReset}
          onClick={onClick}
          className={combinedButtonClass}
        >
          {innerContent}
        </Link>
      );
    }

    return (
      <a
        href={href}
        ref={(node) => {
          buttonRef.current = node;
        }}
        target={target}
        rel={rel}
        onPointerMove={handlePointerMove}
        onPointerLeave={handleReset}
        onBlur={handleReset}
        onClick={onClick}
        className={combinedButtonClass}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type="button"
      ref={(node) => {
        buttonRef.current = node;
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handleReset}
      onBlur={handleReset}
      onClick={onClick}
      className={combinedButtonClass}
    >
      {innerContent}
    </button>
  );
}
