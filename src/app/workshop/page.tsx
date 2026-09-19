"use client";

import Image from "next/image";
import Link from "next/link";
import { WhatsappLogo, ArrowRight } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";

const galleryImages = [
  { id: 1, src: "https://picsum.photos/seed/ws1/400/600", alt: "Siswa membentuk tanah liat di roda", height: "h-[300px]" },
  { id: 2, src: "https://picsum.photos/seed/ws2/400/400", alt: "Kelas mewarnai keramik", height: "h-[200px]" },
  { id: 3, src: "https://picsum.photos/seed/ws3/600/400", alt: "Hasil karya keramik anak-anak", height: "h-[250px]" },
  { id: 4, src: "https://picsum.photos/seed/ws4/400/800", alt: "Proses glasir keramik", height: "h-[350px]" },
  { id: 5, src: "https://picsum.photos/seed/ws5/400/400", alt: "Tangan penuh tanah liat", height: "h-[200px]" },
  { id: 6, src: "https://picsum.photos/seed/ws6/500/500", alt: "Ruang kelas workshop yang terang", height: "h-[250px]" },
];

export default function WorkshopPage() {
  return (
    <div style={{ background: "var(--surface)", color: "var(--bark)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif" }}>
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center" style={{ marginBottom: "5rem" }}>
          <div>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--clay)",
              }}
            >
              Kelas & Tur Edukasi
            </span>
            <h1 style={{ marginTop: "0.5rem", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bark)", lineHeight: 1.1 }}>
              Pengalaman Membentuk Mahakaryamu Sendiri
            </h1>
            <p style={{ marginTop: "1.5rem", color: "var(--bark-muted)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "55ch" }}>
              Ikuti kelas keramik intensif bersama pengrajin master kami. Tersedia untuk perorangan, pasangan, hingga rombongan sekolah dan perusahaan. Jadikan tanah liat sebagai medium ekspresimu.
            </p>

            <div style={{ marginTop: "2.5rem", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <a
                href="https://wa.me/6281234567890?text=Halo%20min,%20saya%20ingin%20reservasi%20kelas%20keramik"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 2rem",
                  borderRadius: "9999px",
                  background: "#25D366", // WhatsApp Green
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
                  boxShadow: "0 4px 16px rgba(37, 211, 102, 0.25)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1da851";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#25D366";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <WhatsappLogo size={22} weight="fill" />
                Reservasi via WhatsApp
              </a>
              <Link
                href="/daftar-toko"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 2rem",
                  borderRadius: "9999px",
                  border: "1.5px solid var(--line-strong)",
                  color: "var(--bark)",
                  fontWeight: 600,
                  fontSize: "1rem",
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
                Lihat Pengrajin
              </Link>
            </div>
          </div>

          <div style={{ position: "relative" }}>
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
            <figure
              style={{
                borderRadius: "1.5rem",
                overflow: "hidden",
                aspectRatio: "4/3",
                boxShadow: "0 4px 32px rgba(61,43,31,0.12)",
                border: "1.5px solid var(--line)",
                position: "relative",
              }}
            >
              <Image
                src="https://picsum.photos/seed/pottery-class/800/600"
                alt="Suasana kelas workshop keramik Dinoyo"
                fill
                priority
                style={{ objectFit: "cover" }}
                className="hover:scale-105 transition-transform duration-700"
              />
            </figure>
          </div>
        </div>

        {/* Masonry Gallery Section */}
        <section style={{ marginTop: "6rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.5rem" }}>Galeri Kegiatan</h2>
            <p style={{ color: "var(--bark-muted)", fontSize: "1.05rem" }}>Momen-momen magis saat tanah liat mulai mengambil bentuk.</p>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="break-inside-avoid relative rounded-xl overflow-hidden group"
                style={{ border: "1px solid var(--line)", background: "var(--surface-elevated)" }}
              >
                <div className={`relative w-full ${img.height}`}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    style={{ objectFit: "cover" }}
                    className="group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-medium">{img.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
