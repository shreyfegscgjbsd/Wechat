import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^\\w].*|.*\\.(?:js|css|png|jpg|jpeg|svg|gif|woff|woff2|webp|ico|txt|xml|map|md)$).*)",
  ],
};