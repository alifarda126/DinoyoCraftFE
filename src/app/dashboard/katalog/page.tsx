"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MagnifyingGlass, Funnel, PaintBrush, ArrowRight } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import FAB from "@/components/FAB";

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  artisan: {
    full_name: string;
  };
};

export default function KatalogPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const loadArtworks = async () => {
    const { data } = await supabase
      .from("artworks")
      .select(`
        *,
        artisan:profiles!artworks_artisan_id_fkey (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (data) setArtworks(data as Artwork[]);
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  const categories = Array.from(new Set(artworks.map((a) => a.category)));

  const filtered = artworks
    .filter((a) => filter === "all" || a.category === filter)
    .filter(
      (a) =>
        search === "" ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.artisan?.full_name?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface)", color: "var(--bark)" }}>
      <Navbar />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.25rem 5rem" }}>
        {/* Page header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--bark-muted)",
              fontSize: "0.875rem",
              textDecoration: "none",
              marginBottom: "1rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--clay)")}
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--bark-muted)")
            }
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "var(--bark)",
              fontFamily: "var(--font-outfit), sans-serif",
              letterSpacing: "-0.025em",
            }}
          >
            Katalog Keramik
          </h1>
          <p style={{ marginTop: "0.4rem", color: "var(--bark-muted)", fontSize: "0.95rem" }}>
            Temukan karya pengrajin Dinoyo dan pesan kustom langsung.
          </p>
        </div>

        {/* Search bar */}
        <div
          style={{
            position: "relative",
            marginBottom: "1.25rem",
            maxWidth: "28rem",
          }}
        >
          <MagnifyingGlass
            size={17}
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--bark-muted)",
            }}
          />
          <input
            id="katalog-search"
            type="search"
            placeholder="Cari produk atau pengrajin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-earthy"
            style={{ paddingLeft: "2.5rem" }}
            aria-label="Cari produk keramik"
          />
        </div>

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "2rem",
              overflowX: "auto",
              paddingBottom: "0.25rem",
              alignItems: "center",
            }}
          >
            <Funnel size={16} style={{ color: "var(--bark-muted)", flexShrink: 0 }} />
            {["all", ...categories].map((cat) => (
              <button
                key={cat}
                id={`filter-${cat}`}
                onClick={() => setFilter(cat)}
                style={{
                  padding: "0.35rem 1rem",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  border: "1.5px solid",
                  transition: "background 0.2s, color 0.2s, border-color 0.2s",
                  background: filter === cat ? "var(--clay)" : "#fff",
                  color: filter === cat ? "#fff" : "var(--bark-mid)",
                  borderColor: filter === cat ? "var(--clay)" : "var(--line-strong)",
                }}
              >
                {cat === "all" ? "Semua" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 1rem",
              color: "var(--bark-muted)",
            }}
          >
            <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏺</p>
            <p style={{ fontWeight: 600, marginBottom: "0.35rem", color: "var(--bark)" }}>
              Produk tidak ditemukan
            </p>
            <p style={{ fontSize: "0.9rem" }}>Coba ubah filter atau kata pencarian.</p>
          </div>
        )}

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filtered.map((artwork) => (
            <article
              key={artwork.id}
              className="card-hover-glow"
              style={{
                background: "#fff",
                border: "1.5px solid var(--line)",
                borderRadius: "1.25rem",
                overflow: "hidden",
              }}
            >
              {/* Image */}
              <Link href={`/dashboard/katalog/${artwork.id}`} style={{ display: "block" }}>
                <div
                  style={{
                    aspectRatio: "1/1",
                    background: "var(--surface-elevated)",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")
                    }
                  />
                </div>
              </Link>

              {/* Body */}
              <div style={{ padding: "1.1rem 1.25rem 1.25rem" }}>
                {/* Category badge */}
                {artwork.category && (
                  <span className="badge-clay" style={{ marginBottom: "0.6rem" }}>
                    {artwork.category}
                  </span>
                )}

                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--bark)",
                    fontFamily: "var(--font-outfit), sans-serif",
                    marginBottom: "0.35rem",
                  }}
                >
                  {artwork.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.825rem",
                    color: "var(--bark-muted)",
                    lineHeight: 1.55,
                    marginBottom: "0.75rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {artwork.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.875rem",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--bark-muted)" }}>
                    🏺 {artwork.artisan?.full_name}
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "1rem",
                      color: "var(--bark)",
                      fontFamily: "var(--font-outfit), sans-serif",
                    }}
                  >
                    Rp {artwork.price.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={`/dashboard/katalog/${artwork.id}`}
                    id={`katalog-detail-${artwork.id}`}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "0.625rem",
                      border: "1.5px solid var(--line-strong)",
                      color: "var(--bark-mid)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "background 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-elevated)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--clay-light)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                    }}
                  >
                    Detail
                  </Link>
                  <Link
                    href={`/dashboard/katalog/${artwork.id}`}
                    id={`katalog-kustom-${artwork.id}`}
                    style={{
                      flex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "0.625rem",
                      background: "var(--clay)",
                      color: "#fff",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      transition: "background 0.2s, transform 0.15s",
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
                    <PaintBrush size={14} />
                    Pesan Kustom
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <FAB />
    </div>
  );
}
