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

const ROLE_HOME: Record<string, string> = {
  Admin: "/admin",
  Faculty: "/faculty",
  HOD: "/hod",
  Principal: "/principal",
  Chairman: "/director",
};

function noCache(res: NextResponse) {
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // ── Login page ──────────────────────────────────────────────────────────────
  if (pathname === "/login") {
    if (!token) return noCache(NextResponse.next());

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        clockTolerance: "5s",
      });
      const home = ROLE_HOME[payload.role as string] ?? "/login";
      return NextResponse.redirect(new URL(home, request.url));
    } catch {
      const res = NextResponse.next();
      res.cookies.set("token", "", { maxAge: 0, path: "/" });
      return noCache(res);
    }
  }

  // ── Protected routes ────────────────────────────────────────────────────────
  const matchedBase = Object.keys(ROLE_ROUTES).find((base) =>
    pathname.startsWith(base),
  );

  if (!matchedBase) return NextResponse.next();

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return noCache(NextResponse.redirect(loginUrl));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: "5s",
    });

    const userRole = payload.role as string;
    const allowedRoles = ROLE_ROUTES[matchedBase];

    if (!allowedRoles.includes(userRole)) {
      const home = ROLE_HOME[userRole] ?? "/login";
      return noCache(NextResponse.redirect(new URL(home, request.url)));
    }

    return noCache(NextResponse.next());
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set("token", "", { maxAge: 0, path: "/" });
    return noCache(res);
  }
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/faculty/:path*",
    "/hod/:path*",
    "/principal/:path*",
    "/director/:path*",
  ],
};
