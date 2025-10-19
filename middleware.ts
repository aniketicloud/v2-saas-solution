import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tryCatch } from "@/utils/try-catch";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if there's a session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // If no session cookie exists, redirect protected routes to login
  if (!sessionCookie) {
    const protectedPaths = ["/dashboard", "/admin", "/org"];
    const isProtectedPath = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
};
