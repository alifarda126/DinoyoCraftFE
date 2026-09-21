"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import { useCartStore } from "@/store/cartStore";
import { getDemoSession } from "@/lib/demo";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Mock Data for Catalog
const produkKatalog = [
  { id: "p1", title: "Mug Keramik Motif Daun", store: "Studio Bumi", category: "Peralatan Minum", price: 120000, rating: 4.8, image: "https://picsum.photos/seed/mug1/400/400" },
  { id: "p2", title: "Piring Estetik Putih Tulang", store: "Keramik Rina", category: "Peralatan Makan", price: 85000, rating: 4.9, image: "https://picsum.photos/seed/plate1/400/400" },
  { id: "p3", title: "Vas Bunga Minimalis", store: "Tanah Liat Art", category: "Dekorasi", price: 250000, rating: 5.0, image: "https://picsum.photos/seed/vase1/400/400" },
  { id: "p4", title: "Set Cangkir Teh Klasik", store: "Dinoyo Heritage", category: "Peralatan Minum", price: 180000, rating: 4.7, image: "https://picsum.photos/seed/tea1/400/400" },
  { id: "p5", title: "Mangkuk Keramik Jepang", store: "Keramik Rina", category: "Peralatan Makan", price: 65000, rating: 4.6, image: "https://picsum.photos/seed/bowl1/400/400" },
  { id: "p6", title: "Asbak Unik Bentuk Tangan", store: "Studio Bumi", category: "Aksesoris", price: 95000, rating: 4.8, image: "https://picsum.photos/seed/ashtray1/400/400" },
  { id: "p7", title: "Pot Tanaman Hias", store: "Tanah Liat Art", category: "Dekorasi", price: 150000, rating: 4.9, image: "https://picsum.photos/seed/pot1/400/400" },
  { id: "p8", title: "Gelas Kopi Tahan Panas", store: "Dinoyo Heritage", category: "Peralatan Minum", price: 110000, rating: 4.8, image: "https://picsum.photos/seed/coffee1/400/400" },
];

const categories = ["Semua", "Peralatan Makan", "Peralatan Minum", "Dekorasi", "Aksesoris"];
const stores = ["Semua", "Studio Bumi", "Keramik Rina", "Tanah Liat Art", "Dinoyo Heritage"];

export default function ProdukPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedStore, setSelectedStore] = useState("Semua");
  const [showFilters, setShowFilters] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const filteredProduk = produkKatalog.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    const matchStore = selectedStore === "Semua" || item.store === selectedStore;
    return matchSearch && matchCategory && matchStore;
  });

  const handleAddToCart = (product: typeof produkKatalog[0]) => {
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
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bark)" }}>
            Katalog Produk
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "1.1rem", maxWidth: "60ch" }}>
            Temukan berbagai mahakarya tanah liat langsung dari pengrajin Kampung Keramik Dinoyo.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Mobile Filter Toggle */}
          <button
            className="lg:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{ background: "#fff", border: "1.5px solid var(--line)" }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Funnel size={20} />
            <span style={{ fontWeight: 600 }}>{showFilters ? "Tutup Filter" : "Tampilkan Filter"}</span>
          </button>

          {/* Sidebar Filter */}
          <aside
            className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0 space-y-8`}
            style={{ position: "sticky", top: "100px" }}
          >
            {/* Search */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.5rem" }}>Cari Produk</label>
              <div style={{ position: "relative" }}>
                <MagnifyingGlass size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--bark-muted)" }} />
                <input
                  type="text"
                  placeholder="Nama produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "0.75rem",
                    border: "1.5px solid var(--line)", background: "#fff", fontSize: "0.9rem", outline: "none"
                  }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.75rem" }}>Kategori</label>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0",
                      fontSize: "0.95rem", color: selectedCategory === cat ? "var(--clay)" : "var(--bark-muted)",
                      fontWeight: selectedCategory === cat ? 700 : 500, background: "none", border: "none", cursor: "pointer",
                      transition: "color 0.2s"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Store Filter */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.75rem" }}>Toko Pengrajin</label>
              <div className="space-y-2">
                {stores.map(store => (
                  <button
                    key={store}
                    onClick={() => setSelectedStore(store)}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0",
                      fontSize: "0.95rem", color: selectedStore === store ? "var(--clay)" : "var(--bark-muted)",
                      fontWeight: selectedStore === store ? 700 : 500, background: "none", border: "none", cursor: "pointer",
                      transition: "color 0.2s"
                    }}
                  >
                    {store}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredProduk.length > 0 ? (
                filteredProduk.map((item, index) => (
                  <div
                    key={item.id}
                    className="card-hover-glow"
                    style={{
                      position: "relative",
                      borderRadius: "1.25rem",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      aspectRatio: "3/4",
                      border: "1.5px solid var(--line)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(61,43,31,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Full Card Image Background */}
                    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                        className="hover:scale-105 transition-transform duration-700"
                        priority={index < 4}
                      />
                    </div>

                    {/* Glassmorphism Text Area at the bottom */}
                    <div style={{ 
                      marginTop: "auto", 
                      position: "relative", 
                      zIndex: 1,
                      padding: "1rem 1.25rem", 
                      display: "flex", 
                      flexDirection: "column",
                      background: "rgba(255, 255, 255, 0.85)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      borderTop: "1px solid rgba(255, 255, 255, 0.6)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <p
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "var(--bark-muted)",
                            fontFamily: "var(--font-geist-mono), monospace",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.store}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#d97706" }}>
                          <Star weight="fill" size={12} />
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--bark)" }}>{item.rating}</span>
                        </div>
                      </div>
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 800,
                          color: "var(--bark)",
                          marginBottom: "0.75rem",
                          lineHeight: 1.3,
                          flexGrow: 1,
                        }}
                      >
                        {item.title}
                      </h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--clay)" }}>
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "2.25rem",
                            height: "2.25rem",
                            borderRadius: "9999px",
                            background: "rgba(0, 0, 0, 0.05)",
                            color: "var(--clay)",
                            border: "1px solid rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          title="Tambah ke Keranjang"
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "var(--clay)";
                            (e.currentTarget as HTMLElement).style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(0, 0, 0, 0.05)";
                            (e.currentTarget as HTMLElement).style.color = "var(--clay)";
                          }}
                          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
                          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <ShoppingCart size={16} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 0", color: "var(--bark-muted)" }}>
                  <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Produk tidak ditemukan</p>
                  <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
