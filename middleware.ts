import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tryCatch } from "@/utils/try-catch";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if there's a session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (sessionCookie) {
    // Verify the session is valid by making a request to the session endpoint
    const [sessionCheck, error] = await tryCatch(
      fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      })
    );

    // If there's an error checking the session or session is invalid, clear the cookie
    if (error || !sessionCheck?.ok) {
      if (error) {
        console.error("Session validation error:", error);
      }

      // Clear the invalid session cookie
      response.cookies.delete("better-auth.session_token");

      // If user is trying to access protected routes, redirect to login
      const protectedPaths = ["/dashboard", "/admin", "/org"];
      const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
      );

      if (isProtectedPath) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
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
