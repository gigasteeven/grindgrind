# Cloudflare Pages Deployment — Full Guide

## Option 1: Cloudflare Dashboard (recommended)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select repository: `gigasteeven/grindgrind`
3. Set build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
4. Go to **Settings** → **Environment Variables** and add:

| Variable | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | `https://busy-macaque-78789.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `gQAAAAAAATPFAAIgcDI0MzQ4MGRlZjA1Y2I0Njg4ODY2ZWI0M2MyNDBmODJmYQ` |
| `JWT_SECRET` | `challengegrind_secret_key_2026` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` (test key, replace later) |
| `TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000AA` (test key, replace later) |

5. Go to **Settings** → **Functions** → **Compatibility flags** → add `nodejs_compat`
6. Click **Save and Deploy**

## Option 2: Wrangler CLI

```bash
# 1. Clone and install
git clone https://github.com/gigasteeven/grindgrind.git
cd grindgrind
npm install --legacy-peer-deps

# 2. Login to Cloudflare (opens browser)
npx wrangler login

# 3. Set environment variables (run each, paste value, press Enter)
npx wrangler pages secret put UPSTASH_REDIS_REST_URL --project-name challengegrind
# paste: https://busy-macaque-78789.upstash.io

npx wrangler pages secret put UPSTASH_REDIS_REST_TOKEN --project-name challengegrind
# paste: gQAAAAAAATPFAAIgcDI0MzQ4MGRlZjA1Y2I0Njg4ODY2ZWI0M2MyNDBmODJmYQ

npx wrangler pages secret put JWT_SECRET --project-name challengegrind
# paste: challengegrind_secret_key_2026

npx wrangler pages secret put NEXT_PUBLIC_TURNSTILE_SITE_KEY --project-name challengegrind
# paste: 1x00000000000000000000AA

npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name challengegrind
# paste: 1x0000000000000000000000000000000AA

# 4. Build for Cloudflare Pages
npx @cloudflare/next-on-pages

# 5. Deploy
npx wrangler pages deploy .vercel/output/static --project-name challengegrind
```

## After Deploy

- Site will be at `https://challengegrind.pages.dev`
- To use a custom domain: Cloudflare Dashboard → Pages → challengegrind → Custom domains

## Notes

- `jsonwebtoken` replaced with `jose` (edge-compatible JWT library)
- `bcryptjs` (pure JS) works on edge
- `next/image` disabled (unoptimized) — CF Pages doesn't support image optimizer
- All API routes use `export const runtime = "edge"`
- `.npmrc` has `legacy-peer-deps=true` for dependency resolution
