import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isValidKey =
  clerkPublishableKey &&
  !clerkPublishableKey.startsWith('replace_with_') &&
  clerkPublishableKey.startsWith('pk_');

export const metadata: Metadata = {
  title: 'PulseChat — Real-Time Chat',
  description: 'A private, real-time messaging app for friends.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // If Clerk keys are not configured or invalid, render without ClerkProvider
  // This prevents build failures when env vars are not set or are placeholders
  if (!isValidKey) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
