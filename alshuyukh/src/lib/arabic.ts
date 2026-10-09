/**
 * Normalizes Arabic text for matching: removes diacritics and tatweel,
 * unifies alef/ya/ta-marbuta forms, and lowercases Latin.
 * "يابانية" and "ياباني" both normalize to a common stem prefix.
 */
export function normalizeArabic(input: string) {
  return input
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strips common Arabic affixes so "الأقمشة اليابانية" matches "ياباني". */
export function stemArabic(word: string) {
  let w = normalizeArabic(word);
  if (w.startsWith("ال") && w.length > 4) w = w.slice(2);
  if (w.endsWith("يه") && w.length > 4) w = w.slice(0, -1);
  if (w.endsWith("ه") && w.length > 4) w = w.slice(0, -1);
  return w;
}
