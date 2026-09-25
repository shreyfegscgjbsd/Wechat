# Deployment Guide

## Netlify

### Prerequisites
- Netlify account (https://app.netlify.com)
- GitHub account (for repo linking)
- Clerk account (https://clerk.com)
- PostgreSQL database (Neon.tech recommended — free tier works)
- Clerk secret key (see below)

### Step 1 — Deploy the repo

1. Go to https://app.netlify.com → **Add new site** → **Import an existing project**
2. Connect your GitHub account and select `shreyfegscgjbsd/Wechat`
3. Netlify will detect the `netlify.toml` automatically

### Step 2 — Configure environment variables in Netlify Dashboard

Go to **Site settings → Environment variables** and add:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `DATABASE_URL` | Your PostgreSQL connection string (e.g. Neon.tech) |
| `STORAGE_ENDPOINT` | S3/R2 endpoint or leave empty for local-only mode |
| `STORAGE_BUCKET` | Your S3 bucket name |
| `STORAGE_ACCESS_KEY` | S3 access key |
| `STORAGE_SECRET_KEY` | S3 secret key |
| `STORAGE_USE_SSL` | `true` or `false` |
| `TURN_SERVER_URL` | Twilio / Vonage TURN server URL |
| `TURN_USERNAME` | TURN server username |
| `TURN_CREDENTIAL` | TURN server password |
| `NEXT_PUBLIC_APP_URL` | Your Netlify deploy URL (e.g. `https://pulsechat.netlify.app`) |

> **Note:** Never commit `.env` to git. The `.gitignore` already excludes it.

### Step 3 — Set up Clerk

1. In Clerk Dashboard, go to **Environment & Keys**
2. Set **Production Publishable Key** and **Production Secret Key**
3. Under **Domains**, add your Netlify URL (e.g. `pulsechat.netlify.app`)
4. Under **Redirects**, ensure no conflicting redirect rules exist

### Step 4 — Set up Database

Recommended: [Neon.tech](https://neon.tech) (free tier, compatible with Supabase PostgreSQL)
1. Create a project, copy the connection string
2. Run `npx prisma db push --schema=prisma/schema.prisma` against the Neon database
3. Add the connection string as `DATABASE_URL` in Netlify env vars

### Known Limitations

- **WebRTC calls** require a real TURN server (Twilio or self-hosted). Placeholder TURN in `.env.example` will fail behind CGNAT.
- **Voice messages** require a real S3-compatible storage bucket (Cloudflare R2 works well with Netlify). MinIO localhost config won't work in production.
- **Realtime WebSocket server** (`ws://localhost:3001`) is development-only. For production, consider using Pusher, Ably, or a dedicated WebSocket service.

---

## Vercel (Recommended — simplest path)

Vercel natively supports Next.js with zero configuration.

1. Create a Clerk application at https://clerk.com
2. Set up a PostgreSQL database (Neon, Supabase, or external)
3. Set up object storage (S3, MinIO, or compatible)
4. Configure environment variables in the Vercel dashboard
5. Deploy:
   ```bash
   vercel --prod
   ```

## Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

CMD ["npm", "start"]
```

## Environment Variables

Required for production:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`

Optional:
- `REALTIME_SERVER_URL` — WebSocket server for realtime events
- `TURN_SERVER_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL` — WebRTC TURN server