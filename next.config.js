/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  // Vercel environment variables
  env: {
    GITHUB_REPO_OWNER: process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'fantrove',
    GITHUB_REPO_NAME: process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'fantrove-data',
  },

  // API route configuration for Vercel
  experimental: {
    isrMemoryCacheSize: 52 * 1024 * 1024,
  },

  // Optimize for Vercel
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    unoptimized: false,
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [];
  },

  // Rewrites
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;