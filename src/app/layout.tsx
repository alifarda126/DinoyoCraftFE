import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://dinoyocraft.my.id"
).replace(/\/+$/, "");

const DEFAULT_TITLE = "DinoyoCraft | Keramik Kampung Dinoyo, Malang";
const DEFAULT_DESCRIPTION =
  "DinoyoCraft adalah platform resmi Kampung Keramik Dinoyo, Malang. Belanja kerajinan keramik lokal asli pengrajin, reservasi workshop keramik, unduh aplikasi mobile DinoyoCraft, dan bergabung sebagai Mitra Pengrajin.";

const structuredDataGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DinoyoCraft",
      legalName: "DinoyoCraft",
      alternateName: [
        "dinoyocraft",
        "Dinoyo Craft",
        "DinoyoCraft Malang",
        "Mitra DinoyoCraft",
        "Aplikasi DinoyoCraft",
      ],
      disambiguatingDescription:
        "DinoyoCraft (dinoyocraft.my.id) adalah platform e-commerce resmi, aplikasi mobile belanja keramik, layanan reservasi workshop tembikar, dan portal kemitraan pengrajin dari sentra Kampung Keramik Dinoyo, Kota Malang, Jawa Timur, Indonesia.",
      description: DEFAULT_DESCRIPTION,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/icon-512.png`,
        contentUrl: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
        caption: "DinoyoCraft",
      },
      image: `${SITE_URL}/og-image.png`,
      email: "support@dinoyocraft.my.id",
      telephone: "+62-812-3456-7890",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Jl. Dinoyo, Kec. Lowokwaru",
        addressLocality: "Kota Malang",
        addressRegion: "Jawa Timur",
        postalCode: "65145",
        addressCountry: "ID",
      },
      areaServed: {
        "@type": "Country",
        name: "Indonesia",
      },
      knowsAbout: [
        "Kerajinan Keramik Dinoyo",
        "Kampung Keramik Dinoyo Malang",
        "Tembikar & Porselen Handmade",
        "Workshop Keramik Malang",
        "Suvenir Keramik Kustom",
        "Program Kemitraan Pengrajin Keramik",
      ],
      sameAs: ["https://github.com/alifarda126/DinoyoCraftApp"],
    },
    {
      "@type": "Brand",
      "@id": `${SITE_URL}/#brand`,
      name: "DinoyoCraft",
      alternateName: ["dinoyocraft", "Dinoyo Craft"],
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon-512.png`,
      description:
        "Brand dan platform digital resmi sentra kerajinan keramik Kampung Keramik Dinoyo, Kota Malang.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "DinoyoCraft",
      alternateName: [
        "dinoyocraft",
        "Dinoyo Craft",
        "dinoyocraft.my.id",
        DEFAULT_TITLE,
      ],
      description: DEFAULT_DESCRIPTION,
      inLanguage: "id-ID",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "MobileApplication",
      "@id": `${SITE_URL}/#mobileapp`,
      name: "DinoyoCraft",
      alternateName: "Aplikasi DinoyoCraft",
      operatingSystem: "Android",
      applicationCategory: "ShoppingApplication",
      softwareVersion: "1.0.0",
      url: `${SITE_URL}/#download-aplikasi`,
      downloadUrl:
        "https://github.com/alifarda126/DinoyoCraftApp/releases/download/v1.0.0/DinoyoCraft-v1.0.0-arm64-v8a.apk",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
      },
      description:
        "Aplikasi resmi DinoyoCraft untuk belanja keramik asli pengrajin Kampung Keramik Dinoyo Malang, konsultasi ClayBot AI & live chat toko, reservasi workshop keramik, serta pembayaran instan via QRIS, Virtual Account, dan E-Wallet.",
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#sitenav`,
      name: "Navigasi Utama DinoyoCraft",
      itemListElement: [
        {
          "@type": "SiteNavigationElement",
          position: 1,
          name: "Login",
          description:
            "Masuk ke portal resmi Mitra & Admin DinoyoCraft untuk mengelola toko keramik dan pesanan.",
          url: `${SITE_URL}/login`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 2,
          name: "Register Mitra",
          description:
            "Daftar menjadi Mitra Pengrajin resmi DinoyoCraft dan pasarkan karya keramik Kampung Dinoyo.",
          url: `${SITE_URL}/register`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 3,
          name: "Download Aplikasi",
          description:
            "Unduh aplikasi mobile Android DinoyoCraft resmi (ARM64, ARMv7, x86_64) untuk belanja keramik dan reservasi workshop.",
          url: `${SITE_URL}/#download-aplikasi`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 4,
          name: "Lupa Kata Sandi",
          description:
            "Pulihkan akses dan atur ulang kata sandi akun DinoyoCraft melalui verifikasi OTP email.",
          url: `${SITE_URL}/lupa-kata-sandi`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 5,
          name: "Syarat & Ketentuan",
          description:
            "Ketentuan resmi penggunaan layanan marketplace, aplikasi mobile, dan kemitraan DinoyoCraft.",
          url: `${SITE_URL}/syarat-ketentuan`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 6,
          name: "Kebijakan Privasi",
          description:
            "Kebijakan perlindungan data pribadi pelanggan dan mitra pengrajin di platform DinoyoCraft.",
          url: `${SITE_URL}/kebijakan-privasi`,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "DinoyoCraft",
  title: {
    default: DEFAULT_TITLE,
    template: "%s | DinoyoCraft",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "DinoyoCraft",
    "dinoyocraft",
    "dinoyocraft.my.id",
    "Dinoyo Craft",
    "Aplikasi DinoyoCraft",
    "Mitra DinoyoCraft",
    "Login DinoyoCraft",
    "Register DinoyoCraft",
    "Daftar Mitra DinoyoCraft",
    "Kampung Keramik Dinoyo",
    "Keramik Dinoyo Malang",
    "Kerajinan Keramik Malang",
    "Suvenir Keramik Kustom",
    "Workshop Keramik Malang",
    "Pengrajin Keramik Dinoyo",
  ],
  authors: [{ name: "DinoyoCraft", url: SITE_URL }],
  creator: "DinoyoCraft",
  publisher: "DinoyoCraft",
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "DinoyoCraft",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: DEFAULT_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description:
      "DinoyoCraft | Platform resmi kerajinan keramik asli pengrajin Kampung Keramik Dinoyo, Kota Malang.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DinoyoCraft",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataGraph),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Grain noise texture — ceramic/earth surface depth on every page */}
        <div className="grain-overlay" aria-hidden="true" />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#2E1A0E",
              border: "1.5px solid rgba(61,43,31,0.12)",
              borderRadius: "0.875rem",
              boxShadow: "0 4px 24px rgba(61,43,31,0.12), 0 1px 4px rgba(0,0,0,0.06)",
            },
          }}
        />
      </body>
    </html>
  );
}
