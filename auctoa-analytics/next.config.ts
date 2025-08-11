import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations for analytics dashboard */
  
  // Enable experimental features that enhance performance
  experimental: {
    // Enable optimized package imports for better tree shaking
    optimizePackageImports: ['lucide-react', 'recharts', 'chart.js'],
  },

  // Image optimization for dashboard assets
  images: {
    formats: ['image/webp', 'image/avif'],
    // Add domains for external images if needed (analytics providers, etc.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https', 
        hostname: '**.supabase.co',
      },
    ],
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle analysis (helpful for optimizing dashboard performance)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      return config;
    },
  }),
};

export default nextConfig;
