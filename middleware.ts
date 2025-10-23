import { NextRequest, NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";

// Define public paths and prefixes in one place for easy updates
const PUBLIC_EXACT = new Set(["/"]);
const PUBLIC_PREFIXES = ["/auth", "/api"];
// Centralize common auth paths
const AUTH_LOGIN = "/auth/login";

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;

  // Only match prefixes as either exact or followed by '/'
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return true;
    }
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (root, /auth, /api, etc.)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if session exists
  const sessionCookie = await getCookieCache(request);

  // If not authenticated, redirect to sign page
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_LOGIN;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, static files, and common image formats
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
