# Deployment Guide

## Vercel (Recommended)

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