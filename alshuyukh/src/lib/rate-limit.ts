import "server-only";

/**
 * Fixed-window rate limiter keyed by client IP.
 * In-memory: correct for a single instance. For multi-instance deploys,
 * back it with Redis/Upstash using the same interface.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, { limit = 60, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return { ok: true, remaining: limit - 1, reset: now + windowMs };
  }
  b.count += 1;
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count), reset: b.reset };
}

export const clientIp = (headers: Headers) =>
  headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "anonymous";
