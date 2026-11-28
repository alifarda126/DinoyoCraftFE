import type { Metadata } from "next";
import RegisterForm from "./components/RegisterForm";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://dinoyocraft.my.id"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Register & Daftar Mitra",
  description:
    "Daftar menjadi Mitra Pengrajin resmi di DinoyoCraft. Pasarkan karya kerajinan keramik asli Kampung Keramik Dinoyo, Malang dan kelola toko online Anda.",
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Register & Daftar Mitra | DinoyoCraft",
    description:
      "Daftarkan toko dan karya keramik Anda sebagai Mitra resmi di platform DinoyoCraft.",
    url: `${SITE_URL}/register`,
    siteName: "DinoyoCraft",
  },
};

const registerBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "DinoyoCraft", item: `${SITE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Register & Daftar Mitra",
      item: `${SITE_URL}/register`,
    },
  ],
};

export default function RegisterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(registerBreadcrumbJsonLd) }}
      />
      <RegisterForm />
    </>
  );
}
