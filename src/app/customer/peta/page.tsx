"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  NavigationArrow,
  Buildings,
  Users as UsersIcon,
} from "@phosphor-icons/react";
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
    color: "#B85C3C",
  },
  {
    id: "2",
    name: "Bengkel Pak Harto",
    description: "Pengrajin tembikar tradisional generasi ke-3, spesialis gerabah",
    latitude: -7.9668,
    longitude: 112.6328,
    artisan_count: 1,
    color: "#9A7D5C",
  },
  {
    id: "3",
    name: "Studio Keramik Modern",
    description: "Kelas dan workshop keramik — cocok untuk rombongan dan anak-anak",
    latitude: -7.967,
    longitude: 112.6324,
    artisan_count: 3,
    color: "#6B8E7A",
  },
  {
    id: "4",
    name: "Galeri & Toko Oleh-oleh",
    description: "Pusat penjualan keramik jadi — dari gelas, vas, hingga hiasan dinding",
    latitude: -7.9664,
    longitude: 112.633,
    artisan_count: 5,
    color: "#5C7A8E",
  },
];

export default function PetaPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const [selected, setSelected] = useState<Marker | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

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
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111827;">${marker.name}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px; line-height: 1.5;">${marker.description}</div>
            <div style="display:flex; align-items:center; gap:6px; font-size:12px; color:#9CA3AF; margin-bottom: 10px;">
              <span>${marker.artisan_count} pengrajin</span>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}"
               target="_blank"
               rel="noopener noreferrer"
               style="
                 display: inline-block;
                 padding: 6px 14px;
                 background: #B85C3C;
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
    if (leafletMapRef.current) {
      const map = leafletMapRef.current as { setView: (latlng: [number, number], zoom: number) => void };
      map.setView([marker.latitude, marker.longitude], 18);
    }
  };

  return (
    <>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{
                fontSize: "0.72rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--clay)", marginBottom: "0.4rem",
              }}>
                Navigasi Interaktif
              </p>
              <h1 style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800, letterSpacing: "-0.025em",
                color: "var(--bark)", lineHeight: 1.1,
              }}>
                Peta Gang Keramik
              </h1>
              <p style={{ marginTop: "0.4rem", color: "var(--bark-muted)", fontSize: "0.9rem" }}>
                Jelajahi dan navigasi ke bengkel pengrajin di Kampung Dinoyo.
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${MARKERS[0].latitude},${MARKERS[0].longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.6rem 1.25rem",
                borderRadius: "9999px",
                background: "var(--clay)",
                color: "#fff",
                fontSize: "0.85rem", fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.2s, transform 0.15s",
                boxShadow: "0 4px 12px rgba(184,92,60,0.25)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--clay-dark)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--clay)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <NavigationArrow size={16} weight="fill" />
              Navigasi ke Kampung Keramik
            </a>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem" }} className="peta-grid">

          {/* Map container */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid var(--line)",
              borderRadius: "1.5rem",
              overflow: "hidden",
            }}
          >
            {mapError ? (
              <div style={{
                aspectRatio: "4/3",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                color: "var(--bark-muted)", padding: "3rem",
                textAlign: "center",
              }}>
                <MapPin size={40} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
                <p style={{ fontWeight: 700, color: "var(--bark)", marginBottom: "0.35rem" }}>Peta tidak tersedia</p>
                <p style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}>Cek koneksi internet Anda</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${MARKERS[0].latitude},${MARKERS[0].longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-clay"
                >
                  Buka di Google Maps
                </a>
              </div>
            ) : (
              <div ref={mapRef} className="w-full" style={{ height: "480px" }} />
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{
              fontSize: "0.85rem", fontWeight: 700,
              color: "var(--bark)", letterSpacing: "-0.01em",
            }}>
              Lokasi di Gang Keramik
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {MARKERS.map((m) => {
                const isSelected = selected?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMarker(m)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "1rem 1.125rem",
                      borderRadius: "1rem",
                      border: `1.5px solid ${isSelected ? m.color : "var(--line-strong)"}`,
                      background: isSelected ? `${m.color}08` : "#fff",
                      cursor: "pointer",
                      transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s",
                      boxShadow: isSelected ? `0 0 0 3px ${m.color}20` : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.borderColor = m.color;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px ${m.color}18`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      <span
                        style={{
                          marginTop: "0.2rem",
                          width: 10, height: 10,
                          borderRadius: "9999px",
                          background: m.color,
                          flexShrink: 0,
                          boxShadow: `0 0 0 2px ${m.color}30`,
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{
                          fontWeight: 700, fontSize: "0.85rem",
                          color: isSelected ? m.color : "var(--bark)",
                          lineHeight: 1.3, transition: "color 0.2s",
                        }}>
                          {m.name}
                        </p>
                        <p style={{
                          marginTop: "0.25rem",
                          fontSize: "0.75rem", color: "var(--bark-muted)",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {m.description}
                        </p>
                        <div style={{
                          display: "flex", alignItems: "center", gap: "0.4rem",
                          marginTop: "0.5rem",
                          fontSize: "0.72rem", color: "var(--bark-muted)",
                        }}>
                          <UsersIcon size={12} />
                          <span>{m.artisan_count} pengrajin</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Address card */}
            <div
              style={{
                padding: "1.125rem",
                borderRadius: "1rem",
                border: "1.5px solid var(--line)",
                background: "var(--surface-elevated)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                <Buildings size={16} style={{ color: "var(--clay)", flexShrink: 0, marginTop: "0.1rem" }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--bark)", marginBottom: "0.25rem" }}>
                    Kampung Keramik Dinoyo
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", lineHeight: 1.55 }}>
                    Jl. Dinoyo, Kec. Lowokwaru,<br />
                    Kota Malang, Jawa Timur 65145
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .peta-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
