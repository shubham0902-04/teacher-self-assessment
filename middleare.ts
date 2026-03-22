import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ROLE_ROUTES: Record<string, string[]> = {
  "/admin": ["Admin"],
  "/faculty": ["Faculty"],
  "/hod": ["HOD"],
  "/principal": ["Principal"],
  "/director": ["Chairman"],
};

const REDIRECT_MAP: Record<string, string> = {
  Admin: "/admin/dashboard",
  Faculty: "/faculty",
  HOD: "/hod",
  Principal: "/principal",
  Chairman: "/director",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;

  // No token — login pe bhejo, "from" param ke saath
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) throw new Error("JWT_SECRET missing");

    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const userRole = payload.role as string;

    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based route check
    const matchedRoute = Object.keys(ROLE_ROUTES).find(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );

    if (matchedRoute) {
      const allowedRoles = ROLE_ROUTES[matchedRoute];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(
          new URL(REDIRECT_MAP[userRole] || "/login", request.url),
        );
      }
    }

    return NextResponse.next();
  } catch {
    // Token invalid/expired — cookie delete karke login pe bhejo
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/faculty/:path*",
    "/hod/:path*",
    "/principal/:path*",
    "/director/:path*",
  ],
};
