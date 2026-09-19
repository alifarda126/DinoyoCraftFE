"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
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

export default function KatalogPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  const loadArtworks = async () => {
    const { data } = await supabase
      .from("artworks")
      .select(`
        *,
        artisan:profiles!artworks_artisan_id_fkey (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (data) setArtworks(data as Artwork[]);
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  const categories = Array.from(
    new Set(artworks.map((a) => a.category))
  );

  const filtered = filter === "all" 
    ? artworks 
    : artworks.filter((a) => a.category === filter);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
       <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
           <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
             <span>←</span>
           </Link>
           <h1 className="text-xl font-semibold">Katalog Keramik</h1>
         </div>
       </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {categories.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === "all"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === cat
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((artwork) => (
            <Link
              key={artwork.id}
              href={`/dashboard/katalog/${artwork.id}`}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
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
                  <span className="text-xs text-zinc-500">
                    {artwork.artisan?.full_name}
                  </span>
                  <span className="font-semibold">
                    Rp {artwork.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}