/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages doesn't support next/image optimizer
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
