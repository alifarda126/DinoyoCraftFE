"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";

const daftarToko = [
  {
    id: "studio-bumi",
    name: "Studio Bumi",
    description: "Fokus pada keramik fungsional berdesain minimalis dan earthy.",
    rating: 4.8,
    reviews: 124,
    location: "Gang 2, No. 15",
    image: "https://picsum.photos/seed/studiobumi/600/400"
  },
  {
    id: "keramik-rina",
    name: "Keramik Rina",
    description: "Spesialis peralatan makan dengan glasir pastel yang cantik.",
    rating: 4.9,
    reviews: 89,
    location: "Gang 1, No. 4",
    image: "https://picsum.photos/seed/keramikrina/600/400"
  },
  {
    id: "tanah-liat-art",
    name: "Tanah Liat Art",
    description: "Menyediakan pot tanaman hias dan vas bunga dengan berbagai bentuk unik.",
    rating: 5.0,
    reviews: 56,
    location: "Gang 3, No. 22",
    image: "https://picsum.photos/seed/tanahliatart/600/400"
  },
  {
    id: "dinoyo-heritage",
    name: "Dinoyo Heritage",
    description: "Melestarikan desain klasik keramik Dinoyo sejak 1980.",
    rating: 4.7,
    reviews: 210,
    location: "Gang Utama, Blok A1",
    image: "https://picsum.photos/seed/dinoyoheritage/600/400"
  }
];

export default function DaftarTokoPage() {
  return (
    <div style={{ background: "var(--surface)", color: "var(--bark)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif" }}>
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <div style={{ marginBottom: "3rem", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bark)" }}>
            Daftar Toko Pengrajin
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "1.1rem", maxWidth: "60ch" }}>
            Eksplorasi puluhan bengkel keramik autentik di Kampung Keramik Dinoyo. Temukan gaya dan ciri khas dari masing-masing pengrajin.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {daftarToko.map((toko) => (
            <Link
              href={`/daftar-toko/${toko.id}`}
              key={toko.id}
              className="card-hover-glow"
              style={{
                textDecoration: "none",
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
              <div style={{ position: "relative", height: "200px", width: "100%", overflow: "hidden" }}>
                <Image
                  src={toko.image}
                  alt={toko.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--bark)",
                      lineHeight: 1.2,
                    }}
                  >
                    {toko.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#F59E0B", background: "rgba(245, 158, 11, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "9999px" }}>
                    <Star weight="fill" size={14} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--bark)" }}>{toko.rating}</span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--bark-muted)",
                    lineHeight: 1.6,
                    marginBottom: "1.5rem",
                    flexGrow: 1,
                  }}
                >
                  {toko.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--clay)", fontSize: "0.85rem", fontWeight: 600 }}>
                  <MapPin size={18} weight="fill" />
                  {toko.location}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
