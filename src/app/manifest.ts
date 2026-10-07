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
  };
}
