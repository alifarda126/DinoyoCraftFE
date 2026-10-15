"use client";

import Link from "next/link";
import { Storefront } from "@phosphor-icons/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={pjs.className}
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #fdf6ee 0%, #f5ece0 50%, #ede3d4 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorations */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <svg style={{ position: "absolute", top: "8%", left: "2%", width: "36vw", opacity: 0.07 }} viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="180" stroke="var(--clay)" strokeWidth="2" strokeDasharray="20 10" />
          <circle cx="200" cy="200" r="140" stroke="var(--bark)" strokeWidth="1.5" strokeDasharray="14 8" />
          <circle cx="200" cy="200" r="100" stroke="var(--moss)" strokeWidth="1" strokeDasharray="8 6" />
          <circle cx="200" cy="200" r="60" stroke="var(--clay)" strokeWidth="1" />
        </svg>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${10 + (i % 4) * 22}%`,
              left: `${5 + i * 5}%`,
              width: 5 + (i % 3) * 3,
              height: 5 + (i % 3) * 3,
              borderRadius: "50%",
              background: i % 2 === 0 ? "var(--clay)" : "var(--moss)",
              opacity: 0.09,
            }}
          />
        ))}
        <svg style={{ position: "absolute", top: "-15%", right: "-5%", width: "42vw", opacity: 0.055 }} viewBox="0 0 500 500" fill="none">
          <ellipse cx="250" cy="250" rx="240" ry="200" fill="var(--moss)" transform="rotate(20 250 250)" />
        </svg>
      </div>

      {/* Top Nav */}
      <header
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          padding: "0.875rem 2.5rem",
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, var(--clay), #c0673d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(180,90,50,0.3)",
            }}
          >
            <Storefront size={17} weight="fill" color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "var(--bark)" }}>
            Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span>
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--clay)",
              background: "rgba(184,92,60,0.1)",
              padding: "0.2rem 0.5rem",
              borderRadius: "0.375rem",
              letterSpacing: "0.04em",
            }}
          >
            PORTAL
          </span>
        </Link>
        <a
          href="mailto:bantuan@dinoyocraft.id"
          style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--clay)", textDecoration: "none" }}
        >
          Butuh bantuan?
        </a>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>
        {children}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
