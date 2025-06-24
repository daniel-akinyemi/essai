import { auth } from "@/app/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  
  // List of protected routes that require authentication
  const protectedRoutes = ["/dashboard"];
  
  // Check if the requested path matches any protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // Redirect to sign-in page if trying to access protected route without authentication
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if trying to access auth pages while already authenticated
  if (session && (
    request.nextUrl.pathname.startsWith("/auth/signin") ||
    request.nextUrl.pathname.startsWith("/auth/signup")
  )) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/signin",
    "/auth/signup",
  ],
}; 