import type { Metadata } from "next";
import LoginForm from "./components/LoginForm";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://dinoyocraft.my.id"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Login",
  description:
    "Masuk ke portal resmi akun Mitra Pengrajin dan Admin DinoyoCraft untuk mengelola katalog keramik, pesanan pelanggan, live chat, serta laporan penjualan.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Login | DinoyoCraft",
    description:
      "Masuk ke portal resmi akun Mitra Pengrajin dan Admin DinoyoCraft.",
    url: `${SITE_URL}/login`,
    siteName: "DinoyoCraft",
  },
};

const loginBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "DinoyoCraft", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Login", item: `${SITE_URL}/login` },
  ],
};

export default function LoginPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(loginBreadcrumbJsonLd) }}
      />
      <LoginForm />
    </>
  );
}
