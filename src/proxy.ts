import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (!token && (pathname.startsWith("/scholar") || pathname.startsWith("/manager") || pathname.startsWith("/director") || pathname.startsWith("/finance"))) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Explicit Role-Based Access Control
    if (token) {
      if (pathname.startsWith("/scholar") && token.role !== "SCHOLAR") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (pathname.startsWith("/manager") && token.role !== "FIELD_MANAGER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (pathname.startsWith("/finance") && token.role !== "FINANCE_OFFICER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (pathname.startsWith("/director") && token.role !== "DIRECTOR") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/scholar/:path*", "/manager/:path*", "/director/:path*", "/finance/:path*"],
};
