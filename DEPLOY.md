# Cloudflare Pages Deployment

## Build Settings

- **Framework preset**: Next.js
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`
- **Node version**: 18+

## Environment Variables

Set these in Cloudflare Pages dashboard → Settings → Environment Variables:

```
UPSTASH_REDIS_REST_URL=https://busy-macaque-78789.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAATPFAAIgcDI0MzQ4MGRlZjA1Y2I0Njg4ODY2ZWI0M2MyNDBmODJmYQ
JWT_SECRET=challengegrind_secret_key_2026
NEXT_PUBLIC_TURNSTILE_SITE_KEY=YOUR_CLOUDFLARE_SITE_KEY
TURNSTILE_SECRET_KEY=YOUR_CLOUDFLARE_SECRET_KEY
```

## Compatibility Flags

- `nodejs_compat` — required for bcryptjs and jsonwebtoken

## Local Development

```bash
npm install
npm run dev
```

## Deploy

### Option 1: Cloudflare Dashboard
1. Go to Cloudflare Pages → Create a project → Connect GitHub repo
2. Set build command: `npx @cloudflare/next-on-pages`
3. Set output directory: `.vercel/output/static`
4. Add environment variables
5. Deploy

### Option 2: Wrangler CLI
```bash
npm install
npm run pages:build
npm run pages:deploy
```

## Notes

- `next/image` is disabled (unoptimized) — Cloudflare Pages doesn't support the image optimizer
- All API routes use `export const runtime = "edge"` for Cloudflare Workers compatibility
- `bcryptjs` (pure JS) is used instead of `bcrypt` (native) for edge compatibility
- Upstash Redis works perfectly on Cloudflare edge
