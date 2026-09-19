"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash, PencilSimple } from "@phosphor-icons/react";

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
};

export default function SellerCatalogPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/auth");
      return;
    }
    loadArtworks();
  }, [router]);

  const loadArtworks = () => {
    setArtworks([
      {
        id: "prod-1",
        title: "Vas Bunga Tanah Liat Dinoyo",
        description: "Vas cantik buatan tangan dari tanah liat pilihan.",
        price: 150000,
        category: "Dekorasi",
        stock: 12,
        image_url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "prod-2",
        title: "Set Gelas Keramik Estetik",
        description: "Gelas keramik tahan panas cocok untuk kopi pagi.",
        price: 85000,
        category: "Peralatan Makan",
        stock: 5,
        image_url: "https://images.unsplash.com/photo-1578886134769-e9682121e7e4?auto=format&fit=crop&w=400&q=80",
      }
    ]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      toast.success("Produk berhasil ditambahkan (Mock)");
      
      const newProduct: Artwork = {
        id: `prod-${Date.now()}`,
        title,
        description,
        price: parseInt(price),
        category,
        stock: parseInt(stock),
        image_url: imageUrl || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
      };

      setArtworks([newProduct, ...artworks]);
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error("Gagal menambahkan produk");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImageUrl("");
    setStock("");
  }

  function handleDelete(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setArtworks(artworks.filter(a => a.id !== id));
      toast.success("Produk berhasil dihapus (Mock)");
    }
  }

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem" }}>
            Katalog Produk
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
            Kelola karya keramik yang dijual di tokomu.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.25rem", borderRadius: "0.75rem",
            background: "var(--clay)", color: "#fff",
            fontWeight: 700, border: "none", cursor: "pointer",
            transition: "background 0.2s"
          }}
        >
          {showForm ? "Batal" : <><Plus size={18} weight="bold" /> Tambah Produk</>}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: "#fff", padding: "1.5rem", borderRadius: "1rem",
          border: "1px solid var(--line)", marginBottom: "2rem",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem"
        }}>
          <h2 style={{ gridColumn: "1 / -1", fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.5rem" }}>
            Tambah Produk Baru
          </h2>
          
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Nama Produk</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)" }} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Deskripsi Singkat</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", fontFamily: "inherit" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Harga (Rp)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Stok</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", background: "#fff" }}>
              <option value="">Pilih Kategori</option>
              <option value="Dekorasi">Dekorasi</option>
              <option value="Peralatan Makan">Peralatan Makan</option>
              <option value="Souvenir">Souvenir</option>
              <option value="Pot">Pot Tanaman</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>URL Foto Produk</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)" }} />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button type="submit" disabled={loading} style={{
              padding: "0.75rem 2rem", borderRadius: "0.75rem",
              background: "var(--bark)", color: "#fff",
              fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer"
            }}>
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      )}

      {/* Product List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {artworks.map((item) => (
          <div key={item.id} style={{
            background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)",
            display: "flex", overflow: "hidden"
          }}>
            <div style={{
              width: "160px", background: `url(${item.image_url}) center/cover no-repeat`,
              borderRight: "1px solid var(--line)"
            }} />
            
            <div style={{ padding: "1.5rem", flex: 1, display: "flex", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--clay)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.category}
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", margin: "0.25rem 0 0.5rem" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--bark-muted)", marginBottom: "1rem" }}>
                  {item.description}
                </p>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)" }}>Harga</p>
                    <p style={{ fontWeight: 700, color: "var(--bark)" }}>Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)" }}>Stok</p>
                    <p style={{ fontWeight: 700, color: "var(--bark)" }}>{item.stock} Unit</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "flex-start" }}>
                <button style={{
                  padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--line)",
                  background: "transparent", color: "var(--bark)", cursor: "pointer"
                }} title="Edit Produk">
                  <PencilSimple size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} style={{
                  padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--error, #f56565)",
                  background: "transparent", color: "var(--error, #e53e3e)", cursor: "pointer"
                }} title="Hapus Produk">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {artworks.length === 0 && (
          <div style={{
            padding: "3rem", textAlign: "center", background: "#fff",
            borderRadius: "1rem", border: "1px dashed var(--line-strong)"
          }}>
            <p style={{ color: "var(--bark-muted)" }}>Belum ada produk di katalogmu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
