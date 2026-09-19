"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Wallet,
  QrCode,
  Bank,
  ShoppingCart,
  Star,
} from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import FAB from "@/components/FAB";
import { useCartStore } from "@/store/cartStore";
import { getDemoSession } from "@/lib/demo";

// Mock Data for Recommendation
const rekomendasiProduk = [
  { id: "p1", title: "Mug Keramik Motif Daun", store: "Studio Bumi", price: 120000, rating: 4.8, image: "https://picsum.photos/seed/mug1/400/400" },
  { id: "p2", title: "Piring Estetik Putih Tulang", store: "Keramik Rina", price: 85000, rating: 4.9, image: "https://picsum.photos/seed/plate1/400/400" },
  { id: "p3", title: "Vas Bunga Minimalis", store: "Tanah Liat Art", price: 250000, rating: 5.0, image: "https://picsum.photos/seed/vase1/400/400" },
  { id: "p4", title: "Set Cangkir Teh Klasik", store: "Dinoyo Heritage", price: 180000, rating: 4.7, image: "https://picsum.photos/seed/tea1/400/400" },
];

const features = [
  {
    label: "01",
    title: "Reservasi Rombongan",
    desc: "Pesan kelas keramik untuk satu rombongan dalam satu transaksi.",
  },
  {
    label: "02",
    title: "Suvenir Kustom",
    desc: "Ajukan desain cenderamata langsung ke pengrajin pilihanmu.",
  },
  {
    label: "03",
    title: "Peta Gang",
    desc: "Navigasi interaktif ke bengkel pengrajin di lorong keramik.",
  },
  {
    label: "04",
    title: "Bantuan 24 Jam",
    desc: "Chatbot untuk pertanyaan umum, admin untuk kendala spesifik.",
  },
];

const testimonials = [
  {
    quote:
      "Rombongan kantor kami 12 orang, satu transaksi selesai. Kode booking tinggal ditunjukkan di gang.",
    name: "Ratna Puspitasari",
    role: "HR Manager, Malang",
    initials: "RP",
    span: 3,
    large: true,
  },
  {
    quote:
      "Pesan 40 mug custom untuk tamu undangan. Pengrajinnya langsung mengirim progress fotonya.",
    name: "Bagas Anindito",
    role: "Pemilik kafe, Lowokwaru",
    initials: "BA",
    span: 2,
    large: false,
  },
  {
    quote:
      "Anak-anak sekolah ramai di roda pemutar, data rombongan sudah rapi di manifes admin.",
    name: "Sri Wahyuni",
    role: "Guru SD, Kota Malang",
    initials: "SW",
    span: 2,
    large: false,
  },
  {
    quote:
      "Dari sketsa di WhatsApp, keramiknya jadi persis bayangan kami. Studio sangat responsif dan ramah.",
    name: "Dewi Wulandari",
    role: "Dekorator interior, Surabaya",
    initials: "DW",
    span: 3,
    large: false,
  },
];

