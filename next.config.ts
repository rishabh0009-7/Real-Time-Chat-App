import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // helpful for development
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
