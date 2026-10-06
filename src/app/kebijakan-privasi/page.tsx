"use client";

import Link from "next/link";
import { ArrowLeft, Storefront } from "@phosphor-icons/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

const sections = [
  {
    title: "1. Data yang Kami Kumpulkan",
    content:
      "Kami mengumpulkan informasi yang Anda berikan secara langsung, seperti nama, email, nomor telepon, dan alamat saat mendaftar atau melakukan transaksi. Kami juga mengumpulkan data penggunaan secara otomatis untuk meningkatkan layanan.",
  },
  {
    title: "2. Penggunaan Data",
    content:
      "Data Anda digunakan untuk memproses transaksi, mengirim notifikasi terkait pesanan, meningkatkan pengalaman pengguna, serta keperluan keamanan dan pencegahan penipuan.",
  },
  {
    title: "3. Berbagi Data",
    content:
      "Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Data dapat dibagikan kepada mitra pengiriman dan penyedia pembayaran yang diperlukan untuk menyelesaikan transaksi Anda.",
  },
  {
    title: "4. Keamanan Data",
    content:
      "Kami menerapkan enkripsi SSL dan langkah-langkah keamanan industri standar untuk melindungi data Anda. Namun, tidak ada sistem yang 100% aman — kami menyarankan Anda menggunakan kata sandi yang kuat.",
  },
  {
    title: "5. Cookie",
    content:
      "DinoyoCraft menggunakan cookie untuk mengingat preferensi Anda dan menganalisis lalu lintas situs. Anda dapat menonaktifkan cookie di pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal.",
  },
  {
    title: "6. Hak Pengguna",
    content:
      "Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja. Untuk permintaan penghapusan akun atau data, silakan hubungi tim kami melalui email.",
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        fontFamily: pjs.style.fontFamily,
        background: "linear-gradient(135deg, #fdf6ee 0%, #f5ece0 50%, #ede3d4 100%)",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          padding: "0.875rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "0.5rem",
            background: "linear-gradient(135deg, var(--clay), #c0673d)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Storefront size={17} weight="fill" color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "var(--bark)" }}>
            Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span>
          </span>
        </Link>
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--bark-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}
        >
          <ArrowLeft size={14} weight="bold" />
          Kembali
        </Link>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{
            display: "inline-block", fontSize: "0.72rem", fontWeight: 700, color: "var(--clay)",
            background: "rgba(184,92,60,0.1)", padding: "0.25rem 0.7rem",
            borderRadius: "999px", letterSpacing: "0.05em", marginBottom: "0.75rem",
          }}>
            LEGAL
          </span>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--bark)", margin: "0 0 0.5rem" }}>
            Kebijakan Privasi
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--bark-muted)", margin: 0, lineHeight: 1.6 }}>
            Terakhir diperbarui: Oktober 2024 &nbsp;·&nbsp; Berlaku untuk semua pengguna DinoyoCraft
          </p>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: "1.25rem",
          border: "1.5px solid rgba(255,255,255,0.9)",
          boxShadow: "0 4px 24px rgba(120,70,30,0.1)",
          overflow: "hidden",
        }}>
          {sections.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "1.5rem 2rem",
                borderBottom: i < sections.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
              }}
            >
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--clay)", margin: "0 0 0.5rem", letterSpacing: "-0.01em" }}>
                {s.title}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "var(--bark-muted)", margin: 0, lineHeight: 1.7 }}>
                {s.content}
              </p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: "2rem", fontSize: "0.8rem", color: "var(--bark-muted)", textAlign: "center", lineHeight: 1.6 }}>
          Pertanyaan? Hubungi kami di{" "}
          <a href="mailto:bantuan@dinoyocraft.id" style={{ color: "var(--clay)", fontWeight: 600 }}>
            bantuan@dinoyocraft.id
          </a>
        </p>
      </main>
    </div>
  );
}
