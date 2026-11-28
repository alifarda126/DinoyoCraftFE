import type { Metadata } from "next";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://dinoyocraft.my.id"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Lupa Kata Sandi",
  description:
    "Pulihkan akses dan atur ulang kata sandi akun DinoyoCraft Anda secara aman melalui kode verifikasi OTP email.",
  alternates: {
    canonical: "/lupa-kata-sandi",
  },
  openGraph: {
    title: "Lupa Kata Sandi | DinoyoCraft",
    description: "Atur ulang kata sandi akun DinoyoCraft Anda secara aman.",
    url: `${SITE_URL}/lupa-kata-sandi`,
    siteName: "DinoyoCraft",
  },
};

const forgotBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "DinoyoCraft", item: `${SITE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Lupa Kata Sandi",
      item: `${SITE_URL}/lupa-kata-sandi`,
    },
  ],
};

export default function LupaKataSandiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(forgotBreadcrumbJsonLd) }}
      />
      <ForgotPasswordForm />
    </>
  );
}
