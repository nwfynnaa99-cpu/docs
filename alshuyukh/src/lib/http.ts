import "server-only";
import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "./rate-limit";

/**
 * Rejects cross-site POSTs (CSRF) by requiring the Origin header to match
 * the request host. Browsers always send Origin on POST fetches.
 */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function guard(req: Request, bucket: string, limit: number) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const rl = rateLimit(`${bucket}:${clientIp(req.headers)}`, { limit, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited", message: "طلبات كثيرة. حاول بعد دقيقة." }, { status: 429, headers: { "Retry-After": "60" } });
  return null;
}

export const noStore = { "Cache-Control": "no-store" };
