"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Image as ImageIcon, Plus, Trash } from "@phosphor-icons/react";
import Link from "next/link";

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

export default function AdminCatalogPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdmin();
    loadArtworks();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      router.push("/dashboard");
    }
  }

  async function loadArtworks() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("artworks")
      .select(`
        *,
        artisan:profiles!artworks_artisan_id_fkey (full_name)
      `)
      .eq("artisan_id", user?.id)
      .order("created_at", { ascending: false });
    if (data) setArtworks(data as any);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Belum login");

      const { error } = await supabase.from("artworks").insert({
        artisan_id: user.id,
        title,
        description,
        price: parseFloat(price),
        category,
        image_url: imageUrl,
      });

      if (error) throw error;
      toast.success("Karya berhasil ditambahkan");
      setShowForm(false);
      loadArtworks();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function deleteArtwork(id: string) {
    if (!confirm("Hapus karya ini?")) return;
    const { error } = await supabase.from("artworks").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus karya");
      return;
    }
    toast.success("Karya dihapus");
    loadArtworks();
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              &larr; Admin
            </Link>
            <h1 className="text-xl font-semibold">Manajemen Katalog</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Karya
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-lg">Tambah Karya Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Vas, Cangkir, Hiasan, dll"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Harga (Rp)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL Gambar</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden"
            >
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{artwork.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                  {artwork.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    Rp {artwork.price.toLocaleString("id-ID")}
                  </span>
                  <button
                    onClick={() => deleteArtwork(artwork.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
