import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { CustomUserMenu } from '@/components/custom-user-menu';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="font-semibold text-lg">PulseChat</span>
          </div>
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton>
                <button className="text-sm font-medium hover:text-primary transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-lg bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <CustomUserMenu />
          </SignedIn>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              Chat that feels{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                alive
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              PulseChat is a private, real-time messaging app for friends. Text, voice, and
              audio/video calls — fast, secure, and beautiful.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <SignedOut>
                <SignUpButton>
                  <button className="rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-6 max-w-4xl">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageIcon />
            </div>
            <h3 className="font-semibold mb-2">Real-Time Text</h3>
            <p className="text-sm text-muted-foreground">
              Instant messaging with typing indicators, reactions, and read receipts.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MicIcon />
            </div>
            <h3 className="font-semibold mb-2">Voice Messages</h3>
            <p className="text-sm text-muted-foreground">
              Record, preview, and send voice notes with waveform visualization.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CallIcon />
            </div>
            <h3 className="font-semibold mb-2">Audio & Video Calls</h3>
            <p className="text-sm text-muted-foreground">
              One-to-one calls with WebRTC, mute, camera toggle, and clear status.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function MessageIcon() {
  return (
    <svg
      className="h-6 w-6 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      className="h-6 w-6 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-7-4h14M12 3a5 5 0 015 5v3a5 5 0 01-10 0V8a5 5 0 015-5z"
      />
    </svg>
  );
}

function CallIcon() {
  return (
    <svg
      className="h-6 w-6 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v1.364a2 2 0 01-1.698 1.98 12.005 12.005 0 007.09 11.098 1 1 0 01.598 1.33l-.001.001a1 1 0 01-1.33.598 12.005 12.005 0 01-11.098-7.09 1 1 0 011.98-1.698l1.364-1.364a1 1 0 011 0l4.553 2.276a1 1 0 010 1.802l-4.553 2.276a1 1 0 01-1.802 0l-4.553-2.276a1 1 0 010-1.802z"
      />
    </svg>
  );
}
