# PulseChat — Real-Time Chatting App

A private, modern, real-time communication app for friends. Built with Next.js, Clerk, Prisma, and WebRTC.

## Features
- Clerk authentication and protected routes
- Real-time text messaging with typing indicators
- Voice messages with recording, preview, and playback
- One-to-one audio and video calls via WebRTC
- Replies, emoji reactions, edit/delete messages
- Delivery/read indicators
- Light/dark themes
- Responsive desktop and mobile layouts

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Clerk account (sign up at https://clerk.com)

### Setup
1. Copy `.env.example` to `.env` and fill in your values
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npx prisma db push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure
```
pulsechat/
├── app/                  # Next.js App Router
├── components/           # Reusable UI components
├── lib/                  # Utilities, auth, validation, realtime
├── prisma/               # Database schema
└── .opencode/            # ECC plugin config
```

## Environment Variables
See `.env.example` for all required variables.

## Deployment
See `DEPLOYMENT.md` for deployment instructions.