import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Disable source maps in development to reduce 404 requests
  productionBrowserSourceMaps: false,
  // Optimize dev server performance
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false; // Disable source maps in dev for better performance
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bwrtdemuvfxxltpchqup.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
