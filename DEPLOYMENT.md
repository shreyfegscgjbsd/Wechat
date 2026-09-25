# PulseChat Production Deployment Guide

## Overview
This document describes the production deployment requirements for PulseChat, with emphasis on the WebSocket infrastructure needed for real-time features.

## Architecture Overview

```
┌─────────────────┐     HTTPS/WSS      ┌──────────────────┐
│   Netlify       │ ◄─────────────────► │  WebSocket       │
│   (Next.js)     │                     │  Server          │
│   (Serverless)  │                     │  (Separate)      │
└─────────────────┘                     └──────────────────┘
        │                                       │
        ▼                                       ▼
┌─────────────────┐                     ┌──────────────────┐
│   Clerk Auth    │                     │  PostgreSQL      │
│   (Managed)     │                     │  (Supabase/Neon) │
└─────────────────┘                     └──────────────────┘
```

## Required Services

### 1. Netlify (Frontend + API Routes)
- Next.js 16 app with App Router
- Serverless functions for API routes
- Clerk authentication handled via middleware

### 2. Clerk Authentication (Production)
**Required**: Switch from development keys to production keys
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a production instance (or promote development instance)
3. Copy **Publishable Key** (`pk_live_*`) and **Secret Key** (`sk_live_*`)
4. Add to Netlify Environment Variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_*)
   - `CLERK_SECRET_KEY` (sk_live_*)

### 3. PostgreSQL Database (Production)
- **Supabase** (recommended): Free tier available, managed PostgreSQL
- **Neon**: Serverless PostgreSQL, generous free tier
- **Railway/Render**: Managed PostgreSQL
- Update `DATABASE_URL` in Netlify with production connection string

### 4. WebSocket Server (Required for Real-time Features)
**CRITICAL**: Netlify **cannot** host persistent WebSocket servers (serverless architecture).

#### Option A: Deploy Separate WebSocket Server (Recommended)
Deploy the included `lib/realtime-server.ts` on a platform that supports persistent connections:

**Recommended Platforms:**
| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Railway** | $5/month credit | Easy Docker deploy, auto HTTPS |
| **Render** | 750 hrs/month | WebSocket support, auto SSL |
| **Fly.io** | 3 shared-cpu VMs | Global deployment, TLS |
| **Hetzner/Railway VPS** | ~€4/month | Full control, cheapest |

**Deployment Steps (Railway Example):**
```bash
# 1. Create railway.json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": { "startCommand": "npx tsx lib/realtime-server.ts" }
}

# 2. Deploy to Railway
railway login
railway init
railway up

# 3. Set environment variables in Railway:
#   DATABASE_URL=postgresql://...
#   NODE_ENV=production
#   PORT=3001 (or provided by Railway)
```

#### Option B: Managed WebSocket Service (Alternative)
Use a managed realtime service instead of self-hosting:
- **Pusher** (WebSocket fallback, generous free tier)
- **Ably** (WebSocket + pub/sub, generous free tier)
- **Supabase Realtime** (if using Supabase for database)
- **Socket.io with Redis adapter** (if using separate Redis)

**Note**: These require code changes to use their SDKs instead of raw WebSocket.

#### Option C: Disable Real-time Features (Fallback)
If you cannot deploy a WebSocket server:
- Set `NEXT_PUBLIC_REALTIME_URL` to empty or invalid value
- App will work without real-time features (polling fallback for messages)
- Voice/video calls will not work (require WebRTC + TURN)

### 5. TURN Server (Required for WebRTC Calls)
Required for voice/video calls to work through NAT/firewalls:
- **Twilio Network Traversal** (recommended, pay-as-you-go)
- **Xirsys** (free tier available)
- **Self-hosted coturn** (on same VPS as WebSocket server)

Add to Netlify:
- `TURN_SERVER_URL=turn:your-turn-server.com:3478`
- `TURN_USERNAME=your_username`
- `TURN_CREDENTIAL=your_password`

### 6. Object Storage (Voice Messages)
- **Cloudflare R2** (free tier, S3-compatible)
- **AWS S3** (standard)
- **MinIO** (self-hosted)

Add to Netlify:
- `STORAGE_ENDPOINT=https://your-bucket.r2.cloudflarestorage.com`
- `STORAGE_BUCKET=your-bucket`
- `STORAGE_ACCESS_KEY=...`
- `STORAGE_SECRET_KEY=...`
- `STORAGE_USE_SSL=true`

## Netlify Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk production publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_REALTIME_URL` | ⚠️ | WebSocket URL (wss://...) for real-time features |
| `STORAGE_ENDPOINT` | ⚠️ | S3 endpoint URL |
| `STORAGE_BUCKET` | ⚠️ | S3 bucket name |
| `STORAGE_ACCESS_KEY` | ⚠️ | S3 access key |
| `STORAGE_SECRET_KEY` | ⚠️ | S3 secret key |
| `STORAGE_USE_SSL` | ⚠️ | `true` for production |
| `TURN_SERVER_URL` | ⚠️ | TURN server URL (turn:...) |
| `TURN_USERNAME` | ⚠️ | TURN username |
| `TURN_CREDENTIAL` | ⚠️ | TURN password |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your production URL (e.g., https://pulsechat.netlify.app) |
| `NODE_ENV` | ✅ | `production` |

## Deployment Checklist

- [ ] Create production Clerk instance, get production keys
- [ ] Set up production PostgreSQL database
- [ ] Deploy WebSocket server (Railway/Render/Fly.io) OR configure managed service
- [ ] Set up TURN server for WebRTC
- [ ] Configure object storage (R2/S3/MinIO)
- [ ] Add all environment variables to Netlify
- [ ] Deploy to Netlify
- [ ] Test: Sign in → Dashboard → Chat → Voice/Video calls

## Known Limitations

1. **Netlify cannot host WebSocket servers** - Must deploy separately
2. **Clerk development keys have usage limits** - Must use production keys
3. **WebRTC requires TURN server** - Cannot work without it in production
4. **WebSocket requires persistent server** - Netlify Functions/Edge cannot maintain persistent connections

## Files Modified for Production

- `app/layout.tsx` - Fixed deprecated Clerk props (`signInFallbackRedirectUrl`)
- `components/app-shell.tsx` - Graceful WebSocket URL handling
- `lib/realtime.ts` - Improved connection state management, error handling, reconnection logic
- `components/app-shell.tsx` - Graceful handling when WebSocket URL not configured
- `.env.example` - Updated with production-ready comments
- `netlify.toml` - Updated environment variable documentation

## Testing Production Build Locally

```bash
# Build for production
npm run build

# Test with production environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... \
CLERK_SECRET_KEY=sk_live_... \
DATABASE_URL=postgresql://... \
NEXT_PUBLIC_REALTIME_URL=wss://your-ws-server.com \
npm run start
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Clerk development keys warning" | Use production Clerk keys |
| "WebSocket connection failed" | Check `NEXT_PUBLIC_REALTIME_URL` is set to wss:// URL |
| "WebRTC calls fail" | Configure TURN server |
| "Voice messages don't work" | Check S3/R2 configuration |
| "Messages not real-time" | Check WebSocket server is running and `NEXT_PUBLIC_REALTIME_URL` is set |