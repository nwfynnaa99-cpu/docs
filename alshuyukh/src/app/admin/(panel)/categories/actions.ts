"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/session";
import { audit } from "@/server/auth/audit";
import { docs } from "@/server/db/docs";
import type { Category, Media, Product } from "@/server/catalog/types";
import { done, fail, fieldErrors, type FormState } from "@/lib/admin/form";

const Input = z.object({
  name: z.string().trim().min(2, "اكتب اسم القسم").max(60),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "حروف إنجليزية صغيرة وأرقام وشرطات فقط").max(60),
  description: z.string().trim().max(300),
  parentId: z.string().max(64).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export async function saveCategory(id: string | null, _: FormState, data: FormData): Promise<FormState> {
  const user = await requireAdmin("catalog");
  const parsed = Input.safeParse({
    name: data.get("name"), slug: data.get("slug"), description: data.get("description") ?? "",
    parentId: String(data.get("parentId") ?? "") || undefined, sortOrder: data.get("sortOrder") || 0,
  });
  if (!parsed.success) return fail("راجع الحقول المحددة", fieldErrors(parsed.error));
  const all = docs.list<Category>("category");
  const existing = id ? all.find((c) => c.id === id) : undefined;
  if (id && !existing) return fail("القسم غير موجود");
  const { parentId } = parsed.data;
  if (parentId && (!all.some((c) => c.id === parentId && !c.parentId) || parentId === id)) return fail("قسم رئيسي غير صالح", { parentId: "اختر قسمًا رئيسيًا" });
  if (existing && parentId && all.some((c) => c.parentId === existing.id)) return fail("هذا القسم له أقسام فرعية، فلا يمكن جعله فرعيًا", { parentId: "له أقسام فرعية" });
  if (docs.slugTaken("category", parsed.data.slug, id ?? undefined)) return fail("الرابط مستخدم", { slug: "الرابط مستخدم لقسم آخر" });

  let image: Media | undefined = existing?.image;
  const imageSrc = String(data.get("imageSrc") ?? "");
  if (imageSrc === "") image = undefined;
  else if (/^\/(media|uploads)\/[a-z0-9-]+\.webp$/.test(imageSrc) && imageSrc !== existing?.image?.src) {
    const macro = imageSrc.replace(".webp", "-macro.webp");
    image = { src: imageSrc, alt: parsed.data.name, width: 1200, height: 1500, macro: imageSrc.startsWith("/media/") ? macro : undefined };
  }

  const cat: Category = { ...(existing ?? { id: `c-${randomUUID().slice(0, 8)}` }), ...parsed.data, parentId, image };
  docs.put("category", cat, { slug: cat.slug, sort: cat.sortOrder });
  audit(user, existing ? "update" : "create", "category", cat.id, cat.name);
  revalidatePath("/", "layout");
  if (!existing) redirect(`/admin/categories/${cat.id}?created=1`);
  return done();
}

export async function deleteCategory(id: string, _s?: FormState, _d?: FormData): Promise<FormState> {
  const user = await requireAdmin("catalog");
  const cat = docs.get<Category>("category", id);
  if (!cat) return fail("القسم غير موجود");
  if (docs.list<Category>("category").some((c) => c.parentId === id)) return fail("احذف الأقسام الفرعية أولًا أو انقلها");
  const used = docs.list<Product>("product").filter((p) => p.categoryIds.includes(id)).length;
  if (used) return fail(`القسم يحتوي ${used} منتج. انقلها إلى قسم آخر أولًا.`);
  docs.remove("category", id);
  audit(user, "delete", "category", id, cat.name);
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}
