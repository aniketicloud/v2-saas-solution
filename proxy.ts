import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/utils/try-catch";

// Define public paths and prefixes in one place for easy updates
const PUBLIC_EXACT = new Set(["/"]);
const PUBLIC_PREFIXES = ["/auth", "/api"];
// Centralize common auth paths
const AUTH_LOGIN = "/auth/login";
const AUTH_SIGNUP = "/auth/signup";

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Early return for non-auth public routes (API, static files, etc.)
  // But exclude /auth routes to handle them specially below
  if (isPublicPath(pathname) && !pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Special case: redirect authenticated users away from auth pages
  if (pathname === AUTH_LOGIN || pathname === AUTH_SIGNUP) {
    const [session, error] = await tryCatch(
      auth.api.getSession({
        headers: await headers(),
      })
    );

    if (error) {
      // If session check fails (e.g., database down), allow access to auth pages
      console.error("Session check failed in proxy:", error);
      return NextResponse.next();
    }

    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next(); // Allow unauthenticated users
  }

  // Allow other auth routes without session check (e.g., /auth/verify-email, /auth/reset-password)
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Check if session exists for protected routes
  const [session, error] = await tryCatch(
    auth.api.getSession({
      headers: await headers(),
    })
  );

  if (error) {
    // If session check fails (e.g., database down), let the request through
    // and let the error boundary handle it
    console.error("Session check failed in proxy for protected route:", error);
    return NextResponse.next();
  }

  // If not authenticated, redirect to login page
  if (!session?.user) {
    return NextResponse.redirect(new URL(AUTH_LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, static files, and common image formats
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
