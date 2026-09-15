"use client";

import { createClient } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Heart, ShoppingBag } from "@phosphor-icons/react";
import Link from "next/link";

type ArtworkDetail = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  artisan: { full_name: string };
};

export default function ArtworkDetailPage() {
  const params = useParams();
  const artworkId = params.id as string;
  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadArtwork();
  }, []);

  async function loadArtwork() {
    const { data } = await supabase
      .from("artworks")
      .select(`
        *,
        artisan:profiles!artworks_artisan_id_fkey (
          full_name
        )
      `)
      .eq("id", artworkId)
      .single();

    if (data) setArtwork(data as any);
  }

  async function handleSubmitCustom(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak login");

      const { error } = await supabase.from("custom_orders").insert({
        user_id: user.id,
        artisan_id: artwork?.id,
        title: customTitle,
        description: customDesc,
        budget: parseFloat(customBudget),
        status: "submitted",
      });

      if (error) throw error;
      toast.success("Pesanan kustom berhasil dikirim");
      setShowCustomForm(false);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (!artwork) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/katalog" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">{artwork.title}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{artwork.category}</span>
              <h2 className="text-2xl font-semibold tracking-tight mt-1">{artwork.title}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">{artwork.description}</p>
            </div>

            <div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Pengrajin</span>
              <p className="font-medium mt-1">{artwork.artisan?.full_name}</p>
            </div>

            <div className="text-2xl font-semibold">
              Rp {artwork.price.toLocaleString("id-ID")}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Ajukan Pesanan Kustom
              </button>
            </div>
          </div>
        </div>

        {showCustomForm && (
          <form
            onSubmit={handleSubmitCustom}
            className="mt-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-lg">Pesanan Kustom</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Judul Pesanan</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deskripsi</label>
              <textarea
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Budget (Rp)</label>
              <input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="flex-1 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {loading ? "Mengirim..." : "Kirim"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}