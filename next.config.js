/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ];
  },

  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/data/:path*',
          destination: `${process.env.NEXT_PUBLIC_FANTROVE_DATA_URL}/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;