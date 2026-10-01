"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash, PencilSimple, X, Check, Image as ImageIcon, Link, UploadSimple } from "@phosphor-icons/react";

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

  // Add form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [stock, setStock] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar"); return;
    }
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setImageUrl(objectUrl);
  }, []);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStock, setEditStock] = useState("");

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

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/mitra/login");
      return;
    }
    loadArtworks();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      toast.success("Produk berhasil ditambahkan!");
      
      const slug = (title || "produk").trim().toLowerCase().replace(/\s+/g, "-");
      const newProduct: Artwork = {
        id: `prod-${slug}-${artworks.length + 1}`,
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
    setImagePreview(null);
    setStock("");
  }

  function handleDelete(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setArtworks(artworks.filter(a => a.id !== id));
      toast.success("Produk berhasil dihapus!");
    }
  }

  function startEdit(item: Artwork) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditPrice(String(item.price));
    setEditCategory(item.category);
    setEditStock(String(item.stock));
    setShowForm(false);
  }

  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    setArtworks(prev => prev.map(a => a.id === editingId ? {
      ...a,
      title: editTitle,
      description: editDescription,
      price: parseInt(editPrice),
      category: editCategory,
      stock: parseInt(editStock),
    } : a));
    setEditingId(null);
    toast.success("Produk berhasil diperbarui!");
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

          {/* Image Upload Section — full row */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Foto Produk</label>
            
            {/* Tab switch */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {(["upload", "url"] as const).map((src) => (
                <button key={src} type="button" onClick={() => setImageSource(src)}
                  style={{
                    padding: "0.4rem 1rem", borderRadius: "9999px", border: "1px solid var(--line)",
                    cursor: "pointer", fontWeight: 600, fontSize: "0.8rem",
                    background: imageSource === src ? "var(--bark)" : "transparent",
                    color: imageSource === src ? "#fff" : "var(--bark-muted)",
                    display: "flex", alignItems: "center", gap: "0.35rem",
                    transition: "all 0.15s"
                  }}>
                  {src === "upload" ? <><UploadSimple size={14} weight="bold" /> Upload dari Komputer</> : <><Link size={14} weight="bold" /> Tempel URL</>}
                </button>
              ))}
            </div>

            {imageSource === "upload" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
                style={{
                  border: `2px dashed ${isDragOver ? "var(--clay)" : "var(--line)"}`,
                  borderRadius: "0.75rem", padding: "1.5rem",
                  background: isDragOver ? "rgba(var(--clay-rgb, 150,80,50),0.05)" : "var(--surface)",
                  textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"
                }}
              >
                {imagePreview ? (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="preview" style={{ height: 120, maxWidth: "100%", objectFit: "contain", borderRadius: "0.5rem" }} />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageUrl(""); }}
                      style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#e53e3e", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={12} weight="bold" />
                    </button>
                    <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--bark-muted)" }}>Klik untuk ganti gambar</p>
                  </div>
                ) : (
                  <>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={24} weight="thin" color="var(--bark-muted)" />
                    </div>
                    <p style={{ fontWeight: 600, color: "var(--bark)", fontSize: "0.9rem" }}>Drag & drop atau klik untuk pilih foto</p>
                    <p style={{ color: "var(--bark-muted)", fontSize: "0.75rem" }}>PNG, JPG, WEBP — maks. 5MB</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input type="url" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                  placeholder="https://..." style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", fontSize: "0.9rem" }} />
                {imageUrl && (
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem", background: "var(--surface)", borderRadius: "0.5rem", border: "1px solid var(--line)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="preview" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "0.5rem", flexShrink: 0 }} onError={(e) => (e.currentTarget.style.display = "none")} />
                    <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", wordBreak: "break-all" }}>{imageUrl}</p>
                  </div>
                )}
              </div>
            )}
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
          <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{
              background: "#fff", borderRadius: editingId === item.id ? "1rem 1rem 0 0" : "1rem",
              border: "1px solid var(--line)", display: "flex", overflow: "hidden"
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
                  <button onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)} style={{
                    padding: "0.5rem", borderRadius: "0.5rem",
                    border: editingId === item.id ? "1px solid var(--clay)" : "1px solid var(--line)",
                    background: editingId === item.id ? "var(--clay)" : "transparent",
                    color: editingId === item.id ? "#fff" : "var(--bark)", cursor: "pointer"
                  }} title={editingId === item.id ? "Tutup Edit" : "Edit Produk"}>
                    {editingId === item.id ? <X size={18} /> : <PencilSimple size={18} />}
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

            {/* Inline edit form */}
            {editingId === item.id && (
              <form onSubmit={handleEditSave} style={{
                background: "var(--surface)", borderRadius: "0 0 1rem 1rem",
                border: "1px solid var(--line)", borderTop: "none",
                padding: "1.25rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem"
              }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Nama Produk</label>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} required
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", background: "#fff" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Deskripsi</label>
                  <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2}
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", background: "#fff", fontFamily: "inherit", resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Harga (Rp)</label>
                  <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} required
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", background: "#fff" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Stok</label>
                  <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} required
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", background: "#fff" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Kategori</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line)", background: "#fff" }}>
                    <option value="Dekorasi">Dekorasi</option>
                    <option value="Peralatan Makan">Peralatan Makan</option>
                    <option value="Souvenir">Souvenir</option>
                    <option value="Pot">Pot Tanaman</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
                  <button type="submit" style={{
                    padding: "0.6rem 1.25rem", borderRadius: "0.5rem",
                    background: "var(--bark)", color: "#fff", border: "none",
                    fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem"
                  }}>
                    <Check size={16} weight="bold" /> Simpan
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} style={{
                    padding: "0.6rem 1rem", borderRadius: "0.5rem",
                    background: "transparent", color: "var(--bark-muted)", border: "1px solid var(--line)",
                    cursor: "pointer"
                  }}>Batal</button>
                </div>
              </form>
            )}
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
