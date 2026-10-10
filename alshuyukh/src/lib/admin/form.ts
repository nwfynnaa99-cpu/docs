import type { z } from "zod";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> } | null;

/** Turns a zod error into { "field.path": "message" } for inline display. */
export const fieldErrors = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [i.path.join("."), i.message]));

export const fail = (message: string, errors?: Record<string, string>): FormState => ({ ok: false, message, errors });
export const done = (message = "تم الحفظ"): FormState => ({ ok: true, message });

/** SAR string ("189.50") → halalas. Returns NaN for invalid input so zod can reject it. */
export const toHalalas = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/,/g, "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
};
export const fromHalalas = (n?: number | null) => (n == null ? "" : (n / 100).toFixed(2).replace(/\.00$/, ""));

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
