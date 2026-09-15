"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin } from "@phosphor-icons/react";
import Link from "next/link";

type Marker = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  artisan_count: number;
};

export default function PetaPage() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selected, setSelected] = useState<Marker | null>(null);

  useEffect(() => {
    fetchMarkers();
  }, []);

  async function fetchMarkers() {
    // Dinoyo alley markers (hardcoded default positions)
    setMarkers([
      {
        id: "1",
        name: "Gang Keramik Utama",
        description: "Pintu masuk utama kampung keramik",
        latitude: -7.9666,
        longitude: 112.6326,
        artisan_count: 8,
      },
      {
        id: "2",
        name: "Bengkel Pak Harto",
        description: "Pengrajin tembikar tradisional",
        latitude: -7.9668,
        longitude: 112.6328,
        artisan_count: 1,
      },
      {
        id: "3",
        name: "Studio Keramik Modern",
        description: "Kelas dan workshop keramik",
        latitude: -7.967,
        longitude: 112.6324,
        artisan_count: 3,
      },
    ]);
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">Peta Gang</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 relative flex items-center justify-center">
              {/* Placeholder for map - in production use Leaflet/Mapbox */}
              <div className="text-center text-zinc-400 dark:text-zinc-500 p-8">
                <MapPin className="w-12 h-12 mx-auto mb-3" />
                <p className="font-medium">Peta Interaktif</p>
                <p className="text-sm mt-1">
                  Integrasikan Leaflet/Mapbox untuk peta interaktif
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${markers[0]?.latitude},${markers[0]?.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Lokasi Bengkel</h3>
            {markers.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(selected?.id === m.id ? null : m)}
                className={`w-full text-left p-4 border rounded-xl transition-colors ${
                  selected?.id === m.id
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                }`}
              >
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {m.description}
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  {m.artisan_count} pengrajin
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}