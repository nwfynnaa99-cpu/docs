"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/session";
import { audit } from "@/server/auth/audit";
import { docs } from "@/server/db/docs";
import { homepage as seedHomepage } from "@/server/catalog/seed";
import type { Collection, HomepageContent, Offer } from "@/server/catalog/types";
import { done, fail, fieldErrors, toHalalas, type FormState } from "@/lib/admin/form";

const t = (min: number, max: number) => z.string().trim().min(min, "مطلوب").max(max, "طويل جدًا");
// Internal paths only: blocks javascript: and external redirects from the CMS.
const href = z.string().trim().regex(/^\/[a-z0-9\-/?=&.]*$/i, "رابط داخلي يبدأ بـ /").max(120);
const img = z.string().regex(/^\/(media|uploads)\/[a-z0-9-]+\.webp$/, "صورة غير صالحة");
const s = (d: FormData, k: string) => String(d.get(k) ?? "");

const save = async (data: HomepageContent, user: Awaited<ReturnType<typeof requireAdmin>>, section: string) => {
  docs.put("setting", { id: "homepage", ...data });
  audit(user, "update", "homepage", section);
  revalidatePath("/", "layout");
  return done();
};
const current = () => docs.get<HomepageContent & { id: string }>("setting", "homepage") ?? { id: "homepage", ...seedHomepage };

export async function saveAnnouncement(_: FormState, d: FormData): Promise<FormState> {
  const user = await requireAdmin("content");
  const p = z.object({ enabled: z.boolean(), text: t(0, 120), href: z.union([z.literal(""), href]) }).safeParse({ enabled: d.get("enabled") === "1", text: s(d, "text"), href: s(d, "href") });
  if (!p.success) return fail("راجع الحقول", fieldErrors(p.error));
  if (p.data.enabled && !p.data.text) return fail("اكتب نص الشريط", { text: "مطلوب عند التفعيل" });
  return save({ ...current(), announcement: { enabled: p.data.enabled, text: p.data.text, href: p.data.href || undefined } }, user, "announcement");
}

export async function saveHero(_: FormState, d: FormData): Promise<FormState> {
  const user = await requireAdmin("content");
  const p = z.object({
    eyebrow: t(1, 60), title: t(1, 40), tagline: t(1, 60), body: t(1, 160),
    primaryLabel: t(1, 30), primaryHref: href, secondaryLabel: t(1, 30), secondaryHref: href, image: img,
  }).safeParse(Object.fromEntries(["eyebrow", "title", "tagline", "body", "primaryLabel", "primaryHref", "secondaryLabel", "secondaryHref", "image"].map((k) => [k, s(d, k)])));
  if (!p.success) return fail("راجع الحقول", fieldErrors(p.error));
  const c = current();
  const v = p.data;
  return save({ ...c, hero: { ...c.hero, eyebrow: v.eyebrow, title: v.title, tagline: v.tagline, body: v.body, primaryCta: { label: v.primaryLabel, href: v.primaryHref }, secondaryCta: { label: v.secondaryLabel, href: v.secondaryHref }, image: { ...c.hero.image, src: v.image } } }, user, "hero");
}

export async function saveSections(_: FormState, d: FormData): Promise<FormState> {
  const user = await requireAdmin("content");
  const p = z.object({
    fabricTitle: t(1, 60), fabricBody: t(1, 300), fabricImage: img,
    points: z.array(z.object({ label: t(1, 30), text: t(1, 140) })).length(4),
    boxesTitle: t(1, 60), boxesSubtitle: t(1, 80), boxesBody: t(1, 300), boxesHref: href,
    boxesPriceFrom: z.number({ message: "اكتب السعر" }).int().positive(),
  }).safeParse({
    fabricTitle: s(d, "fabricTitle"), fabricBody: s(d, "fabricBody"), fabricImage: s(d, "fabricImage"),
    points: [0, 1, 2, 3].map((i) => ({ label: s(d, `points.${i}.label`), text: s(d, `points.${i}.text`) })),
    boxesTitle: s(d, "boxesTitle"), boxesSubtitle: s(d, "boxesSubtitle"), boxesBody: s(d, "boxesBody"), boxesHref: s(d, "boxesHref"),
    boxesPriceFrom: toHalalas(d.get("boxesPriceFrom")),
  });
  if (!p.success) return fail("راجع الحقول", fieldErrors(p.error));
  const c = current();
  const v = p.data;
  return save({
    ...c,
    fabricDetail: { ...c.fabricDetail, title: v.fabricTitle, body: v.fabricBody, points: v.points, image: { ...c.fabricDetail.image, src: v.fabricImage } },
    boxes: { title: v.boxesTitle, subtitle: v.boxesSubtitle, body: v.boxesBody, href: v.boxesHref, priceFrom: v.boxesPriceFrom },
  }, user, "sections");
}

export async function saveCollections(_: FormState, d: FormData): Promise<FormState> {
  const user = await requireAdmin("content");
  const list = docs.list<Collection>("collection");
  const Item = z.object({ title: t(1, 30), subtitle: t(1, 40), href, image: img });
  const errors: Record<string, string> = {};
  const next = list.map((c, i) => {
    const p = Item.safeParse({ title: s(d, `c.${i}.title`), subtitle: s(d, `c.${i}.subtitle`), href: s(d, `c.${i}.href`), image: s(d, `c.${i}.image`) });
    if (!p.success) for (const iss of p.error.issues) errors[`c.${i}.${iss.path.join(".")}`] = iss.message;
    return p.success ? { ...c, ...p.data, image: { ...c.image, src: p.data.image, alt: p.data.title, macro: undefined } } : c;
  });
  if (Object.keys(errors).length) return fail("راجع الحقول", errors);
  next.forEach((c) => docs.put("collection", c, { slug: c.slug, sort: c.sortOrder }));
  audit(user, "update", "collections", undefined, `${next.length} بطاقات`);
  revalidatePath("/", "layout");
  return done();
}

export async function saveOffers(_: FormState, d: FormData): Promise<FormState> {
  const user = await requireAdmin("content");
  const list = docs.list<Offer>("offer");
  const Item = z.object({ label: t(1, 30), title: t(1, 50), description: t(1, 120), href, price: z.number().int().positive(), compareAtPrice: z.number().int().positive(), image: img })
    .refine((o) => o.compareAtPrice > o.price, { message: "السعر قبل العرض يجب أن يكون أعلى", path: ["compareAtPrice"] });
  const errors: Record<string, string> = {};
  const next = list.map((o, i) => {
    const p = Item.safeParse({ label: s(d, `o.${i}.label`), title: s(d, `o.${i}.title`), description: s(d, `o.${i}.description`), href: s(d, `o.${i}.href`), price: toHalalas(d.get(`o.${i}.price`)), compareAtPrice: toHalalas(d.get(`o.${i}.compareAtPrice`)), image: s(d, `o.${i}.image`) });
    if (!p.success) for (const iss of p.error.issues) errors[`o.${i}.${iss.path.join(".")}`] = iss.message;
    return p.success ? { ...o, ...p.data, image: { ...o.image, src: p.data.image, alt: p.data.title } } : o;
  });
  if (Object.keys(errors).length) return fail("راجع الحقول", errors);
  next.forEach((o, i) => docs.put("offer", o, { sort: i }));
  audit(user, "update", "offers", undefined, `${next.length} عروض`);
  revalidatePath("/", "layout");
  return done();
}
