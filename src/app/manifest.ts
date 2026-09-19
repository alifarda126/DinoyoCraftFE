import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DinoyoCraft - Keramik Dinoyo",
    short_name: "DinoyoCraft",
    description: "Platform reservasi dan penjualan keramik kampung Dinoyo",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-1.png",
        sizes: "540x720",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-2.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
    categories: ["lifestyle", "shopping"],
    shortcuts: [
      {
        name: "Reservasi",
        short_name: "Reservasi",
        description: "Pesan kelas keramik",
        url: "/customer/reservasi",
        icons: [{ src: "/icon-96.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Katalog",
        short_name: "Katalog",
        description: "Lihat karya keramik",
        url: "/customer/katalog",
        icons: [{ src: "/icon-96.png", sizes: "96x96", type: "image/png" }],
      },
    ],
  };
}
