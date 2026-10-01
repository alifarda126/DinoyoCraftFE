"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  Storefront,
  Headset,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import Navbar from "@/components/layout/Navbar";

/* ────────────────────────────────────────────────────────────────────────────
   DATA — Program Mitra DinoyoCraft
   ──────────────────────────────────────────────────────────────────────────── */

const steps = [
  {
    title: "Daftar Jadi Mitra",
    text: "Daftarkan dirimu melalui tombol Daftar Sekarang dan bergabung bersama komunitas mitra DinoyoCraft untuk mulai berjualan keramik.",
  },
  {
    title: "Pilih Produk Keramik",
    text: "Akses katalog puluhan ribu produk kerajinan Kampung Keramik Dinoyo dan pilih produk yang ingin kamu pasarkan kepada pelanggan.",
  },
  {
    title: "Jual di Channelmu",
    text: "Pasarkan produk di marketplace, media sosial, atau grup komunitasmu. Kamu yang tentukan harga jual dan raup marginnya.",
  },
  {
    title: "Kami Proses & Kirim",
    text: "Saat pesanan masuk, tim pengrajin kami yang menyiapkan, mengemas dengan rapi, dan mengirim langsung ke pelanggan.",
  },
];

const whyData = [
  {
    title: "Relationship Manager",
    text: "Tim khusus yang siap membantu proses bisnismu, memberikan informasi terkini seputar produk keramik, serta membantu menyelesaikan kendala dalam berjualan online.",
  },
  {
    title: "Edukasi & Tips Bisnis",
    text: "Akses artikel, kelas, dan panduan langkah demi langkah khusus mitra untuk memaksimalkan keuntungan jualan keramik di marketplace dan media sosial.",
  },
  {
    title: "Margin Jual Fleksibel",
    text: "Tentukan sendiri harga jual produk keramik yang kamu pasarkan. Semakin laris daganganmu, semakin besar omzet yang mengalir ke rekeningmu.",
  },
  {
    title: "Laporan Omzet Real-time",
    text: "Pantau jumlah pesanan, produk terlaris, dan total pendapatan yang siap ditarik langsung dari dasbor mitra.",
  },
];

const faqs = [
  {
    q: "Bagaimana cara bergabung menjadi Mitra DinoyoCraft?",
    a: "Kamu cukup mendaftar melalui tombol Daftar Sekarang di halaman ini, lalu ikuti proses verifikasi dan aktivasi akunmu sebagai mitra.",
  },
  {
    q: "Apakah saya harus punya toko offline atau stok barang?",
    a: "Tidak perlu. Sebagai mitra, kamu cukup memasarkan produk keramik kepada calon pembeli. Tim kami yang menyiapkan dan mengirimkan produk.",
  },
  {
    q: "Bagaimana pesanan dikemas?",
    a: "Setiap pesanan dikemas dengan rapi dan profesional oleh pengrajin kami sebelum dikirimkan ke pelangganmu.",
  },
  {
    q: "Kapan saya bisa tarik penghasilan?",
    a: "Penghasilan yang mengendap di saldo mitra bisa ditarik ke rekening bank kamu kapan saja mengikuti ketentuan penarikan di dasbor mitra.",
  },
  {
    q: "Produk apa saja yang tersedia di katalog mitra?",
    a: "Katalog mitra mencakup lebih dari 100.000 produk keramik dari Kampung Keramik Dinoyo, mulai dari peralatan makan, dekorasi, hingga suvenir custom.",
  },
];

