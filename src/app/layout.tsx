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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DinoyoCraft — Keramik Kampung Dinoyo, Malang",
    template: "%s | DinoyoCraft",
  },
  description:
    "Platform resmi Kampung Keramik Dinoyo, Malang. Belanja kerajinan keramik lokal asli pengrajin, reservasi workshop keramik, dan pesan suvenir kustom.",
  keywords: [
    "DinoyoCraft",
    "Kampung Keramik Dinoyo",
    "Keramik Dinoyo Malang",
    "Kerajinan Keramik Malang",
    "Suvenir Keramik Kustom",
    "Workshop Keramik Malang",
    "Pengrajin Keramik Dinoyo",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "DinoyoCraft",
    title: "DinoyoCraft — Keramik Kampung Dinoyo, Malang",
    description:
      "Belanja kerajinan keramik lokal asli pengrajin, reservasi kelas keramik, dan pesan suvenir kustom dari Kampung Keramik Dinoyo, Malang.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DinoyoCraft — Keramik Kampung Dinoyo, Malang",
    description:
      "Platform resmi kerajinan keramik asli pengrajin Kampung Keramik Dinoyo, Kota Malang.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
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



// Trigger hot reload 8
