import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress hydration warnings from browser extensions
  reactStrictMode: true,
  // Allow cross-origin requests from the backend in dev
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
