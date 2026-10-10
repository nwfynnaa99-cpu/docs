import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { catalog } from "@/server/catalog";
import { normalizeArabic, stemArabic } from "@/lib/arabic";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const Query = z.object({ q: z.string().trim().min(1).max(64) });

const suggestionPool = ["قماش ياباني أبيض", "قماش ياباني فاخر", "أقمشة صيفية خفيفة", "صوف شتوي", "قطن طبيعي", "قماش أسود حريري", "بوكس هدية", "شماغ شتوي"];

export async function GET(req: NextRequest) {
  const rl = rateLimit(`search:${clientIp(req.headers)}`, { limit: 90, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) } });

  const parsed = Query.safeParse({ q: req.nextUrl.searchParams.get("q") ?? "" });
  if (!parsed.success) return NextResponse.json({ error: "invalid_query" }, { status: 400 });

  const { q } = parsed.data;
  const stem = stemArabic(q);
  const [products, categories] = await Promise.all([catalog.searchProducts(q, 8), catalog.listCategories()]);

  const body = {
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.images[0]?.src ?? "",
      // Prefer the most specific (child) category for the label
      category: (categories.find((c) => c.parentId && p.categoryIds.includes(c.id)) ?? categories.find((c) => p.categoryIds.includes(c.id)))?.name ?? "",
    })),
    categories: categories.filter((c) => normalizeArabic(c.name).includes(stem)).slice(0, 5).map((c) => ({ slug: c.slug, name: c.name })),
    suggestions: suggestionPool.filter((s) => normalizeArabic(s).includes(stem)).slice(0, 5),
  };

  return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
