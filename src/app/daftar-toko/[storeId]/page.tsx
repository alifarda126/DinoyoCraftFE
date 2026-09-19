"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { Star, MapPin, ShoppingCart } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import { useCartStore } from "@/store/cartStore";
import { getDemoSession } from "@/lib/demo";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Mock Data for Store Detail
const storeData: Record<string, any> = {
  "studio-bumi": {
    name: "Studio Bumi",
    description: "Fokus pada keramik fungsional berdesain minimalis dan earthy. Kami menggunakan tanah liat lokal berkualitas tinggi yang diproses dengan teknik tradisional namun menghasilkan bentuk yang modern.",
    rating: 4.8,
    reviews: 124,
    location: "Gang 2, No. 15",
    cover: "https://picsum.photos/seed/studiobumi-cover/1200/400",
    products: [
      { id: "p1", title: "Mug Keramik Motif Daun", price: 120000, rating: 4.8, image: "https://picsum.photos/seed/mug1/400/400" },
      { id: "p6", title: "Asbak Unik Bentuk Tangan", price: 95000, rating: 4.8, image: "https://picsum.photos/seed/ashtray1/400/400" },
    ]
  },
  "keramik-rina": {
    name: "Keramik Rina",
    description: "Spesialis peralatan makan dengan glasir pastel yang cantik.",
    rating: 4.9,
    reviews: 89,
    location: "Gang 1, No. 4",
    cover: "https://picsum.photos/seed/keramikrina-cover/1200/400",
    products: [
      { id: "p2", title: "Piring Estetik Putih Tulang", price: 85000, rating: 4.9, image: "https://picsum.photos/seed/plate1/400/400" },
      { id: "p5", title: "Mangkuk Keramik Jepang", price: 65000, rating: 4.6, image: "https://picsum.photos/seed/bowl1/400/400" },
    ]
  }
};

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = typeof params?.storeId === "string" ? params.storeId : "";
  const store = storeData[storeId] || storeData["studio-bumi"]; // Fallback for demo
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (product: any) => {
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
      store_id: storeId,
      store_name: store.name,
    });
    toast.success(`${product.title} ditambahkan ke keranjang.`);
    setTimeout(() => router.push("/keranjang"), 800);
  };

  return (
    <div style={{ background: "var(--surface)", color: "var(--bark)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif" }}>
      <Navbar />

      {/* Store Banner */}
      <section style={{ position: "relative", height: "30vh", minHeight: "250px", width: "100%" }}>
        <Image
          src={store.cover}
          alt={store.name}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))" }} />
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8" style={{ position: "absolute", bottom: "2rem", left: 0, right: 0 }}>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            {store.name}
          </h1>
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", color: "rgba(255,255,255,0.8)", fontSize: "1rem", fontWeight: 500 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Star weight="fill" color="#F59E0B" />
              <span>{store.rating} ({store.reviews} ulasan)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin weight="fill" />
              <span>{store.location}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 lg:py-16 grid lg:grid-cols-3 gap-12">
        {/* Left Column: About & Map */}
        <aside className="space-y-8">
          <div style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.25rem", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", marginBottom: "1rem" }}>Tentang Toko</h3>
            <p style={{ color: "var(--bark-muted)", lineHeight: 1.7, fontSize: "0.95rem" }}>
              {store.description}
            </p>
          </div>

          <div style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.25rem", padding: "1.5rem", overflow: "hidden" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", marginBottom: "1rem" }}>Lokasi Bengkel</h3>
            <div style={{ borderRadius: "0.75rem", overflow: "hidden", height: "200px", position: "relative", background: "var(--surface-elevated)" }}>
              {/* Static Map Embed Simulation */}
              <Image
                src="https://picsum.photos/seed/map/400/200"
                alt="Peta Lokasi"
                fill
                style={{ objectFit: "cover", opacity: 0.8 }}
              />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <MapPin size={32} color="#e53e3e" weight="fill" />
                <span style={{ background: "#fff", padding: "0.2rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  {store.name}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Store Products */}
        <div className="lg:col-span-2">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bark)", marginBottom: "1.5rem" }}>Katalog {store.name}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {store.products.map((item: any) => (
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
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                    className="hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#F59E0B" }}>
                      <Star weight="fill" size={12} />
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bark)" }}>{item.rating}</span>
                    </div>
                  </div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--bark)",
                      marginBottom: "0.75rem",
                      lineHeight: 1.4,
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
                      <ShoppingCart size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
