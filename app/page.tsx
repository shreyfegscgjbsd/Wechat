import type { Metadata } from 'next';
import { ClerkHomeContent } from '@/components/clerk-home-content';

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isValidKey =
  !!clerkPublishableKey &&
  !clerkPublishableKey.startsWith('replace_with_') &&
  clerkPublishableKey.startsWith('pk_');

export const metadata: Metadata = {
  title: 'PulseChat — Real-Time Chat',
  description: 'A private, real-time messaging app for friends.',
};

export default function Home() {
  if (!isValidKey) {
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
                <a
                  href="/sign-in"
                  className="rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return <ClerkHomeContent />;
}

// Force dynamic rendering to avoid static build issues with Clerk
export const dynamic = 'force-dynamic';
