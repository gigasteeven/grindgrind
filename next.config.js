/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages doesn't support next/image optimizer
  images: {
    unoptimized: true,
  },
  // Required for Cloudflare Pages
  experimental: {
    runtime: "nodejs",
  },
};

module.exports = nextConfig;
