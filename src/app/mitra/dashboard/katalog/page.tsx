"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Trash, PencilSimple, X, Check,
  Image as ImageIcon, Link as LinkIcon, UploadSimple,
  Star, Palette,
} from "@phosphor-icons/react";

/* ── Types ───────────────────────────────────────────────────────────────── */

type ColorVariant = { name: string; hex: string; label: string };

type Review = {
  id: string;
  author: string;
  rating: number;
};

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  variants: ColorVariant[];
  reviews: Review[];
};

/* ── Preset colors ──────────────────────────────────────────────────────── */

const PRESET_COLORS: ColorVariant[] = [
  { name: "Sand White",   hex: "#f0ebe3", label: "Glossy Finish" },
  { name: "Terracotta",   hex: "#c1694f", label: "Matte Earthy"  },
  { name: "Raw Speckle",  hex: "#d4cfc8", label: "Bintik Alami"  },
  { name: "Charcoal Ash", hex: "#3d3d3d", label: "Tekstur Abu"   },
  { name: "Sage Green",   hex: "#8aad8a", label: "Natural Moss"  },
  { name: "Cobalt Blue",  hex: "#3b5fa0", label: "Deep Ocean"    },
];

/* ── Component ───────────────────────────────────────────────────────────── */

export default function SellerCatalogPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* Add-form state */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [stock, setStock] = useState("");
  const [selectedColors, setSelectedColors] = useState<ColorVariant[]>([]);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#b85c3c");
  const [customColorLabel, setCustomColorLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Edit state */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editColors, setEditColors] = useState<ColorVariant[]>([]);
  const [editCustomName, setEditCustomName] = useState("");
  const [editCustomHex, setEditCustomHex] = useState("#b85c3c");
  const [editCustomLabel, setEditCustomLabel] = useState("");

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setImageUrl(objectUrl);
  }, []);

  const loadArtworks = () => {
    setArtworks([
      {
        id: "prod-1",
        title: "Vas Minimalis",
        description: "Vas cantik buatan tangan dari tanah liat pilihan. Cocok untuk sudut ruangan estetik.",
        price: 85000,
        category: "Dekorasi",
        stock: 12,
        image_url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
        variants: [PRESET_COLORS[0], PRESET_COLORS[1], PRESET_COLORS[2], PRESET_COLORS[3]],
        reviews: [
          { id: "r1", author: "Sari", rating: 5 },
          { id: "r2", author: "Budi", rating: 5 },
          { id: "r3", author: "Rina", rating: 4 },
          { id: "r4", author: "Agung", rating: 5 },
        ],
      },
      {
        id: "prod-2",
        title: "Cangkir Handmade",
        description: "Gelas keramik tahan panas, sangat cocok untuk kopi atau teh hangat.",
        price: 65000,
        category: "Peralatan Makan",
        stock: 5,
        image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80",
        variants: [PRESET_COLORS[0], PRESET_COLORS[4]],
        reviews: [
          { id: "r1", author: "Sari", rating: 5 },
          { id: "r2", author: "Budi", rating: 4 },
        ],
      },
      {
        id: "prod-3",
        title: "Mangkuk Keramik",
        description: "Mangkuk keramik yang elegan untuk sup atau sereal. Dilapisi glasir food-grade.",
        price: 75000,
        category: "Peralatan Makan",
        stock: 8,
        image_url: "https://images.unsplash.com/photo-1530006498959-b7884e829a04?auto=format&fit=crop&w=400&q=80",
        variants: [PRESET_COLORS[0], PRESET_COLORS[3]],
        reviews: [
          { id: "r1", author: "Andi", rating: 5 },
        ],
      },
      {
        id: "prod-4",
        title: "Piring Artisan",
        description: "Piring makan unik dengan tekstur artisan khas perajin Dinoyo.",
        price: 95000,
        category: "Peralatan Makan",
        stock: 3,
        image_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80",
        variants: [PRESET_COLORS[2]],
        reviews: [
          { id: "r1", author: "Maya", rating: 5 },
          { id: "r2", author: "Leo", rating: 5 },
        ],
      },
    ]);
  };

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") { router.push("/mitra/login"); return; }
    loadArtworks();
  }, [router]);

  /* ── Color helpers ───────────────────────────────────────────────────── */

  function toggleColor(c: ColorVariant, list: ColorVariant[], setList: (v: ColorVariant[]) => void) {
    setList(list.find(x => x.name === c.name) ? list.filter(x => x.name !== c.name) : [...list, c]);
  }

  function addCustomColor(
    list: ColorVariant[], setList: (v: ColorVariant[]) => void,
    name: string, hex: string, label: string,
    setName: (v: string) => void, setLabel: (v: string) => void, setHex: (v: string) => void
  ) {
    if (!name.trim()) { toast.error("Nama warna wajib diisi"); return; }
    if (list.find(x => x.name === name)) { toast.error("Warna sudah ada"); return; }
    setList([...list, { name, hex, label: label || "Custom" }]);
    setName(""); setLabel(""); setHex("#b85c3c");
  }

  function removeColor(name: string, list: ColorVariant[], setList: (v: ColorVariant[]) => void) {
    setList(list.filter(x => x.name !== name));
  }

  /* ── Form handlers ───────────────────────────────────────────────────── */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const slug = (title || "produk").trim().toLowerCase().replace(/\s+/g, "-");
      const newProduct: Artwork = {
        id: `prod-${slug}-${artworks.length + 1}`,
        title, description,
        price: parseInt(price),
        category, stock: parseInt(stock),
        image_url: imageUrl || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
        variants: selectedColors,
        reviews: [],
      };
      setArtworks([newProduct, ...artworks]);
      toast.success("Produk berhasil ditambahkan!");
      setShowForm(false);
      resetForm();
    } catch {
      toast.error("Gagal menambahkan produk");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle(""); setDescription(""); setPrice(""); setCategory("");
    setImageUrl(""); setImagePreview(null); setStock(""); setSelectedColors([]);
    setCustomColorName(""); setCustomColorLabel(""); setCustomColorHex("#b85c3c");
  }

  function handleDelete(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setArtworks(artworks.filter(a => a.id !== id));
      toast.success("Produk berhasil dihapus!");
    }
  }

  function startEdit(item: Artwork) {
    setEditingId(item.id);
    setEditTitle(item.title); setEditDescription(item.description);
    setEditPrice(String(item.price)); setEditCategory(item.category);
    setEditStock(String(item.stock));
    setEditColors([...item.variants]);
    setShowForm(false);
  }

  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    setArtworks(prev => prev.map(a => a.id === editingId ? {
      ...a, title: editTitle, description: editDescription,
      price: parseInt(editPrice), category: editCategory,
      stock: parseInt(editStock), variants: editColors,
    } : a));
    setEditingId(null);
    toast.success("Produk berhasil diperbarui!");
  }

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  const avgRating = (reviews: Review[]) =>
    reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.8rem", fontWeight: 600,
    color: "var(--bark)", marginBottom: "0.45rem",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.75rem", borderRadius: "0.5rem",
    border: "1px solid var(--line)", background: "#fff", fontSize: "0.88rem",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  /* ── Color variant UI (reused in add & edit) ─────────────────────────── */

  function ColorVariantSection({
    list, setList,
    customName, setCustomName,
    customHex, setCustomHex,
    customLabel, setCustomLabel,
  }: {
    list: ColorVariant[]; setList: (v: ColorVariant[]) => void;
    customName: string; setCustomName: (v: string) => void;
    customHex: string; setCustomHex: (v: string) => void;
    customLabel: string; setCustomLabel: (v: string) => void;
  }) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.65rem" }}>
          <Palette size={15} color="var(--clay)" weight="fill" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--bark)" }}>Varian Warna / Glaze</span>
          <span style={{ fontSize: "0.7rem", color: "var(--bark-muted)", fontWeight: 500 }}>(opsional)</span>
        </div>

        {/* Preset chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.65rem" }}>
          {PRESET_COLORS.map(c => {
            const active = !!list.find(x => x.name === c.name);
            return (
              <button key={c.name} type="button" onClick={() => toggleColor(c, list, setList)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.38rem 0.7rem", borderRadius: "0.55rem",
                  border: `2px solid ${active ? "var(--clay)" : "var(--line)"}`,
                  background: active ? "rgba(184,92,60,0.06)" : "#fff",
                  cursor: "pointer", transition: "all 0.12s",
                }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: c.hex, border: "1.5px solid rgba(0,0,0,0.13)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--bark)" }}>{c.name}</span>
                {active && <Check size={11} color="var(--clay)" weight="bold" />}
              </button>
            );
          })}
        </div>

        {/* Custom color row */}
        <div style={{
          display: "grid", gridTemplateColumns: "44px 1fr 1fr auto", gap: "0.5rem",
          alignItems: "flex-end", background: "var(--surface)", borderRadius: "0.6rem",
          padding: "0.65rem", border: "1px solid var(--line)",
        }}>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--bark-muted)", marginBottom: "0.3rem" }}>Warna</p>
            <input type="color" value={customHex} onChange={e => setCustomHex(e.target.value)}
              style={{ width: 40, height: 34, border: "1.5px solid var(--line)", borderRadius: "0.4rem", cursor: "pointer", padding: 2 }} />
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--bark-muted)", marginBottom: "0.3rem" }}>Nama Warna *</p>
            <input type="text" value={customName} onChange={e => setCustomName(e.target.value)}
              placeholder="mis. Ocean Blue" style={{ ...inputStyle, fontSize: "0.8rem" }} />
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--bark-muted)", marginBottom: "0.3rem" }}>Keterangan Finish</p>
            <input type="text" value={customLabel} onChange={e => setCustomLabel(e.target.value)}
              placeholder="mis. Glossy" style={{ ...inputStyle, fontSize: "0.8rem" }} />
          </div>
          <button type="button"
            onClick={() => addCustomColor(list, setList, customName, customHex, customLabel, setCustomName, setCustomLabel, setCustomHex)}
            style={{
              padding: "0.55rem 0.9rem", borderRadius: "0.5rem",
              background: "var(--clay)", color: "#fff", border: "none",
              fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap",
            }}>
            + Tambah
          </button>
        </div>

        {/* Selected tags */}
        {list.length > 0 && (
          <div style={{ marginTop: "0.55rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {list.map(c => (
              <span key={c.name} style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                background: "#fff", border: "1px solid var(--line)",
                borderRadius: "999px", padding: "0.25rem 0.6rem 0.25rem 0.35rem",
                fontSize: "0.73rem", fontWeight: 600, color: "var(--bark)",
              }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: c.hex, border: "1px solid rgba(0,0,0,0.14)" }} />
                {c.name}
                <button type="button" onClick={() => removeColor(c.name, list, setList)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--bark-muted)", padding: 0, display: "flex", lineHeight: 1 }}>
                  <X size={10} weight="bold" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem" }}>Katalog Produk</h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>Kelola karya keramik yang dijual di tokomu.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.25rem", borderRadius: "0.75rem",
            background: "var(--clay)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
          }}>
          {showForm ? "Batal" : <><Plus size={18} weight="bold" /> Tambah Produk</>}
        </button>
      </header>

      {/* ── Add Form ──────────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: "#fff", padding: "1.75rem", borderRadius: "1rem",
          border: "1px solid var(--line)", marginBottom: "2rem",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem",
        }}>
          <h2 style={{ gridColumn: "1 / -1", fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", margin: 0 }}>
            Tambah Produk Baru
          </h2>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Nama Produk</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="Contoh: Vas Keramik Minimalis" style={inputStyle} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Deskripsi Singkat</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Harga (Rp)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Stok</label>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Kategori</label>
            <select value={category} onChange={e => setCategory(e.target.value)} required style={{ ...inputStyle, background: "#fff" }}>
              <option value="">Pilih Kategori</option>
              <option value="Dekorasi">Dekorasi</option>
              <option value="Peralatan Makan">Peralatan Makan</option>
              <option value="Souvenir">Souvenir</option>
              <option value="Pot">Pot Tanaman</option>
            </select>
          </div>

          {/* Foto Produk */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Foto Produk</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.65rem" }}>
              {(["upload", "url"] as const).map(src => (
                <button key={src} type="button" onClick={() => setImageSource(src)} style={{
                  padding: "0.38rem 0.9rem", borderRadius: "999px", border: "1px solid var(--line)",
                  cursor: "pointer", fontWeight: 600, fontSize: "0.78rem",
                  background: imageSource === src ? "var(--bark)" : "transparent",
                  color: imageSource === src ? "#fff" : "var(--bark-muted)",
                  display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                  {src === "upload" ? <><UploadSimple size={13} weight="bold" /> Upload</> : <><LinkIcon size={13} weight="bold" /> URL</>}
                </button>
              ))}
            </div>

            {imageSource === "upload" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
                style={{
                  border: `2px dashed ${isDragOver ? "var(--clay)" : "var(--line)"}`,
                  borderRadius: "0.75rem", padding: "1.5rem",
                  background: isDragOver ? "rgba(180,90,50,0.04)" : "var(--surface)",
                  textAlign: "center", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                }}>
                {imagePreview ? (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="preview" style={{ height: 120, maxWidth: "100%", objectFit: "contain", borderRadius: "0.5rem" }} />
                    <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(null); setImageUrl(""); }}
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
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileChange(e.target.files?.[0] ?? null)} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input type="url" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                  placeholder="https://..." style={inputStyle} />
                {imageUrl && (
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem", background: "var(--surface)", borderRadius: "0.5rem", border: "1px solid var(--line)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="preview" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "0.5rem" }} onError={e => (e.currentTarget.style.display = "none")} />
                    <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", wordBreak: "break-all" }}>{imageUrl}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Color Variants */}
          <div style={{ gridColumn: "1 / -1" }}>
            <ColorVariantSection
              list={selectedColors} setList={setSelectedColors}
              customName={customColorName} setCustomName={setCustomColorName}
              customHex={customColorHex} setCustomHex={setCustomColorHex}
              customLabel={customColorLabel} setCustomLabel={setCustomColorLabel}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={loading} style={{
              padding: "0.75rem 2rem", borderRadius: "0.75rem",
              background: "var(--bark)", color: "#fff", fontWeight: 700, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      )}

      {/* ── Product List ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {artworks.map(item => (
          <div key={item.id} style={{ display: "flex", flexDirection: "column" }}>
            {/* Card */}
            <div style={{
              background: "#fff",
              borderRadius: editingId === item.id ? "1rem 1rem 0 0" : "1rem",
              border: "1px solid var(--line)", display: "flex", overflow: "hidden",
            }}>
              <div style={{ width: 160, background: `url(${item.image_url}) center/cover no-repeat`, borderRight: "1px solid var(--line)", flexShrink: 0 }} />

              <div style={{ padding: "1.5rem", flex: 1, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--clay)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {item.category}
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", margin: "0.25rem 0 0.5rem" }}>{item.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--bark-muted)", marginBottom: "1rem" }}>{item.description}</p>

                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)" }}>Harga</p>
                      <p style={{ fontWeight: 700, color: "var(--bark)" }}>Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)" }}>Stok</p>
                      <p style={{ fontWeight: 700, color: "var(--bark)" }}>{item.stock} Unit</p>
                    </div>
                    {item.variants.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)" }}>Varian Warna</p>
                        <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem" }}>
                          {item.variants.slice(0, 5).map(v => (
                            <span key={v.name} title={v.name} style={{
                              width: 18, height: 18, borderRadius: "50%",
                              background: v.hex, border: "1.5px solid rgba(0,0,0,0.15)",
                            }} />
                          ))}
                          {item.variants.length > 5 && (
                            <span style={{ fontSize: "0.7rem", color: "var(--bark-muted)", alignSelf: "center", marginLeft: 2 }}>+{item.variants.length - 5}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {item.reviews.length > 0 && (() => {
                      const avg = avgRating(item.reviews);
                      return avg ? (
                        <div>
                          <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)" }}>Rating</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Star size={13} weight="fill" color="#f59e0b" />
                            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--bark)" }}>{avg}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--bark-muted)" }}>({item.reviews.length})</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "flex-start" }}>
                  <button onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)}
                    title={editingId === item.id ? "Tutup Edit" : "Edit Produk"}
                    style={{
                      padding: "0.5rem", borderRadius: "0.5rem",
                      border: editingId === item.id ? "1px solid var(--clay)" : "1px solid var(--line)",
                      background: editingId === item.id ? "var(--clay)" : "transparent",
                      color: editingId === item.id ? "#fff" : "var(--bark)", cursor: "pointer",
                    }}>
                    {editingId === item.id ? <X size={18} /> : <PencilSimple size={18} />}
                  </button>
                  <button onClick={() => handleDelete(item.id)} title="Hapus Produk" style={{
                    padding: "0.5rem", borderRadius: "0.5rem",
                    border: "1px solid var(--error, #f56565)", background: "transparent",
                    color: "var(--error, #e53e3e)", cursor: "pointer",
                  }}>
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
                padding: "1.25rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
              }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Nama Produk</label>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} required style={{ ...inputStyle, background: "#fff" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Deskripsi</label>
                  <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2}
                    style={{ ...inputStyle, background: "#fff", resize: "vertical" }} />
                </div>
                <div>
                  <label style={labelStyle}>Harga (Rp)</label>
                  <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} required style={{ ...inputStyle, background: "#fff" }} />
                </div>
                <div>
                  <label style={labelStyle}>Stok</label>
                  <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} required style={{ ...inputStyle, background: "#fff" }} />
                </div>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ ...inputStyle, background: "#fff" }}>
                    <option value="Dekorasi">Dekorasi</option>
                    <option value="Peralatan Makan">Peralatan Makan</option>
                    <option value="Souvenir">Souvenir</option>
                    <option value="Pot">Pot Tanaman</option>
                  </select>
                </div>

                {/* Color Variants in Edit */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <ColorVariantSection
                    list={editColors} setList={setEditColors}
                    customName={editCustomName} setCustomName={setEditCustomName}
                    customHex={editCustomHex} setCustomHex={setEditCustomHex}
                    customLabel={editCustomLabel} setCustomLabel={setEditCustomLabel}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button type="submit" style={{
                    padding: "0.6rem 1.25rem", borderRadius: "0.5rem",
                    background: "var(--bark)", color: "#fff", border: "none",
                    fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem",
                  }}>
                    <Check size={16} weight="bold" /> Simpan
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} style={{
                    padding: "0.6rem 1rem", borderRadius: "0.5rem",
                    background: "transparent", color: "var(--bark-muted)", border: "1px solid var(--line)", cursor: "pointer",
                  }}>Batal</button>
                </div>
              </form>
            )}
          </div>
        ))}

        {artworks.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", background: "#fff", borderRadius: "1rem", border: "1px dashed var(--line-strong)" }}>
            <p style={{ color: "var(--bark-muted)" }}>Belum ada produk di katalogmu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
