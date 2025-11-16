/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // **ลบบล็อกนี้**
  // experimental: {
  //   appDir: true,
  // },
};
module.exports = nextConfig;