const paymentMethods = [
  {
    id: "transfer",
    icon: Bank,
    label: "Transfer Bank",
    desc: "BCA · BNI · Mandiri · BRI",
  },
  {
    id: "ewallet",
    icon: Wallet,
    label: "E-Wallet",
    desc: "GoPay · OVO · DANA · ShopeePay",
  },
  {
    id: "qris",
    icon: QrCode,
    label: "QRIS",
    desc: "Scan QR — semua e-wallet & bank",
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (product: typeof rekomendasiProduk[0]) => {
    const session = getDemoSession();
    if (!session) {
      toast("Silakan login untuk melanjutkan", {
        description: "Anda perlu masuk ke akun untuk menambahkan produk ke keranjang.",
        action: {
          label: "Masuk",
          onClick: () => router.push("/auth"),
        },
      });
      return;
    }

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image,
      store_id: product.store,
      store_name: product.store,
    });
    toast.success(`${product.title} ditambahkan ke keranjang.`);
    setTimeout(() => router.push("/keranjang"), 800);
  };

  return (
    <div style={{ background: "var(--surface)", color: "var(--bark)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif" }}>
      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        id="beranda"
        style={{ borderBottom: "1.5px solid var(--line)", position: "relative", overflow: "hidden" }}
      >
        {/* Background Ceramic Image with Gradient Fade (Mask) */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000&auto=format&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              opacity: 0.45, /* Increased from 25% to 45% to make the ceramic texture more visible */
              /* Mask image fades it out towards the bottom and right */
              WebkitMaskImage: "linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)",
              maskImage: "linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)",
            }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center min-h-[92dvh] pt-16 pb-20 relative z-10">
          <div>
            {/* Eyebrow — plain typographic label, same font as heading */}
            <p
              style={{
                fontFamily: "var(--font-outfit), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--clay)",
                marginBottom: "1rem",
              }}
            >
              Kampung Keramik Dinoyo, Malang
            </p>

            <h1
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.06,
                maxWidth: "18ch",
                color: "var(--bark)",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
            >
              Tanah liat Dinoyo, dari roda pemutar langsung ke tanganmu.
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
              Reservasi kelas keramik, pesan suvenir kustom, jelajahi gang bengkel.
              Satu aplikasi untuk seluruh kampung keramik Malang.
            </p>

            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <Link
                href="/produk"
                id="hero-cta-reservasi"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.8rem 1.75rem",
                  borderRadius: "9999px",
                  background: "var(--clay)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
                  boxShadow: "0 4px 16px rgba(184,92,60,0.25)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--clay-dark)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--clay)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                Eksplorasi Produk
                <ArrowRight className="w-4 h-4" weight="bold" />
              </Link>
              <a
                href="#fitur"
                id="hero-cta-fitur"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.8rem 1.75rem",
                  borderRadius: "9999px",
                  border: "1.5px solid var(--line-strong)",
                  color: "var(--bark)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--clay-light)";
                  (e.currentTarget as HTMLElement).style.background = "var(--clay-muted)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                Lihat Fitur
              </a>
            </div>

            {/* Trust badges — typographic, no emoji */}
            <p
              style={{
                marginTop: "2.5rem",
                fontSize: "0.82rem",
                color: "var(--bark-muted)",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              Booking Instan
              <span style={{ margin: "0 0.5rem", opacity: 0.4 }}>&bull;</span>
              50+ Pengrajin
              <span style={{ margin: "0 0.5rem", opacity: 0.4 }}>&bull;</span>
              Peta Interaktif
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
                    src="https://picsum.photos/seed/dinoyo-potter-hands-clay-wheel/600/750"
                    alt="Pengrajin Dinoyo membentuk tanah liat dengan tangan di roda pemutar"
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
                    src="https://picsum.photos/seed/dinoyo-fired-pottery-kiln-glaze/600/600"
                    alt="Keramik hasil pembakaran kiln tradisional Dinoyo dengan glasir matang"
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
                    src="https://picsum.photos/seed/dinoyo-narrow-alley-pottery-workshop/600/600"
                    alt="Lorong sempit gang keramik Dinoyo dengan bengkel di kiri kanan"
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
                    src="https://picsum.photos/seed/dinoyo-clay-preparation-mud-workshop/600/750"
                    alt="Meja persiapan tanah liat dan alat-alat keramik di bengkel Dinoyo"
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

      {/* ── REKOMENDASI PRODUK ────────────────────────────────────────── */}
      <section
        id="rekomendasi"
        style={{ borderBottom: "1.5px solid var(--line)", background: "var(--surface)" }}
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "40rem" }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                }}
              >
                Katalog Pilihan
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                  color: "var(--bark)",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                Rekomendasi Produk
              </h2>
            </div>
            <Link
              href="/produk"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--clay)",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          </div>

          <div
            style={{
              marginTop: "3.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {rekomendasiProduk.map((item) => (
              <div
                key={item.id}
                className="card-hover-glow"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--line)",
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(61,43,31,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div style={{ position: "relative", aspectRatio: "1/1", width: "100%", overflow: "hidden" }}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    className="hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--bark-muted)",
                        fontFamily: "var(--font-geist-mono), monospace",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.store}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#F59E0B" }}>
                      <Star weight="fill" size={14} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--bark)" }}>{item.rating}</span>
                    </div>
                  </div>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--bark)",
                      marginBottom: "1rem",
                      lineHeight: 1.4,
                      flexGrow: 1,
                    }}
                  >
                    {item.title}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--clay)" }}>
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "9999px",
                        background: "var(--clay-light)",
                        color: "var(--clay-dark)",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.2s, transform 0.1s",
                      }}
                      title="Tambah ke Keranjang"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--clay)";
                        (e.currentTarget as HTMLElement).style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--clay-light)";
                        (e.currentTarget as HTMLElement).style.color = "var(--clay-dark)";
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
                      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <ShoppingCart size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FITUR ────────────────────────────────────────────────────────── */}
      <section
        id="fitur"
        style={{ borderBottom: "1.5px solid var(--line)", position: "relative", overflow: "hidden" }}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "40rem" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--clay)",
              }}
            >
              Fitur Platform
            </span>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--bark)",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
            >
              Semua yang kamu butuhkan untuk hari yang penuh tanah liat.
            </h2>
          </div>

          <div
            style={{
              marginTop: "3.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.25rem",
            }}
            className="grid-cols-1 md:grid-cols-3"
          >
            {features.map((f, i) => {
              const isWide = i === 0 || i === 3;
              return (
                <div
                  key={f.title}
                  className={`reveal card-hover-glow${isWide ? " md:col-span-2" : ""}`}
                  style={{
                    background: "#fff",
                    border: "1.5px solid var(--line)",
                    borderRadius: "1.25rem",
                    padding: "2rem 2.25rem",
                    position: "relative",
                    overflow: "hidden",
                    gridColumn: isWide ? "span 2" : undefined,
                  }}
                >
                  {/* Subtle ambient glow */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: -32,
                      right: -32,
                      width: 100,
                      height: 100,
                      borderRadius: "9999px",
                      background: "var(--clay)",
                      opacity: 0.05,
                      filter: "blur(40px)",
                    }}
                  />
                  {/* Typographic number accent instead of icon */}
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-geist-mono), monospace",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "var(--clay)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {f.label}
                  </span>
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "var(--bark)",
                      fontFamily: "var(--font-outfit), sans-serif",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      marginTop: "0.6rem",
                      color: "var(--bark-muted)",
                      lineHeight: 1.65,
                      maxWidth: "50ch",
                      fontSize: "0.9rem",
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CARA BERKUNJUNG ──────────────────────────────────────────────── */}
      <section
        id="cara"
        style={{ borderBottom: "1.5px solid var(--line)", position: "relative", overflow: "hidden" }}
      >
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 400,
              height: 400,
              borderRadius: "9999px",
              background: "var(--clay-light)",
              opacity: 0.06,
              filter: "blur(120px)",
            }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
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
                Panduan
              </span>
              <h2
                style={{
                  marginTop: "0.5rem",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                  color: "var(--bark)",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                Cara berkunjung dalam empat langkah.
              </h2>

              <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-10">
                {[
                  ["Daftar", "Buat akun dengan email atau Google."],
                  ["Pilih Jadwal", "Cek ketersediaan, isi data rombongan."],
                  ["Bayar", "Transfer bank, VA, e-wallet, atau QRIS."],
                  ["Datang", "Tunjukkan kode booking di gang keramik."],
                ].map(([title, desc], i) => (
                  <div key={title} className="reveal">
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
                        fontFamily: "var(--font-outfit), sans-serif",
                      }}
                    >
                      {title}
                    </h3>
                    <p style={{ marginTop: "0.4rem", color: "var(--bark-muted)", lineHeight: 1.65 }}>
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:justify-self-end">
              <div
                className="card-hover-glow"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--line)",
                  borderRadius: "1.25rem",
                  padding: "2rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 160,
                    height: 160,
                    borderRadius: "9999px",
                    background: "var(--clay)",
                    opacity: 0.06,
                    filter: "blur(50px)",
                  }}
                />
                {/* Typographic accent — no icon */}
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "var(--clay)",
                    marginBottom: "1.25rem",
                    textTransform: "uppercase",
                  }}
                >
                  Mulai Hari Ini
                </span>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--bark)",
                    fontFamily: "var(--font-outfit), sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Kelas keramik instan
                </h3>
                <p
                  style={{
                    marginTop: "0.5rem",
                    color: "var(--bark-muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
                  }}
                >
                  Tak perlu tunggu jadwal panjang. Pesan sesi hari ini, bayar, dan langsung bentuk
                  tanah liat pertamamu di roda pemutar.
                </p>
                <Link
                  href="/auth"
                  id="cara-cta-link"
                  style={{
                    marginTop: "1.5rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--clay)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  Coba sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ── FORMULIR RESERVASI ROMBONGAN (UI Placeholder) ──────────────
          ══════════════════════════════════════════════════════════════ */}
      <section
        id="reservasi"
        style={{
          borderBottom: "1px solid var(--line)",
          position: "relative",
          overflow: "hidden",
          background: "var(--surface-elevated)",
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
              opacity: 0.06,
              filter: "blur(120px)",
            }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Left: Copy */}
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
                Reservasi Rombongan
              </span>
              <h2
                style={{
                  marginTop: "0.5rem",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                  color: "var(--bark)",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                Bawa rombonganmu ke gang keramik.
              </h2>
              <p
                style={{
                  marginTop: "1rem",
                  color: "var(--bark-muted)",
                  lineHeight: 1.7,
                  maxWidth: "52ch",
                  fontSize: "1rem",
                }}
              >
                Isi formulir berikut, pilih jadwal yang tersedia, lalu lanjutkan ke pembayaran.
                Kode booking akan langsung dikirim ke email rombonganmu.
              </p>

              <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  "Kapasitas 1–50 orang per sesi",
                  "Konfirmasi otomatis via email",
                  "Bisa reschedule hingga H-1",
                ].map((item) => (
                  <div
                    key={item}
                    style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 4,
                        height: 4,
                        borderRadius: "9999px",
                        background: "var(--clay)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "0.9rem", color: "var(--bark-mid)", fontWeight: 500 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form UI */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid var(--line)",
                borderRadius: "1.5rem",
                padding: "2rem",
                boxShadow: "0 4px 32px rgba(61,43,31,0.07)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--bark)",
                  marginBottom: "1.5rem",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                Detail Rombongan
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {/* Nama Perwakilan */}
                <div>
                  <label
                    htmlFor="group-rep-name"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--bark)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Nama Perwakilan
                  </label>
                  <input
                    id="group-rep-name"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    className="input-earthy"
                    aria-label="Nama perwakilan rombongan"
                  />
                </div>

                {/* Jumlah Peserta */}
                <div>
                  <label
                    htmlFor="group-participant-count"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--bark)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Jumlah Peserta
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <input
                      id="group-participant-count"
                      type="number"
                      min="1"
                      max="50"
                      defaultValue={1}
                      className="input-earthy"
                      style={{ maxWidth: "9rem" }}
                      aria-label="Jumlah peserta rombongan"
                    />
                    <span
                      style={{ fontSize: "0.85rem", color: "var(--bark-muted)", flexShrink: 0 }}
                    >
                      orang (maks. 50)
                    </span>
                  </div>
                </div>

                {/* Pilih Jadwal */}
                <div>
                  <label
                    htmlFor="group-schedule-date"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--bark)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Pilih Jadwal
                  </label>
                  <input
                    id="group-schedule-date"
                    type="date"
                    className="input-earthy"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    aria-label="Pilih tanggal jadwal reservasi"
                  />
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label
                    htmlFor="group-phone"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--bark)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    id="group-phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    className="input-earthy"
                    aria-label="Nomor telepon perwakilan"
                  />
                </div>

                {/* ── Opsi Pembayaran Digital ── */}
                <div
                  style={{
                    marginTop: "0.5rem",
                    paddingTop: "1.25rem",
                    borderTop: "1.5px dashed var(--line-strong)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--bark)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Metode Pembayaran
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {paymentMethods.map(({ id, icon: Icon, label, desc }) => (
                      <button
                        key={id}
                        id={`payment-option-${id}`}
                        type="button"
                        aria-pressed={selectedPayment === id}
                        onClick={() => setSelectedPayment(id)}
                        className={`payment-option${selectedPayment === id ? " selected" : ""}`}
                      >
                        <span className={`payment-radio${selectedPayment === id ? " selected" : ""}`} />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36,
                            borderRadius: "0.625rem",
                            background: "var(--clay-muted)",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={18} style={{ color: "var(--clay)" }} />
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              color: "var(--bark)",
                              lineHeight: 1.2,
                            }}
                          >
                            {label}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", marginTop: 2 }}>
                            {desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/auth"
                  id="reservasi-form-cta"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginTop: "0.75rem",
                    padding: "0.875rem",
                    borderRadius: "0.875rem",
                    background: "var(--clay)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
                    boxShadow: "0 4px 16px rgba(184,92,60,0.22)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--clay-dark)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--clay)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  Lanjut Reservasi
                  <ArrowRight weight="bold" size={16} />
                </Link>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--bark-muted)",
                    textAlign: "center",
                    marginTop: "0.5rem",
                  }}
                >
                  Masuk atau daftar akun untuk menyelesaikan reservasi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section
        id="suara"
        style={{ borderBottom: "1.5px solid var(--line)", position: "relative", overflow: "hidden" }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            right: 40,
            userSelect: "none",
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontSize: "28rem",
              fontFamily: "Georgia, serif",
              lineHeight: 1,
              color: "var(--clay)",
              opacity: 0.025,
            }}
          >
            &ldquo;
          </span>
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: "33%",
            width: 500,
            height: 300,
            borderRadius: "9999px",
            background: "var(--clay)",
            opacity: 0.05,
            filter: "blur(120px)",
            pointerEvents: "none",
          }}
        />

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--clay)",
            }}
          >
            Testimoni
          </span>
          <h2
            style={{
              marginTop: "0.5rem",
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--bark)",
              fontFamily: "var(--font-outfit), sans-serif",
            }}
          >
            Suara dari lorong keramik.
          </h2>

          <div
            style={{
              marginTop: "3.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "1.25rem",
            }}
          >
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className={`reveal card-hover-glow`}
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--line)",
                  borderRadius: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  gridColumn: `span ${t.span}`,
                  padding: t.large ? "2rem 2.25rem" : "1.75rem",
                }}
              >
                {/* Typographic quote mark — no icon dependency */}
                <span
                  aria-hidden
                  style={{
                    display: "block",
                    fontFamily: "Georgia, serif",
                    fontSize: t.large ? "3rem" : "2.25rem",
                    lineHeight: 1,
                    color: "var(--clay)",
                    opacity: 0.35,
                    marginBottom: "0.25rem",
                    userSelect: "none",
                  }}
                >
                  &ldquo;
                </span>
                <blockquote
                  style={{
                    flex: 1,
                    lineHeight: 1.65,
                    marginTop: t.large ? "1.5rem" : "1rem",
                    fontSize: t.large ? "1.05rem" : "0.9rem",
                    color: "var(--bark)",
                  }}
                >
                  {t.quote}
                </blockquote>
                <figcaption
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginTop: t.large ? "2rem" : "1.5rem",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "9999px",
                      background: "var(--clay-muted)",
                      border: "1.5px solid rgba(184,92,60,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--clay-dark)" }}
                    >
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        display: "block",
                        fontSize: t.large ? "0.95rem" : "0.85rem",
                        color: "var(--bark)",
                      }}
                    >
                      {t.name}
                    </span>
                    <span
                      style={{
                        color: "var(--bark-muted)",
                        display: "block",
                        marginTop: 2,
                        fontSize: t.large ? "0.82rem" : "0.75rem",
                      }}
                    >
                      {t.role}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--surface-elevated)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "var(--font-outfit), sans-serif",
        }}
      >
        {/* Ambient blob */}
        <div
          aria-hidden
          style={{
            position: "absolute", top: "40%", left: "60%",
            width: 360, height: 200, borderRadius: "9999px",
            background: "var(--clay)", opacity: 0.04,
            filter: "blur(90px)", pointerEvents: "none",
          }}
        />

        {/* ── Main footer grid ──────────────────────────────────── */}
        <div
          className="max-w-[1400px] mx-auto px-5 lg:px-8"
          style={{ padding: "3.5rem 2rem 2.5rem", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "2.5rem" }}
        >
          {/* Brand column */}
          <div>
            <span style={{ fontFamily: "var(--font-outfit), sans-serif", fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.03em", color: "var(--bark)" }}>
              Dinoyo<span style={{ color: "var(--clay)" }}>Craft</span>
            </span>
            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--bark-muted)", lineHeight: 1.7, maxWidth: "26ch" }}>
              Platform digital untuk menjelajahi, memesan, dan menikmati pengalaman keramik autentik di Kampung Dinoyo, Malang.
            </p>
            {/* CTA */}
            <Link
              href="/auth"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                marginTop: "1.25rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "var(--clay)", color: "#fff",
                fontWeight: 700, fontSize: "0.82rem",
                textDecoration: "none", transition: "background 0.2s",
                boxShadow: "0 2px 8px rgba(184,92,60,0.2)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--clay-dark)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--clay)")}
            >
              Mulai Reservasi
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          {/* Jelajahi */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--bark)", marginBottom: "1rem" }}>
              Jelajahi
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { href: "/#fitur", label: "Beranda" },
                { href: "/customer/katalog", label: "Katalog & Kustom" },
                { href: "/customer/reservasi", label: "Reservasi Kelas" },
                { href: "/customer/peta", label: "Peta Gang" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{ fontSize: "0.85rem", color: "var(--bark-muted)", textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--clay)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--bark-muted)")}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Layanan */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--bark)", marginBottom: "1rem" }}>
              Layanan
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { href: "/customer/bantuan", label: "Customer Service" },
                { href: "/customer/bantuan", label: "Live Chat Admin" },
                { href: "/auth", label: "Masuk / Daftar" },
                { href: "/customer", label: "Dashboard" },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  style={{ fontSize: "0.85rem", color: "var(--bark-muted)", textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--clay)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--bark-muted)")}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--bark)", marginBottom: "1rem" }}>
              Kontak & Lokasi
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--bark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Alamat</p>
                <p style={{ marginTop: "0.2rem", fontSize: "0.82rem", color: "var(--bark-muted)", lineHeight: 1.6 }}>
                  Jl. Dinoyo, Kec. Lowokwaru<br />
                  Kota Malang, Jawa Timur 65145
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--bark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>WhatsApp</p>
                <p style={{ marginTop: "0.2rem", fontSize: "0.82rem", color: "var(--bark-muted)" }}>+62 812-3456-7890</p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--bark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</p>
                <p style={{ marginTop: "0.2rem", fontSize: "0.82rem", color: "var(--bark-muted)" }}>cs@dinoyocraft.id</p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--bark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Jam Layanan</p>
                <p style={{ marginTop: "0.2rem", fontSize: "0.82rem", color: "var(--bark-muted)" }}>Senin–Sabtu, 08.00–16.00 WIB</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid var(--line)", padding: "1.125rem 0" }}>
          <div
            className="max-w-[1400px] mx-auto px-5 lg:px-8"
            style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}
          >
            <p style={{ fontSize: "0.78rem", color: "var(--bark-muted)" }}>
              © {new Date().getFullYear()} DinoyoCraft. Seluruh hak cipta dilindungi.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {[
                { href: "/#fitur", label: "Beranda" },
                { href: "/customer/katalog", label: "Katalog" },
                { href: "/customer/reservasi", label: "Reservasi" },
                { href: "/customer/bantuan", label: "Bantuan" },
                { href: "/auth", label: "Masuk" },
              ].map(({ href, label }, i) => (
                <span key={href} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && (
                    <span aria-hidden style={{ color: "rgba(0,0,0,0.2)", fontSize: "0.5rem", margin: "0 0.05rem", userSelect: "none" }}>&bull;</span>
                  )}
                  <Link
                    href={href}
                    style={{ fontSize: "0.78rem", color: "var(--bark-muted)", textDecoration: "none", padding: "0 0.4rem", transition: "color 0.18s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--clay)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--bark-muted)")}
                  >
                    {label}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── FLOATING ACTION BUTTON ─────────────────────────────────────── */}
      <FAB />
    </div>
  );
}
