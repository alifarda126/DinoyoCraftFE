"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MapPin, NavigationArrow, Buildings, Users as UsersIcon } from "@phosphor-icons/react";
import Link from "next/link";

type Marker = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  artisan_count: number;
  color: string;
};

const MARKERS: Marker[] = [
  {
    id: "1",
    name: "Gang Keramik Utama",
    description: "Pintu masuk utama kampung keramik — titik kumpul rombongan",
    latitude: -7.9666,
    longitude: 112.6326,
    artisan_count: 8,
    color: "#e8a33d",
  },
  {
    id: "2",
    name: "Bengkel Pak Harto",
    description: "Pengrajin tembikar tradisional generasi ke-3, spesialis gerabah",
    latitude: -7.9668,
    longitude: 112.6328,
    artisan_count: 1,
    color: "#60a5fa",
  },
  {
    id: "3",
    name: "Studio Keramik Modern",
    description: "Kelas dan workshop keramik — cocok untuk rombongan dan anak-anak",
    latitude: -7.967,
    longitude: 112.6324,
    artisan_count: 3,
    color: "#34d399",
  },
  {
    id: "4",
    name: "Galeri & Toko Oleh-oleh",
    description: "Pusat penjualan keramik jadi — dari gelas, vas, hingga hiasan dinding",
    latitude: -7.9664,
    longitude: 112.6330,
    artisan_count: 5,
    color: "#f87171",
  },
];

export default function PetaPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const [selected, setSelected] = useState<Marker | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon paths for webpack/next.js bundling
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [-7.9668, 112.6327],
        zoom: 17,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // OpenStreetMap tiles (free, no API key needed)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add custom markers for each location
      MARKERS.forEach((marker) => {
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: ${marker.color};
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            ">
              <div style="transform: rotate(45deg); display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
                <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 256 256' fill='white'>
                  <path d='M128,16a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,16Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,192Zm-8-80V88a8,8,0,0,1,16,0v24a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,148Z'/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
          className: "",
        });

        const popup = L.popup({
          maxWidth: 260,
          className: "leaflet-popup-dinoyo",
        }).setContent(`
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 0;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111;">${marker.name}</div>
            <div style="font-size: 12px; color: #555; margin-bottom: 8px; line-height: 1.4;">${marker.description}</div>
            <div style="display:flex; align-items:center; gap:6px; font-size:12px; color:#888; margin-bottom: 10px;">
              <span>👤 ${marker.artisan_count} pengrajin</span>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}"
               target="_blank"
               rel="noopener noreferrer"
               style="
                 display: inline-block;
                 padding: 6px 14px;
                 background: #111;
                 color: white;
                 border-radius: 8px;
                 text-decoration: none;
                 font-size: 12px;
                 font-weight: 600;
               "
            >Navigasi ke sini →</a>
          </div>
        `);

        L.marker([marker.latitude, marker.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popup)
          .on("click", () => setSelected(marker));
      });

      leafletMapRef.current = map;
    }).catch(() => {
      setMapError(true);
    });

    // Cleanup
    return () => {
      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleSelectMarker = (marker: Marker) => {
    setSelected(marker);
    // Pan map to marker
    if (leafletMapRef.current) {
      const map = leafletMapRef.current as { setView: (latlng: [number, number], zoom: number) => void };
      map.setView([marker.latitude, marker.longitude], 18);
    }
  };

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
        <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-semibold">Peta Gang Keramik</h1>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Map Container */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              {mapError ? (
                /* Fallback jika Leaflet gagal load */
                <div className="aspect-[4/3] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 p-8">
                  <MapPin className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-medium">Peta tidak tersedia</p>
                  <p className="text-sm mt-1 mb-4">Cek koneksi internet Anda</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${MARKERS[0].latitude},${MARKERS[0].longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Buka di Google Maps
                  </a>
                </div>
              ) : (
                <div
                  ref={mapRef}
                  className="w-full"
                  style={{ height: "420px" }}
                />
              )}
            </div>

            {/* Sidebar — daftar lokasi */}
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Lokasi di Gang Keramik</h3>
              {MARKERS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMarker(m)}
                  className={`w-full text-left p-4 border rounded-xl transition-colors ${
                    selected?.id === m.id
                      ? "border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: m.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 leading-snug">{m.name}</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {m.description}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          {m.artisan_count} pengrajin
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {/* Navigasi ke kampung keramik */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${MARKERS[0].latitude},${MARKERS[0].longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <NavigationArrow className="w-4 h-4" />
                Navigasi ke Kampung Keramik
              </a>

              {/* Alamat */}
              <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <Buildings className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Kampung Keramik Dinoyo</p>
                    <p className="mt-1">Jl. Dinoyo, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}