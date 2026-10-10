"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/session";
import { audit } from "@/server/auth/audit";
import { docs } from "@/server/db/docs";
import type { Product, Review } from "@/server/catalog/types";
import { done, fail, fieldErrors, type FormState } from "@/lib/admin/form";

async function mutate(id: string, fn: (r: Review) => Review | null, action: string, msg: string) {
  const user = await requireAdmin("content");
  const r = docs.get<Review>("review", id);
  if (!r) return fail("غير موجود");
  const next = fn(r);
  if (next) docs.put("review", next, { sort: docs.list<Review>("review").findIndex((x) => x.id === id) });
  else docs.remove("review", id);
  audit(user, action, "review", id, r.body.slice(0, 80));
  revalidatePath("/", "layout");
  return done(msg);
}

export const toggleApproved = async (id: string, _s?: FormState, _d?: FormData) => mutate(id, (r) => ({ ...r, approved: r.approved === false }), "moderate", "تم");
export const toggleFeatured = async (id: string, _s?: FormState, _d?: FormData) => mutate(id, (r) => ({ ...r, featured: !r.featured }), "feature", "تم");
export const deleteReview = async (id: string, _s?: FormState, _d?: FormData) => mutate(id, () => null, "delete", "حُذف");

const Input = z.object({
  author: z.string().trim().min(2, "اكتب الاسم").max(60),
  city: z.string().trim().max(40).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(5, "اكتب التقييم").max(600),
  productId: z.string().max(64).optional(),
});

export async function addReview(_: FormState, data: FormData): Promise<FormState> {
  const user = await requireAdmin("content");
  const parsed = Input.safeParse({ author: data.get("author"), city: String(data.get("city") ?? "") || undefined, rating: data.get("rating"), body: data.get("body"), productId: String(data.get("productId") ?? "") || undefined });
  if (!parsed.success) return fail("راجع الحقول", fieldErrors(parsed.error));
  if (parsed.data.productId && !docs.get<Product>("product", parsed.data.productId)) return fail("منتج غير معروف");
  const review: Review = { id: `r-${randomUUID().slice(0, 8)}`, ...parsed.data, createdAt: new Date().toISOString().slice(0, 10), verified: data.get("verified") === "1", approved: true };
  docs.put("review", review, { sort: docs.list("review").length });
  audit(user, "create", "review", review.id, review.author);
  revalidatePath("/", "layout");
  return done("أُضيف التقييم");
}
