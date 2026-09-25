/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.com" },
      { protocol: "https", hostname: "gravatar.com" },
      { protocol: "https", hostname: "*.gravatar.com" },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clerk.dev https://*.clerk.dev https://*.clerk.accounts.dev https://clerk.accounts.dev; worker-src blob: 'self' https://cdn.clerk.dev https://*.clerk.dev https://*.clerk.accounts.dev https://clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://*.clerk.dev https://*.clerk.accounts.dev https://clerk.accounts.dev https://clerk-telemetry.com https://*.supabase.co wss://localhost:* ws://localhost:*; font-src 'self' https: data:; object-src 'none'; frame-src https://*.clerk.dev https://*.clerk.accounts.dev;" },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;