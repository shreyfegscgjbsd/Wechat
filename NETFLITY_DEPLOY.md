# Netlify Deployment Guide — PulseChat

## Quick Start

### 1. Link GitHub Repo to Netlify
1. Go to https://app.netlify.com
2. Click **Add new site → Import an existing project**
3. Connect your GitHub account, select `shreyfegscgjbsd/Wechat`
4. Netlify auto-detects `netlify.toml` — proceed with defaults

### 2. Environment Variables (required in Netlify Dashboard)
Go to **Site settings → Environment variables** and add these 11 variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...      # Clerk Dashboard > API Keys
CLERK_SECRET_KEY=sk_test_...                        # Clerk Dashboard > API Keys
DATABASE_URL=postgresql://...                       # Neon.tech / Supabase connection string
STORAGE_ENDPOINT=https://your-bucket.r2.cloudflareservice.com
STORAGE_BUCKET=pulsechat
STORAGE_ACCESS_KEY=your_r2_access_key
STORAGE_SECRET_KEY=your_r2_secret_key
STORAGE_USE_SSL=true
TURN_SERVER_URL=turn:global.relay.twilio.com:443
TURN_USERNAME=your_twilio_turn_username
TURN_CREDENTIAL=your_twilio_turn_credential
```

### 3. Clerk Configuration
- Add your Netlify domain to Clerk's **Allowed Domains**
- Use **Production** Clerk keys (not test keys)

### 4. Database Migration
After deploying, connect to your database and run:
```bash
npx prisma db push --schema=prisma/schema.prisma
```
(Or run it locally, then push changes.)

## What Works on Netlify

| Feature | Status |
|---|---|
| Landing page | ✅ Static, instant |
| Sign in / Sign up | ✅ Pre-rendered |
| Dashboard (chats list) | ✅ Dynamic SSR |
| Chat conversation page | ✅ Dynamic SSR |
| User search API | ✅ Serverless function |
| Message CRUD API | ✅ Serverless function |
| Voice messages | ⚠️ Needs real S3/R2 bucket |
| Audio/video calls | ⚠️ Needs real TURN server |
| Real-time messaging | ⚠️ WS server (port 3001) separate |

## What Doesn't Work Without Changes

- **WebSocket realtime server** (`ws://localhost:3001`) — Netlify doesn't support long-lived connections. Replace with Pusher, Ably, or upgrade to a VPS.
- **Local MinIO** — replace with Cloudflare R2, AWS S3, or Supabase Storage.
- **Placeholder TURN** — use Twilio Client or Xirsys TURN service.

## Alternative: Vercel (Zero-config)

If Netlify deployment hits friction, Vercel is the easiest path:
```bash
npx vercel --prod
```
Vercel handles Next.js, middleware, and serverless functions out of the box.
