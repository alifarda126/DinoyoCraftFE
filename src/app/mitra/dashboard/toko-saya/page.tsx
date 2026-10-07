"use client";

import { useState, useEffect, useRef } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Star, MagnifyingGlass, MapPin, PencilSimple, ShareNetwork,
  X, Heart, ChatCircle, ThumbsUp, CaretRight, Storefront, Fire
} from "@phosphor-icons/react";
import Link from "next/link";

const PRODUCTS = [
  { id: 1, name: "Vas Minimalis", price: 85000, rating: 4.9, isHot: true, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=300&auto=format&fit=crop" },
  { id: 2, name: "Cangkir Handmade", price: 65000, rating: 4.9, isHot: true, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=300&auto=format&fit=crop" },
  { id: 3, name: "Mangkuk Keramik", price: 75000, rating: 4.9, isHot: false, image: "https://images.unsplash.com/photo-1530006498959-b7884e829a04?q=80&w=300&auto=format&fit=crop" },
  { id: 4, name: "Piring Artisan", price: 95000, rating: 4.9, isHot: false, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=300&auto=format&fit=crop" },
];

const PRODUCT_VARIANTS: Record<number, { name: string; hex: string; label: string }[]> = {
  1: [
    { name: "Sand White",   hex: "#f0ebe3", label: "Glossy Finish" },
    { name: "Terracotta",   hex: "#c1694f", label: "Matte Earthy"  },
    { name: "Raw Speckle",  hex: "#d4cfc8", label: "Bintik Alami"  },
    { name: "Charcoal Ash", hex: "#3d3d3d", label: "Tekstur Abu"   },
  ],
  2: [
    { name: "Cream White",  hex: "#f5f0e8", label: "Halus Matte"   },
    { name: "Sage Green",   hex: "#8aad8a", label: "Natural Moss"  },
  ],
  3: [
    { name: "Sand White",   hex: "#f0ebe3", label: "Glossy Finish" },
    { name: "Cobalt Blue",  hex: "#3b5fa0", label: "Deep Ocean"    },
    { name: "Terracotta",   hex: "#c1694f", label: "Matte Earthy"  },
  ],
  4: [
    { name: "Raw Speckle",  hex: "#d4cfc8", label: "Bintik Alami"  },
    { name: "Charcoal Ash", hex: "#3d3d3d", label: "Tekstur Abu"   },
    { name: "Sage Green",   hex: "#8aad8a", label: "Natural Moss"  },
  ],
};

const PRODUCT_REVIEWS: Record<number, {
  id: number; customerName: string; avatar: string;
  date: string; rating: number; content: string; variantName: string;
  photo?: string; reply: string; isEditing: boolean; editDraft: string;
}[]> = {
  1: [
    {
      id: 1, customerName: "Mochammad Al Mizan",
      avatar: "https://i.pravatar.cc/48?img=11",
      date: "12 Feb 2025", rating: 5, variantName: "Sand White — Glossy Finish",
      content: "Glasirnya sangat halus dan rapi, warna aslinya lebih estetik daripada di foto. Pengemasan kayu sangat kokoh dan aman sampai rumah tanpa retak sedikitpun. Sangat bangga dengan karya pengrajin Dinoyo Malang!",
      photo: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80",
      reply: "Terima kasih banyak Mas Mizan atas apresiasinya! Semoga vas keramiknya mempercantik ruangan rumah.",
      isEditing: false, editDraft: "",
    },
    {
      id: 2, customerName: "Anisa Nur Azizah",
      avatar: "https://i.pravatar.cc/48?img=47",
      date: "10 Feb 2025", rating: 5, variantName: "Terracotta — Matte Earthy",
      content: "Tekstur tanah liatnya terasa otentik dan berbobot pas di tangan saat minum kopi seduh manual. Finishing matte-nya nyaman banget dipegang. Recommended untuk penikmat tembikar seni.",
      photo: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=300&q=80",
      reply: "",
      isEditing: false, editDraft: "",
    },
    {
      id: 3, customerName: "Budi Santoso",
      avatar: "https://i.pravatar.cc/48?img=12",
      date: "5 Feb 2025", rating: 4, variantName: "Charcoal Ash — Tekstur Abu",
      content: "Kualitas sangat bagus untuk harganya. Sedikit berbeda warnanya dari foto tapi masih oke. Pengiriman cepat dan dikemas sangat aman.",
      reply: "",
      isEditing: false, editDraft: "",
    },
  ],
  2: [
    {
      id: 1, customerName: "Rina Kusuma",
      avatar: "https://i.pravatar.cc/48?img=23",
      date: "8 Feb 2025", rating: 5, variantName: "Cream White — Halus Matte",
      content: "Cangkirnya cantik banget! Cocok buat kopi pagi. Sudah dipesan 3 kali dan kualitasnya selalu konsisten.",
      photo: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=300&q=80",
      reply: "Wah senang sekali dengarnya Kak Rina! Terima kasih sudah setia bersama kami 🙏",
      isEditing: false, editDraft: "",
    },
    {
      id: 2, customerName: "Agung Prasetyo",
      avatar: "https://i.pravatar.cc/48?img=8",
      date: "3 Feb 2025", rating: 5, variantName: "Sage Green — Natural Moss",
      content: "Warnanya persis seperti foto, tidak mengecewakan. Teman-teman di kantor pada nanya beli di mana haha.",
      reply: "",
      isEditing: false, editDraft: "",
    },
  ],
  3: [
    {
      id: 1, customerName: "Sari Dewi",
      avatar: "https://i.pravatar.cc/48?img=31",
      date: "15 Jan 2025", rating: 5, variantName: "Sand White — Glossy Finish",
      content: "Mangkuknya padat dan berat, terasa premium. Glasir glossy-nya sangat bersih dan mudah dicuci. Sangat puas!",
      photo: "https://images.unsplash.com/photo-1530006498959-b7884e829a04?q=80&w=300&auto=format&fit=crop",
      reply: "",
      isEditing: false, editDraft: "",
    },
  ],
  4: [
    {
      id: 1, customerName: "Dian Safitri",
      avatar: "https://i.pravatar.cc/48?img=5",
      date: "20 Jan 2025", rating: 5, variantName: "Raw Speckle — Bintik Alami",
      content: "Piring artisannya cantik sekali! Bintik-bintik alaminya menambah kesan rustic yang saya cari. Ukurannya juga pas.",
      photo: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80",
      reply: "Senang sekali Kak Dian suka! Motif speckle memang ciri khas pengrajin kami 🏺",
      isEditing: false, editDraft: "",
    },
    {
      id: 2, customerName: "Hendra Wijaya",
      avatar: "https://i.pravatar.cc/48?img=15",
      date: "18 Jan 2025", rating: 4, variantName: "Charcoal Ash — Tekstur Abu",
      content: "Kualitas pengerjaan sangat rapi. Sedikit lebih kecil dari ekspektasi tapi overall sangat memuaskan.",
      reply: "",
      isEditing: false, editDraft: "",
    },
  ],
};

export default function TokoSayaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ownerName, setOwnerName] = useState("Mitra");
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<{ name: string; hex: string; label: string } | null>(null);
  const [reviews, setReviews] = useState(PRODUCT_REVIEWS[1]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop"
  );
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const toggleEditReply = (id: number, isEditing: boolean) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isEditing, editDraft: r.reply } : r));
  };

  const saveReply = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: r.editDraft, isEditing: false } : r));
  };

  const updateDraft = (id: number, text: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, editDraft: text } : r));
  };

  function openProduct(product: typeof PRODUCTS[0]) {
    setSelectedProduct(product);
    const variants = PRODUCT_VARIANTS[product.id] ?? [];
    setSelectedVariant(variants[0] ?? null);
    setReviews(PRODUCT_REVIEWS[product.id] ?? []);
    setShowAllReviews(false);
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerUrl(url);
    toast.success("Banner toko berhasil diperbarui!");
  }

  function handleShare() {
    const url = window.location.href.replace("/dashboard/toko-saya", "/toko/dinoyo-ceramic-studio");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast.success("Link toko disalin ke clipboard!"));
    } else {
      toast.success("Link toko: " + url);
    }
  }

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/mitra/login");
      return;
    }
    setOwnerName(session.profile.full_name || "Mitra");
    setLoading(false);
  }, [router]);

  if (loading) return <div>Memuat...</div>;

  const initials = ownerName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const filteredProducts = PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* ── Banner & Header ── */}
      <div style={{
        background: "#fff",
        borderRadius: "1rem",
        overflow: "hidden",
        border: "1px solid var(--line)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
        marginBottom: "2rem"
      }}>
        {/* Banner Image */}
        <div style={{
          height: "240px",
          width: "100%",
          background: `url('${bannerUrl}') center/cover`,
          position: "relative"
        }}>
          {/* Action buttons */}
          <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleShare}
              title="Salin link toko"
              style={{
                background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%",
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--bark)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}>
              <ShareNetwork size={18} weight="bold" />
            </button>
            <button
              onClick={() => bannerInputRef.current?.click()}
              title="Ganti foto banner toko"
              style={{
                background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%",
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--bark)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}>
              <PencilSimple size={18} weight="bold" />
            </button>
            <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} style={{ display: "none" }} />
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ padding: "0 2rem 2rem", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            
            {/* Avatar & Basic Info */}
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "-45px", position: "relative", zIndex: 10 }}>
              {/* Avatar */}
              <div style={{
                width: 110, height: 110, borderRadius: "1rem",
                background: "linear-gradient(135deg, var(--clay), #c0673d)",
                border: "4px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 800, color: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden"
              }}>
                {initials}
              </div>

              <div style={{ marginTop: "55px" }}>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--bark)", margin: "0 0 0.35rem" }}>
                  Dinoyo Ceramic Studio
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--bark-muted)", fontSize: "0.9rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <MapPin size={16} /> Kampung Keramik Dinoyo, Malang
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#f59e0b", fontWeight: 600 }}>
                    <Star size={16} weight="fill" /> 4.9 <span style={{ color: "var(--bark-muted)", fontWeight: 400 }}>(128 Ulasan)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
              <Link href="/mitra/dashboard/profil" style={{
                padding: "0.75rem 1.25rem", borderRadius: "0.75rem",
                border: "1px solid var(--line-strong)", background: "#fff",
                color: "var(--bark)", fontWeight: 700, fontSize: "0.85rem",
                display: "flex", alignItems: "center", gap: "0.5rem",
                cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif",
                transition: "background 0.2s", textDecoration: "none"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                <PencilSimple size={16} weight="bold" /> Edit Profil
              </Link>
            </div>
          </div>

          {/* Description Box */}
          <div style={{
            marginTop: "1.5rem", padding: "1.25rem",
            background: "var(--surface)", border: "1px solid var(--line)",
            borderRadius: "0.75rem", fontSize: "0.95rem", color: "var(--bark)",
            lineHeight: 1.6
          }}>
            Studio keramik keluarga yang melestarikan seni tembikar Dinoyo sejak 1985. Menyediakan perlengkapan makan stoneware, vas hias, hingga suvenir keramik buatan tangan langsung dari tungku pembakaran lokal.
          </div>
        </div>
      </div>

      {/* ── Catalog Section ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--bark)", margin: "0 0 0.25rem" }}>Katalog Produk</h2>
            <p style={{ color: "var(--bark-muted)", fontSize: "0.9rem", margin: 0 }}>Menampilkan {filteredProducts.length} Produk</p>
          </div>
          
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <MagnifyingGlass size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--bark-muted)" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk di toko ini..."
              style={{
                width: "100%", padding: "0.8rem 1rem 0.8rem 2.75rem",
                borderRadius: "9999px", border: "1px solid var(--line)",
                background: "#fff", fontSize: "0.95rem", outline: "none",
                fontFamily: "var(--font-outfit), sans-serif",
                boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--clay)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--line)"}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem"
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} 
              onClick={() => openProduct(product)}
              style={{
              background: "#fff", borderRadius: "1rem",
              border: "1px solid var(--line)", overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ position: "relative", height: "220px", background: "var(--surface)" }}>
                <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                
                <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", gap: "0.5rem" }}>
                  {product.isHot && (
                    <span style={{
                      background: "#333", color: "#fff",
                      fontSize: "0.72rem", fontWeight: 700, padding: "0.35rem 0.75rem",
                      borderRadius: "9999px", display: "flex", alignItems: "center", gap: "0.3rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                    }}>
                      <Fire size={14} weight="fill" color="#f97316" /> Hot
                    </span>
                  )}
                </div>
                
                <div style={{
                  position: "absolute", top: "0.75rem", right: "0.75rem",
                  background: "#fff", color: "var(--bark)",
                  fontSize: "0.8rem", fontWeight: 700, padding: "0.3rem 0.6rem",
                  borderRadius: "9999px", display: "flex", alignItems: "center", gap: "0.25rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  <Star size={14} weight="fill" color="#f59e0b" /> {product.rating}
                </div>
              </div>
              
              <div style={{ padding: "1.25rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--bark)", margin: "0 0 0.25rem" }}>{product.name}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--bark-muted)", margin: "0 0 1rem" }}>Dinoyo Ceramic Studio</p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--bark)" }}>
                    Rp{product.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--bark-muted)" }}>
            Produk tidak ditemukan.
          </div>
        )}
      </div>

      {/* ── Product Preview Modal ── */}
      {selectedProduct && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: 540,
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)", overflow: "hidden",
            animation: "fadeIn 0.2s ease-out"
          }}>
            {/* Header Sticky */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "1rem 1.25rem", borderBottom: "1px solid var(--line)", background: "#fff", zIndex: 10
            }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button onClick={() => setSelectedProduct(null)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <X size={20} color="var(--bark)" weight="bold" />
                </button>
                <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--bark)" }}>Detail Produk</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="no-scrollbar" style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
              {/* Product Image */}
              <div style={{ height: "300px", background: "var(--surface)" }}>
                <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Main Info */}
              <div style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bark)", margin: "0 0 0.5rem" }}>
                  {selectedProduct.name}
                </h2>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bark)", lineHeight: 1 }}>
                    Rp{selectedProduct.price.toLocaleString("id-ID")}
                  </span>
                  <span style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "var(--bark-muted)" }}>
                    Rp{(selectedProduct.price + 25000).toLocaleString("id-ID")}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", color: "var(--bark-muted)", marginBottom: "1.5rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--bark)", fontWeight: 700 }}>
                    <Star size={16} weight="fill" color="#f59e0b" /> {selectedProduct.rating}
                  </span>
                  <span>•</span>
                  <span style={{ textDecoration: "underline", cursor: "pointer" }}>128 Ulasan</span>
                  <span>•</span>
                  <span>Terjual 340+</span>
                </div>

                {/* Store mini info */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "1rem", border: "1px solid var(--line)", borderRadius: "1rem", marginBottom: "1.5rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "0.5rem", background: "var(--clay-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Storefront size={20} color="var(--clay)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--bark)", margin: 0 }}>Dinoyo Ceramic Studio</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", margin: "0.15rem 0 0", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <MapPin size={12} /> Kampung Keramik Dinoyo
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Color Variants ── */}
                {(PRODUCT_VARIANTS[selectedProduct.id] ?? []).length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                      <h3 style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--bark)", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>Pilihan Warna / Glaze</h3>
                      {selectedVariant && (
                        <span style={{ fontSize: "0.78rem", color: "var(--bark-muted)", fontWeight: 600 }}>
                          {selectedVariant.name} {selectedVariant.label}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      {(PRODUCT_VARIANTS[selectedProduct.id] ?? []).map(v => {
                        const active = selectedVariant?.name === v.name;
                        return (
                          <button key={v.name} onClick={() => setSelectedVariant(v)} style={{
                            display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.75rem 1rem", borderRadius: "0.75rem",
                            border: `2px solid ${active ? "var(--bark)" : "rgba(0,0,0,0.1)"}`,
                            background: active ? "rgba(0,0,0,0.03)" : "#fff",
                            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                          }}>
                            <span style={{
                              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                              background: v.hex, border: "2px solid rgba(0,0,0,0.12)",
                            }} />
                            <div>
                              <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--bark)", margin: 0 }}>{v.name}</p>
                              <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: 0 }}>{v.label}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description & Spec */}
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.5rem" }}>Deskripsi Produk</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--bark-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                  Keramik stoneware buatan tangan pengrajin lokal Dinoyo. Dibakar pada suhu tinggi 1.250°C menghasilkan material yang padat, tahan air, dan awet. Tekstur matte halus dengan sentuhan hangat alami, cocok untuk dekorasi maupun penggunaan sehari-hari.
                </p>

                <div style={{ border: "1px solid var(--line)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--bark)", margin: "0 0 1rem" }}>Spesifikasi Detail</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", margin: 0 }}>Bahan Utama</p>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", margin: "0.15rem 0 0" }}>Tanah Liat (Stoneware)</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", margin: 0 }}>Finishing</p>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", margin: "0.15rem 0 0" }}>Matte Glaze Alami</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", margin: 0 }}>Dimensi Produk</p>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", margin: "0.15rem 0 0" }}>T 18cm x D 9cm</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", margin: 0 }}>Berat Bersih</p>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", margin: "0.15rem 0 0" }}>600 gram</p>
                    </div>
                  </div>
                </div>
                
                {/* Ulasan Pelanggan Section */}
                <div style={{ borderTop: "8px solid var(--surface)", margin: "0 -1.5rem", padding: "1.5rem 1.5rem 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--bark)", margin: 0 }}>Ulasan Pelanggan</h3>
                    {reviews.length > 1 && (
                      <span 
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        style={{ fontSize: "0.8rem", color: "var(--bark-muted)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", userSelect: "none" }}
                      >
                        {showAllReviews ? "Tutup" : "Lihat Semua"} 
                        <CaretRight size={14} style={{ transform: showAllReviews ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                      </span>
                    )}
                  </div>
                  
                  {/* Rating summary */}
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--bark)", margin: 0, lineHeight: 1 }}>{selectedProduct.rating}</p>
                      <div style={{ display: "flex", gap: "2px", color: "#f59e0b", justifyContent: "center", margin: "0.25rem 0" }}>
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} weight={i <= Math.floor(selectedProduct.rating) ? "fill" : "regular"} />)}
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "var(--bark-muted)", margin: 0 }}>128 ulasan</p>
                    </div>
                    <div style={{ flex: 1, background: "var(--surface)", padding: "0.75rem", borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <ThumbsUp size={16} color="var(--bark)" weight="fill" />
                      <p style={{ fontSize: "0.8rem", color: "var(--bark)", margin: 0 }}>
                        <span style={{ fontWeight: 700 }}>98% pembeli</span> merekomendasikan produk ini
                      </p>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {(showAllReviews ? reviews : reviews.slice(0, 1)).map(review => (
                    <div key={review.id} style={{ padding: "1.25rem", border: "1px solid var(--line)", borderRadius: "1rem", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.65rem" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={review.avatar} alt={review.customerName}
                            style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--line)", flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--bark)", margin: 0 }}>{review.customerName}</p>
                            <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: 0 }}>{review.date}</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "2px", color: "#f59e0b", marginBottom: "0.35rem" }}>
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} weight={i <= review.rating ? "fill" : "regular"} />)}
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: "0 0 0.6rem" }}>
                        Varian: <strong style={{ color: "var(--clay)" }}>{review.variantName}</strong>
                      </p>
                      <p style={{ fontSize: "0.88rem", color: "var(--bark)", lineHeight: 1.55, margin: "0 0 0.75rem" }}>
                        {review.content}
                      </p>
                      {review.photo && (
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={review.photo} alt="Foto ulasan"
                            style={{ width: 88, height: 72, borderRadius: "0.5rem", objectFit: "cover", border: "1px solid var(--line)" }} />
                        </div>
                      )}
                      
                      {/* Seller Reply Section */}
                      {review.isEditing ? (
                        <div style={{ marginTop: "1rem", background: "var(--surface)", padding: "1rem", borderRadius: "0.75rem" }}>
                          <textarea
                            value={review.editDraft}
                            onChange={(e) => updateDraft(review.id, e.target.value)}
                            placeholder="Tulis balasan Anda untuk pembeli ini..."
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line-strong)", fontSize: "0.85rem", resize: "vertical", minHeight: 80, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box" }}
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem" }}>
                            <button onClick={() => toggleEditReply(review.id, false)} style={{ padding: "0.4rem 0.8rem", borderRadius: "0.5rem", border: "1px solid var(--line-strong)", background: "#fff", color: "var(--bark)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Batal</button>
                            <button onClick={() => saveReply(review.id)} style={{ padding: "0.4rem 0.8rem", borderRadius: "0.5rem", border: "none", background: "var(--clay)", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Simpan Balasan</button>
                          </div>
                        </div>
                      ) : review.reply ? (
                        <div style={{ marginTop: "1rem", background: "var(--surface)", padding: "1rem", borderRadius: "0.75rem", position: "relative" }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--bark)", margin: "0 0 0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Storefront size={14} /> Dinoyo Ceramic Studio
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "var(--bark-muted)", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                            "{review.reply}"
                          </p>
                          <button onClick={() => toggleEditReply(review.id, true)} style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "transparent", border: "none", color: "var(--clay)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <PencilSimple size={14} /> Edit
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: "1rem", textAlign: "right" }}>
                          <button onClick={() => toggleEditReply(review.id, true)} style={{ padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid var(--clay)", background: "#fff", color: "var(--clay)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                            Balas Ulasan
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
