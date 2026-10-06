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

export const metadata: Metadata = {
  title: "DinoyoCraft — Keramik Kampung Dinoyo, Malang",
  description:
    "Reservasi kelas keramik, pesan suvenir kustom, dan jelajahi gang bengkel Kampung Keramik Dinoyo, Lowokwaru, Kota Malang.",
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
