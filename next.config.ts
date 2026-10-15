import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/auth/login",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/auth/register",
        destination: "/register",
        permanent: true,
      },
      {
        source: "/auth/lupa-kata-sandi",
        destination: "/lupa-kata-sandi",
        permanent: true,
      },
      {
        source: "/auth",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
