import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments the `Request` object with the user's token.
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuthenticated = !!req.nextauth.token;

    // Redirect authenticated users from homepage to dashboard
    if (pathname === "/" && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If the user is not authenticated and tries to access a protected route (like /dashboard),
    // withAuth will handle the redirect to the sign-in page.
    // We don't need to explicitly handle it here unless we want custom behavior.
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin", // Ensure this matches your sign-in page
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"], // Only protect dashboard routes
}; 