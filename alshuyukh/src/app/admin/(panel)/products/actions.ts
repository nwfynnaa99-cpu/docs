"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/session";
import { audit } from "@/server/auth/audit";
import { docs } from "@/server/db/docs";
import type { Category, Product } from "@/server/catalog/types";
import { done, fail, fieldErrors, toHalalas, type FormState } from "@/lib/admin/form";

const str = (max: number) => z.string().trim().max(max);
const media = z.object({
  src: z.string().regex(/^\/(media|uploads)\/[a-z0-9-]+\.webp$/, "مسار صورة غير صالح"),
  alt: str(140),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  macro: z.string().regex(/^\/(media|uploads)\/[a-z0-9-]+\.webp$/).optional(),
});

const ProductInput = z
  .object({
    name: str(80).min(2, "اكتب اسم المنتج"),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "حروف إنجليزية صغيرة وأرقام وشرطات فقط").max(80),
    shortDescription: str(160).min(5, "اكتب وصفًا قصيرًا"),
    description: str(2000).min(5, "اكتب الوصف"),
    price: z.number({ message: "اكتب السعر" }).int().positive("السعر يجب أن يكون أكبر من صفر").max(10_000_000),
    compareAtPrice: z.number().int().positive().max(10_000_000).nullable(),
    unit: z.enum(["meter", "piece", "set"]),
    inventory: z.number({ message: "اكتب الكمية" }).int().min(0, "لا يمكن أن يكون المخزون سالبًا").max(1_000_000),
    categoryIds: z.array(z.string().max(64)).min(1, "اختر قسمًا واحدًا على الأقل"),
    isBestSeller: z.boolean(),
    tags: z.array(str(30)).max(20),
    images: z.array(media).min(1, "أضف صورة واحدة على الأقل").max(12),
    fabric: z
      .object({ type: str(60).min(1, "مطلوب"), material: str(80).min(1, "مطلوب"), texture: str(60).min(1, "مطلوب"), season: str(30).min(1, "مطلوب"), color: str(30).min(1, "مطلوب"), width: str(20).min(1, "مطلوب"), origin: str(30).optional() })
      .nullable(),
    attributes: z.object({ color: str(30).optional(), season: str(30).optional(), origin: str(30).optional() }),
  })
  .refine((p) => p.compareAtPrice == null || p.compareAtPrice > p.price, { message: "السعر قبل الخصم يجب أن يكون أعلى من السعر الحالي", path: ["compareAtPrice"] });

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
const opt = (d: FormData, k: string) => text(d, k) || undefined;

function parse(data: FormData) {
  let images: unknown = [];
  try {
    images = JSON.parse(String(data.get("images") ?? "[]"));
  } catch {
    /* zod reports it */
  }
  const isFabric = data.get("isFabric") === "1";
  return ProductInput.safeParse({
    name: text(data, "name"),
    slug: text(data, "slug"),
    shortDescription: text(data, "shortDescription"),
    description: text(data, "description"),
    price: toHalalas(data.get("price")),
    compareAtPrice: toHalalas(data.get("compareAtPrice")) ?? null,
    unit: text(data, "unit"),
    inventory: text(data, "inventory") === "" ? undefined : Number(text(data, "inventory")),
    categoryIds: data.getAll("categoryIds").map(String),
    isBestSeller: data.get("isBestSeller") === "1",
    tags: text(data, "tags").split(/[,،]/).map((t) => t.trim()).filter(Boolean),
    images,
    fabric: isFabric
      ? { type: text(data, "fabric.type"), material: text(data, "fabric.material"), texture: text(data, "fabric.texture"), season: text(data, "fabric.season"), color: text(data, "fabric.color"), width: text(data, "fabric.width"), origin: opt(data, "fabric.origin") }
      : null,
    attributes: { color: opt(data, "attributes.color"), season: opt(data, "attributes.season"), origin: opt(data, "attributes.origin") },
  });
}

export async function saveProduct(id: string | null, _: FormState, data: FormData): Promise<FormState> {
  const user = await requireAdmin("catalog");
  const parsed = parse(data);
  if (!parsed.success) return fail("راجع الحقول المحددة", fieldErrors(parsed.error));
  const input = parsed.data;

  const validCats = new Set(docs.list<Category>("category").map((c) => c.id));
  if (input.categoryIds.some((c) => !validCats.has(c))) return fail("قسم غير معروف", { categoryIds: "قسم غير معروف" });
  if (docs.slugTaken("product", input.slug, id ?? undefined)) return fail("الرابط مستخدم لمنتج آخر", { slug: "الرابط مستخدم لمنتج آخر" });

  const existing = id ? docs.get<Product>("product", id) : null;
  if (id && !existing) return fail("المنتج غير موجود");

  const product: Product = {
    ...(existing ?? { id: `p-${randomUUID().slice(0, 8)}`, sku: "", rating: { average: 0, count: 0 }, createdAt: new Date().toISOString() }),
    name: input.name,
    slug: input.slug,
    sku: existing?.sku || input.slug.toUpperCase(),
    shortDescription: input.shortDescription,
    description: input.description,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    unit: input.unit,
    inventory: input.inventory,
    categoryIds: input.categoryIds,
    isBestSeller: input.isBestSeller,
    tags: input.tags,
    images: input.images,
    fabric: input.fabric ?? undefined,
    attributes: input.fabric ? undefined : input.attributes,
  } as Product;

  const sort = existing ? (docs.list<Product>("product").findIndex((p) => p.id === existing.id)) : docs.list("product").length;
  docs.put("product", product, { slug: product.slug, sort });
  audit(user, existing ? "update" : "create", "product", product.id, `${product.name} · ${product.price / 100} ر.س · مخزون ${product.inventory}`);
  revalidatePath("/", "layout");
  if (!existing) redirect(`/admin/products/${product.id}?created=1`);
  return done();
}

export async function setInventory(id: string, _: FormState, data: FormData): Promise<FormState> {
  const user = await requireAdmin("catalog");
  const n = Number(data.get("inventory"));
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) return fail("كمية غير صالحة");
  const p = docs.get<Product>("product", id);
  if (!p) return fail("المنتج غير موجود");
  const before = p.inventory;
  p.inventory = n;
  docs.put("product", p, { slug: p.slug, sort: docs.list<Product>("product").findIndex((x) => x.id === id) });
  audit(user, "inventory", "product", id, `${p.name}: ${before} → ${n}`);
  revalidatePath("/", "layout");
  return done("حُدّث");
}

export async function deleteProduct(id: string, _state?: FormState, _data?: FormData): Promise<FormState> {
  const user = await requireAdmin("catalog");
  const p = docs.get<Product>("product", id);
  if (!p) return fail("المنتج غير موجود");
  docs.remove("product", id);
  audit(user, "delete", "product", id, p.name);
  revalidatePath("/", "layout");
  redirect("/admin/products?deleted=1");
}
