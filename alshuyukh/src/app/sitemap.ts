import type { MetadataRoute } from "next";
import { catalog } from "@/server/catalog";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([catalog.listCategories(), catalog.listProducts()]);
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/offers"), changeFrequency: "daily", priority: 0.8 },
    ...categories.map((c) => ({ url: absoluteUrl(`/categories/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.createdAt, changeFrequency: "weekly" as const, priority: 0.7, images: p.images.map((i) => absoluteUrl(i.src)) })),
  ];
}
