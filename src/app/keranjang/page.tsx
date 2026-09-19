"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash, ArrowRight, ShoppingCart, Storefront } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function KeranjangPage() {
  const router = useRouter();
  const { items, getGroupedItems, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();
  const groupedItems = getGroupedItems();

  return (
    <div style={{ background: "var(--surface)", color: "var(--bark)", minHeight: "100dvh", fontFamily: "var(--font-outfit), sans-serif" }}>
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bark)", marginBottom: "2rem" }}>
          Keranjang Belanja
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0", background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.5rem" }}>
            <ShoppingCart size={48} color="var(--line-strong)" style={{ margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--bark)" }}>Keranjang masih kosong</h2>
            <p style={{ color: "var(--bark-muted)", marginTop: "0.5rem", marginBottom: "2rem" }}>Mari mulai mencari keramik impianmu.</p>
            <Link
              href="/produk"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1.5rem", borderRadius: "9999px",
                background: "var(--clay)", color: "#fff", fontWeight: 600, textDecoration: "none"
              }}
            >
              Mulai Belanja <ArrowRight weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedItems).map(([storeId, storeItems]) => {
                const storeName = storeItems[0]?.store_name || "Toko Dinoyo";
                
                return (
                  <div key={storeId} style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.25rem", overflow: "hidden" }}>
                    <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--line)", background: "var(--surface-light)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Storefront size={20} color="var(--clay)" weight="fill" />
                      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--bark)" }}>{storeName}</h2>
                    </div>
                    
                    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {storeItems.map((item) => (
                        <div key={item.id} style={{ display: "flex", gap: "1rem" }}>
                          <div style={{ position: "relative", width: "90px", height: "90px", borderRadius: "0.75rem", overflow: "hidden", flexShrink: 0 }}>
                            <Image src={item.image_url} alt={item.title} fill style={{ objectFit: "cover" }} />
                          </div>
                          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.25rem" }}>{item.title}</h3>
                                <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--clay)" }}>Rp {item.price.toLocaleString("id-ID")}</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                style={{ color: "var(--bark-muted)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
                                title="Hapus dari keranjang"
                              >
                                <Trash size={20} />
                              </button>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--line)", borderRadius: "0.5rem" }}>
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  style={{ padding: "0.25rem 0.75rem", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--bark)" }}
                                >-</button>
                                <span style={{ fontSize: "0.9rem", fontWeight: 600, width: "1.5rem", textAlign: "center", color: "var(--bark)" }}>{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  style={{ padding: "0.25rem 0.75rem", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--bark)" }}
                                >+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <aside style={{ background: "#fff", border: "1.5px solid var(--line)", borderRadius: "1.25rem", padding: "1.5rem", position: "sticky", top: "100px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", marginBottom: "1.5rem" }}>Ringkasan Belanja</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontSize: "0.95rem", color: "var(--bark-muted)" }}>
                <span>Total Harga ({items.reduce((acc, curr) => acc + curr.quantity, 0)} Barang)</span>
                <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div style={{ borderTop: "1.5px solid var(--line)", margin: "1rem 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", fontSize: "1.1rem", fontWeight: 800, color: "var(--bark)" }}>
                <span>Total Tagihan</span>
                <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <button
                style={{
                  width: "100%", padding: "0.85rem", borderRadius: "0.75rem",
                  background: "var(--clay)", color: "#fff", fontWeight: 700, fontSize: "0.95rem",
                  border: "none", cursor: "pointer"
                }}
                onClick={() => router.push("/customer/pembayaran/INV-123")}
              >
                Beli Sekarang
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
