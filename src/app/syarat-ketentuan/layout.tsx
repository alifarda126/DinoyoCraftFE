import type { Metadata } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://dinoyocraft.my.id"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan resmi layanan transaksi keramik, penggunaan aplikasi mobile, dan kemitraan pengrajin di platform DinoyoCraft.",
  alternates: {
    canonical: "/syarat-ketentuan",
  },
  openGraph: {
    title: "Syarat & Ketentuan | DinoyoCraft",
    description:
      "Ketentuan resmi penggunaan layanan marketplace, aplikasi mobile, dan kemitraan DinoyoCraft.",
    url: `${SITE_URL}/syarat-ketentuan`,
    siteName: "DinoyoCraft",
  },
};

export default function SyaratKetentuanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
