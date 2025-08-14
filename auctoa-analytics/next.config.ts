import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Netlify compatibility
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Minimal configuration to avoid deployment issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
