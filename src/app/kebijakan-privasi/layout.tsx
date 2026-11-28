import type { Metadata } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://dinoyocraft.my.id"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi resmi perlindungan data pribadi pelanggan dan mitra pengrajin keramik di ekosistem DinoyoCraft.",
  alternates: {
    canonical: "/kebijakan-privasi",
  },
  openGraph: {
    title: "Kebijakan Privasi | DinoyoCraft",
    description:
      "Kebijakan perlindungan privasi dan keamanan data pengguna di platform DinoyoCraft.",
    url: `${SITE_URL}/kebijakan-privasi`,
    siteName: "DinoyoCraft",
  },
};

export default function KebijakanPrivasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