/* ──────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div
      style={{
        background: "var(--surface)",
        color: "var(--bark)",
        minHeight: "100dvh",
        fontFamily: "var(--font-outfit), sans-serif",
      }}
    >
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1.5px solid var(--line)",
        }}
      >
        {/* Background ceramic image + mask */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url('https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000&auto=format&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              opacity: 0.45,
              WebkitMaskImage:
                "linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)",
              maskImage:
                "linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)",
            }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center min-h-[88dvh] pt-16 pb-20 relative z-10">
          <div>
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--clay)",
                marginBottom: "1rem",
              }}
            >
              Mitra DinoyoCraft — Kampung Keramik Dinoyo, Malang
            </p>

            <h1
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.06,
                maxWidth: "18ch",
                color: "var(--bark)",
              }}
            >
              Bergabung Menjadi{" "}
              <span style={{ color: "var(--clay)" }}>Mitra DinoyoCraft</span>{" "}
              dan Raih Omzet Jutaan dari Keramik!
            </h1>

            <p
              style={{
                marginTop: "1.5rem",
                fontSize: "1.1rem",
                color: "var(--bark-muted)",
                lineHeight: 1.7,
                maxWidth: "60ch",
              }}
            >
              Bersama Program Mitra DinoyoCraft, kamu bisa memasarkan kerajinan
              keramik autentik dari Kampung Keramik Dinoyo. Tersedia berbagai
              fitur dan edukasi berbisnis untuk memaksimalkan keuntunganmu.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                marginTop: "2rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/mitra/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 1.9rem",
                  borderRadius: "9999px",
                  background: "var(--clay)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  transition:
                    "background 0.2s, transform 0.15s, box-shadow 0.2s",
                  boxShadow: "0 4px 16px rgba(184,92,60,0.25)",
                }}
              >
                Daftar Sekarang
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>

            <p
              style={{
                marginTop: "2.5rem",
                fontSize: "0.82rem",
                color: "var(--bark-muted)",
                fontWeight: 500,
              }}
            >
              Tanpa Stok Barang
              <span style={{ margin: "0 0.5rem", opacity: 0.4 }}>•</span>
              100.000+ Produk Keramik
              <span style={{ margin: "0 0.5rem", opacity: 0.4 }}>•</span>
              Packing Nama Tokomu
            </p>
          </div>

          {/* Image grid */}
          <div style={{ position: "relative" }}>
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 380,
                  height: 380,
                  borderRadius: "9999px",
                  background: "var(--clay)",
                  opacity: 0.08,
                  filter: "blur(80px)",
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <figure
                  style={{
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    aspectRatio: "4/5",
                    boxShadow: "0 4px 24px rgba(61,43,31,0.12)",
                    border: "1.5px solid var(--line)",
                  }}
                >
                  <Image
                    src="https://picsum.photos/seed/dinoyo-mitra-pottery/600/750"
                    alt="Mitra DinoyoCraft memegang keramik karya pengrajin Dinoyo"
                    width={600}
                    height={750}
                    priority
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </figure>
                <figure
                  style={{
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    aspectRatio: "1/1",
                    boxShadow: "0 4px 24px rgba(61,43,31,0.12)",
                    border: "1.5px solid var(--line)",
                  }}
                >
                  <Image
                    src="https://picsum.photos/seed/dinoyo-glaze-cup/600/600"
                    alt="Cangkir keramik glasir produk mitra"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </figure>
              </div>
              <div className="space-y-4 pt-12">
                <figure
                  style={{
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    aspectRatio: "1/1",
                    boxShadow: "0 4px 24px rgba(61,43,31,0.12)",
                    border: "1.5px solid var(--line)",
                  }}
                >
                  <Image
                    src="https://picsum.photos/seed/dinoyo-packaging/600/600"
                    alt="Packing keramik dengan nama toko mitra"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </figure>
                <figure
                  style={{
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    aspectRatio: "4/5",
                    boxShadow: "0 4px 24px rgba(61,43,31,0.12)",
                    border: "1.5px solid var(--line)",
                  }}
                >
                  <Image
                    src="https://picsum.photos/seed/dinoyo-workshop/600/750"
                    alt="Bengkel keramik Dinoyo tempat barang diproduksi dan dikirim"
                    width={600}
                    height={750}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APA ITU PROGRAM MITRA ──────────────────────────────────────── */}
      <section
        id="apa-itu"
        style={{
          borderBottom: "1.5px solid var(--line)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 700,
              height: 400,
              borderRadius: "9999px",
              background: "var(--clay)",
              opacity: 0.05,
              filter: "blur(140px)",
            }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              maxWidth: "40rem",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--clay)",
              }}
            >
              Apa Itu DinoyoCraft?
            </span>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--bark)",
              }}
            >
              Apa Itu Program Mitra DinoyoCraft?
            </h2>
            <p
              style={{
                marginTop: "1rem",
                color: "var(--bark-muted)",
                lineHeight: 1.8,
              }}
            >
              Program Mitra DinoyoCraft adalah sebuah peluang bisnis online
              yang dihadirkan untuk kamu yang ingin memasarkan produk kerajinan
              keramik khas Kampung Keramik Dinoyo, Malang. Cukup dengan
              memasarkan produk lewat channel yang kamu pilih — marketplace,
              media sosial, atau grup komunitas — saat pesanan masuk, tim
              pengrajin kami yang menyiapkan hingga mengirimkannya ke pelanggan.
            </p>
          </div>

          <div
            style={{
              marginTop: "3rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {[
              {
                title: "Tanpa Stok",
                text: "Kamu fokus memasarkan produk, kami yang menyiapkan dan mengirimkan pesanan ke pelanggan.",
              },
              {
                title: "Tanpa Gudang",
                text: "Tidak perlu cari tempat simpan barang atau khawatir stok menumpuk.",
              },
              {
                title: "Packing Profesional",
                text: "Semua pesanan dikemas rapi dan profesional oleh pengrajin kami.",
              },
              {
                title: "Omzet Jutaan",
                text: "Ribuan mitra telah meraih omzet jutaan dari memasarkan keramik.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="card-hover-glow"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--line)",
                  borderRadius: "1.25rem",
                  padding: "1.75rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "var(--bark)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    marginTop: "0.5rem",
                    color: "var(--bark-muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
                    maxWidth: "40ch",
                  }}
                >
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ────────────────────────────────────────────────── */}
      <section
        id="cara"
        style={{
          borderBottom: "1.5px solid var(--line)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            style={{
              position: "absolute",
              bottom: -40,
              right: "20%",
              width: 500,
              height: 300,
              borderRadius: "9999px",
              background: "var(--clay)",
              opacity: 0.05,
              filter: "blur(120px)",
            }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div style={{ maxWidth: "40rem" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--clay)",
              }}
            >
              Cara Kerja
            </span>
            <h2
              style={{
                marginTop: "0.5rem",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--bark)",
              }}
            >
              Mulai Bisnis Keramik dalam 4 Langkah
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((s, i) => (
              <div key={s.title} className="reveal">
                <span
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    color: "var(--clay)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "var(--bark)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    marginTop: "0.4rem",
                    color: "var(--bark-muted)",
                    lineHeight: 1.65,
                    fontSize: "0.9rem",
                    maxWidth: "34ch",
                  }}
                >
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── KENAPA MEMILIH ────────────────────────────────────────────── */}
      <section
        style={{
          borderBottom: "1.5px solid var(--line)",
          position: "relative",
          overflow: "hidden",
          background: "var(--surface-elevated)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div style={{ maxWidth: "40rem" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--clay)",
              }}
            >
              Kenapa Memilih DinoyoCraft?
            </span>
            <h2
              style={{
                marginTop: "0.5rem",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--bark)",
              }}
            >
              Nikmati Berbagai Kemudahan Berbisnis
            </h2>
          </div>

          <div
            className="mt-12 grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start"
          >
            {/* Feature list */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {whyData.map((f, i) => (
                <button
                  key={f.title}
                  onClick={() => setActiveFeature(i)}
                  style={{
                    textAlign: "left",
                    padding: "1.25rem 1.5rem",
                    borderRadius: "1rem",
                    border: `1.5px solid ${
                      activeFeature === i
                        ? "var(--clay)"
                        : "var(--line-strong)"
                    }`,
                    background:
                      activeFeature === i ? "var(--clay-muted)" : "#fff",
                    cursor: "pointer",
                    transition: "border-color 0.2s, background 0.2s",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--bark)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {f.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div
              className="card-hover-glow"
              style={{
                background: "#fff",
                border: "1.5px solid var(--line)",
                borderRadius: "1.5rem",
                padding: "2.5rem",
                position: "relative",
                overflow: "hidden",
                minHeight: 280,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  bottom: -40,
                  left: -40,
                  width: 160,
                  height: 160,
                  borderRadius: "9999px",
                  background: "var(--clay)",
                  opacity: 0.05,
                  filter: "blur(50px)",
                }}
              />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "9999px",
                  background: "var(--clay-muted)",
                  color: "var(--clay-dark)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <Storefront size={14} weight="bold" />
                {whyData[activeFeature].title}
              </span>
              <p
                style={{
                  marginTop: "1.5rem",
                  color: "var(--bark-mid)",
                  lineHeight: 1.8,
                  maxWidth: "52ch",
                  fontSize: "1rem",
                }}
              >
                {whyData[activeFeature].text}
              </p>
              <Link
                href="/mitra/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "2rem",
                  padding: "0.7rem 1.6rem",
                  borderRadius: "9999px",
                  background: "var(--clay)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  transition:
                    "background 0.2s, transform 0.15s",
                }}
              >
                DAFTAR SEKARANG
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* ── CTA / DAFTAR MITRA ─────────────────────────────────────────── */}
      <section
        style={{
          borderBottom: "1.5px solid var(--line)",
          position: "relative",
          overflow: "hidden",
          background: "var(--surface-elevated)",
        }}
      >
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 700,
              height: 400,
              borderRadius: "9999px",
              background: "var(--clay)",
              opacity: 0.05,
              filter: "blur(140px)",
            }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                }}
              >
                Mulai Sekarang
              </span>
              <h2
                style={{
                  marginTop: "0.5rem",
                  fontSize: "clamp(1.9rem, 4vw, 3rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "var(--bark)",
                }}
              >
                Daftar Mitra DinoyoCraft dan Mulai Berjualan Keramik
              </h2>
              <p
                style={{
                  marginTop: "1rem",
                  color: "var(--bark-muted)",
                  lineHeight: 1.7,
                  maxWidth: "50ch",
                }}
              >
                Bergabung bersama ribuan mitra yang telah memasarkan produk
                kerajinan keramik autentik dari Kampung Keramik Dinoyo, Malang.
              </p>
            </div>

            <div>
              <div
                className="card-hover-glow"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--line)",
                  borderRadius: "1.5rem",
                  padding: "2.5rem",
                }}
              >
                <p
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "var(--bark)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Kamu akan mendapatkan
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {[
                    "Lebih dari 100.000 pilihan produk keramik",
                    "Packing profesional oleh pengrajin kami",
                    "Dukungan Relationship Manager",
                    "Edukasi & tips bisnis dari para ahli",
                    "Laporan omzet real-time di dasbor mitra",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <CheckCircle
                        size={22}
                        weight="fill"
                        style={{
                          color: "var(--clay)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.95rem",
                          color: "var(--bark)",
                          lineHeight: 1.5,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/mitra/login"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginTop: "2rem",
                    padding: "0.9rem",
                    borderRadius: "0.875rem",
                    background: "var(--clay)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    transition:
                      "background 0.2s, transform 0.15s",
                  }}
                >
                  Daftar Sekarang
                  <ArrowRight weight="bold" size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{
          borderBottom: "1.5px solid var(--line)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div style={{ textAlign: "center", maxWidth: "36rem", margin: "0 auto" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--clay)",
              }}
            >
              FAQ
            </span>
            <h2
              style={{
                marginTop: "0.5rem",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--bark)",
              }}
            >
              Pertanyaan Seputar Program Mitra
            </h2>
          </div>

          <div
            style={{
              marginTop: "3rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${
                      open ? "var(--clay)" : "var(--line)"
                    }`,
                    borderRadius: "1rem",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      padding: "1.25rem 1.5rem",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-outfit), sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.98rem",
                        fontWeight: 700,
                        color: "var(--bark)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {f.q}
                    </span>
                    {open ? (
                      <CaretUp
                        size={18}
                        weight="bold"
                        style={{ color: "var(--clay)", flexShrink: 0 }}
                      />
                    ) : (
                      <CaretDown
                        size={18}
                        weight="bold"
                        style={{ color: "var(--bark-muted)", flexShrink: 0 }}
                      />
                    )}
                  </button>
                  {open && (
                    <div
                      style={{
                        padding: "0 1.5rem 1.5rem",
                        color: "var(--bark-muted)",
                        lineHeight: 1.7,
                        fontSize: "0.92rem",
                        maxWidth: "70ch",
                      }}
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Help CTA */}
          <div
            style={{
              marginTop: "2.5rem",
              background: "#fff",
              border: "1.5px solid var(--line)",
              borderRadius: "1.5rem",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <Headset size={32} weight="duotone" style={{ color: "var(--clay)" }} />
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--bark)",
              }}
            >
              Butuh Bantuan?
            </p>
            <p
              style={{
                marginTop: "0.4rem",
                fontSize: "0.9rem",
                color: "var(--bark-muted)",
              }}
            >
              Hubungi Relationship Manager kami.
            </p>
            <a
              href="mailto:cs@dinoyocraft.id"
              style={{
                display: "inline-block",
                marginTop: "1rem",
                color: "var(--clay)",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              cs@dinoyocraft.id
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--surface-elevated)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "40%",
            left: "60%",
            width: 360,
            height: 200,
            borderRadius: "9999px",
            background: "var(--clay)",
            opacity: 0.04,
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="max-w-[1400px] mx-auto px-5 lg:px-8"
          style={{
            padding: "3.5rem 2rem 2.5rem",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
            gap: "2.5rem",
          }}
        >
          {/* Brand column */}
          <div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.15rem",
                letterSpacing: "-0.03em",
                color: "var(--bark)",
              }}
            >
              Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span>
            </span>
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.85rem",
                color: "var(--bark-muted)",
                lineHeight: 1.7,
                maxWidth: "26ch",
              }}
            >
              Program mitra pemasaran kerajinan keramik autentik dari Kampung
              Keramik Dinoyo, Malang.
            </p>
            <Link
              href="/mitra/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                marginTop: "1.25rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "var(--clay)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.82rem",
                textDecoration: "none",
                transition: "background 0.2s",
                boxShadow: "0 2px 8px rgba(184,92,60,0.2)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--clay-dark)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--clay)")
              }
            >
              Jadi Mitra
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          {/* Program */}
          <div>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--bark)",
                marginBottom: "1rem",
              }}
            >
              Program
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {[
                { href: "/mitra/login", label: "Jadi Mitra" },
                { href: "/mitra/login", label: "Login Mitra" },
                { href: "/#faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--bark-muted)",
                    textDecoration: "none",
                    transition: "color 0.18s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "var(--clay)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "var(--bark-muted)")
                  }
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--bark)",
                marginBottom: "1rem",
              }}
            >
              Kontak
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <a href="https://wa.me/6281234567890" style={{ fontSize: "0.82rem", color: "var(--bark-muted)", textDecoration: "none", display: "block" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bark-muted)")}>
                WhatsApp: +62 812-3456-7890
              </a>
              <a href="mailto:cs@dinoyocraft.id" style={{ fontSize: "0.82rem", color: "var(--bark-muted)", textDecoration: "none", display: "block" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bark-muted)")}>
                Email: cs@dinoyocraft.id
              </a>
              <p style={{ fontSize: "0.82rem", color: "var(--bark-muted)" }}>
                Jl. Dinoyo, Kec. Lowokwaru
                <br />
                Kota Malang, Jawa Timur 65145
              </p>
            </div>
          </div>

          {/* Jam layanan */}
          <div>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--bark)",
                marginBottom: "1rem",
              }}
            >
              Kami Siap Melayani Anda
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--bark-muted)" }}>
              Setiap hari 09.00–18.00 WIB
              <br />
              (kecuali hari libur nasional)
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid var(--line)", padding: "1.125rem 0" }}>
          <div
            className="max-w-[1400px] mx-auto px-5 lg:px-8"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <p style={{ fontSize: "0.78rem", color: "var(--bark-muted)" }}>
              © {new Date().getFullYear()} DinoyoCraft. Seluruh hak cipta
              dilindungi.
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--bark-muted)" }}>
              <a href="/syarat-ketentuan" style={{ color: "var(--bark-muted)", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bark-muted)")}>Syarat &amp; Ketentuan</a>
              {" "}&bull;{" "}
              <a href="/kebijakan-privasi" style={{ color: "var(--bark-muted)", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bark-muted)")}>Kebijakan Privasi</a>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}