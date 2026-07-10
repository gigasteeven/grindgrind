/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages doesn't support next/image optimizer
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0x4AAAAAADxJ3bq8rhJWsLZZ",
  },
};

module.exports = nextConfig;
