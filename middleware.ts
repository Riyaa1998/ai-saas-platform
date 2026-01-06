import { authMiddleware } from "@clerk/nextjs";
import { NextRequest } from "next/server";
import { analyticsMiddleware } from "@/lib/analytics-middleware";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/", 
    "/api/webhook",
    "/api/code",
    "/api/conversation",
    "/api/image",
    "/api/speech-to-text",
    "/api/analytics",
    "/code",
    "/conversation",
    "/image",
    "/music",
    "/video",
    "/speech-to-text"
  ],
  // Add analytics tracking to all requests
  beforeAuth: (req: NextRequest) => {
    return analyticsMiddleware(req);
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)","/(api|trpc)(.*)"],
}; 