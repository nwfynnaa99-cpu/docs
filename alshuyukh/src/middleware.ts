import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for the admin: no session cookie → login page. This only
 * checks presence; every admin page and action validates the session
 * against the database (requireAdmin) before doing anything.
 */
const COOKIES = ["__Host-alshuyukh_admin", "alshuyukh_admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const hasCookie = COOKIES.some((c) => req.cookies.has(c));

  if (!isLogin && !hasCookie) {
    if (pathname.startsWith("/api/admin")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
