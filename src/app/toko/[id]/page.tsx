"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Storefront, Star, MapPin, CalendarBlank, ShoppingCart } from "@phosphor-icons/react";

const MOCK_PRODUCTS = [
  { id: 1, title: "Vas Keramik Motif Batik", price: 150000, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&auto=format&fit=crop&q=60" },
  { id: 2, title: "Piring Hias Klasik", price: 85000, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&auto=format&fit=crop&q=60" },
  { id: 3, title: "Set Cangkir Teh Modern", price: 210000, image: "https://images.unsplash.com/photo-1594916843469-6505e83ec6c8?w=500&auto=format&fit=crop&q=60" },
  { id: 4, title: "Mangkuk Sup Minimalis", price: 65000, image: "https://images.unsplash.com/photo-1620063261266-9dc476ed5423?w=500&auto=format&fit=crop&q=60" },
];

export default function DetailTokoPage() {
  const params = useParams();
  const tokoId = params.id as string;

  return (
    <div style={{ background: "var(--surface)", color: "var(--bark)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif" }}>
      <Navbar />

      {/* Banner Toko */}
      <div style={{ position: "relative", height: "250px", width: "100%", background: "var(--line-strong)", overflow: "hidden" }}>
        <Image 
          src="https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=1200&auto=format&fit=crop&q=80" 
          alt="Banner Toko" 
          fill 
          style={{ objectFit: "cover", opacity: 0.8 }} 
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "150px", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}></div>
      </div>

      <main className="max-w-[1200px] mx-auto px-5 lg:px-8 pb-16">
        {/* Profil Toko Card */}
        <div style={{ 
          background: "#fff", borderRadius: "1.5rem", padding: "2rem", border: "1.5px solid var(--line)",
          marginTop: "-60px", position: "relative", zIndex: 10, display: "flex", flexWrap: "wrap", gap: "2rem",
          alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div style={{ 
              width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", 
              border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexShrink: 0, background: "var(--surface)"
            }}>
              <Storefront size={64} color="var(--clay)" weight="duotone" style={{ margin: "14px auto" }} />
            </div>
            
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem" }}>
                Studio Keramik Bumi
              </h1>
              <p style={{ color: "var(--bark-muted)", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                <MapPin size={16} /> Dinoyo, Malang
              </p>
              
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", fontWeight: 600 }}>
                  <Star size={16} weight="fill" color="#F59E0B" />
                  4.8 <span style={{ color: "var(--bark-muted)", fontWeight: 400 }}>(120 Ulasan)</span>
                </div>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--line-strong)", alignSelf: "center" }}></div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", color: "var(--bark-muted)" }}>
                  <CalendarBlank size={16} /> Bergabung 2021
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "1rem" }}>
            <button style={{ 
              padding: "0.75rem 1.5rem", borderRadius: "9999px", background: "var(--clay)", color: "#fff", 
              fontWeight: 700, border: "none", cursor: "pointer" 
            }}>
              Follow Toko
            </button>
            <button style={{ 
              padding: "0.75rem 1.5rem", borderRadius: "9999px", background: "transparent", color: "var(--bark)", 
              fontWeight: 700, border: "1.5px solid var(--line-strong)", cursor: "pointer" 
            }}>
              Chat Penjual
            </button>
          </div>
        </div>

        {/* Tab Navigasi Mock */}
        <div style={{ display: "flex", gap: "2rem", marginTop: "3rem", borderBottom: "1.5px solid var(--line)", paddingBottom: "1rem" }}>
          <div style={{ fontWeight: 800, color: "var(--bark)", position: "relative", cursor: "pointer" }}>
            Produk Toko
            <div style={{ position: "absolute", bottom: "-17px", left: 0, right: 0, height: "3px", background: "var(--clay)", borderRadius: "3px 3px 0 0" }}></div>
          </div>
          <div style={{ fontWeight: 600, color: "var(--bark-muted)", cursor: "pointer" }}>Profil & Kebijakan</div>
          <div style={{ fontWeight: 600, color: "var(--bark-muted)", cursor: "pointer" }}>Ulasan Pembeli</div>
        </div>

        {/* Katalog Produk */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {MOCK_PRODUCTS.map((product) => (
            <Link href={`/produk/${product.id}`} key={product.id} style={{ textDecoration: "none" }}>
              <div style={{ 
                background: "#fff", borderRadius: "1.25rem", border: "1.5px solid var(--line)", 
                overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", height: "100%",
                display: "flex", flexDirection: "column"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)" }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none" }}
              >
                <div style={{ position: "relative", paddingTop: "100%", background: "var(--surface-light)" }}>
                  <Image src={product.image} alt={product.title} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                    {product.title}
                  </h3>
                  <div style={{ marginTop: "auto" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--clay)", marginBottom: "1rem" }}>
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    <button style={{ 
                      width: "100%", padding: "0.6rem", borderRadius: "0.75rem", background: "var(--surface)", 
                      color: "var(--bark)", fontWeight: 700, border: "1px solid var(--line-strong)", 
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                    }}>
                      <ShoppingCart size={16} /> Tambah
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
