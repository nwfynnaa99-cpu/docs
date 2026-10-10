"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Media } from "@/server/catalog/types";
import { useFieldError } from "./admin-form";

/**
 * Manages a product's images: upload (re-encoded server-side), pick from
 * the library, set alt text, attach a macro close-up, reorder, remove.
 * Serializes to a hidden `images` JSON field read by the server action.
 */
export function ImagePicker({ initial, library, defaultAlt }: { initial: Media[]; library: { src: string; macro?: string }[]; defaultAlt: string }) {
  const [images, setImages] = useState<Media[]>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const error = useFieldError("images");

  const upload = async (file: File, macro = false) => {
    setBusy(true);
    setMessage(null);
    const body = new FormData();
    body.append("file", file);
    if (macro) body.append("macro", "1");
    try {
      const r = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message ?? "فشل الرفع");
      return data as { src: string; width: number; height: number };
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "فشل الرفع");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const update = (i: number, patch: Partial<Media>) => setImages((list) => list.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const move = (i: number, d: -1 | 1) => setImages((list) => {
    const next = [...list];
    const [m] = next.splice(i, 1);
    next.splice(Math.max(0, Math.min(next.length, i + d)), 0, m!);
    return next;
  });

  return (
    <div className="space-y-4">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((m, i) => (
          <li key={m.src + i} className="border border-ink-line p-3">
            <div className="flex gap-3">
              <Image src={m.src} alt="" width={80} height={100} className="h-24 w-20 shrink-0 object-cover" />
              <div className="min-w-0 flex-1 space-y-2 text-xs">
                <p className="text-stone">{i === 0 ? "الصورة الرئيسية" : `صورة ${i + 1}`}</p>
                <input aria-label="النص البديل للصورة" value={m.alt} onChange={(e) => update(i, { alt: e.target.value })} placeholder="وصف الصورة" className="h-9 w-full border border-ink-line bg-ink-deep px-2 text-ivory outline-none focus:border-gold" />
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-ivory/70 disabled:opacity-30">تقديم</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="text-ivory/70 disabled:opacity-30">تأخير</button>
                  <label className="cursor-pointer text-ivory/70">
                    {m.macro ? "تغيير صورة النسيج" : "+ صورة النسيج المقرّبة"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) { const up = await upload(f, true); if (up) update(i, { macro: up.src }); }
                      e.target.value = "";
                    }} />
                  </label>
                  <button type="button" onClick={() => setImages((l) => l.filter((_, j) => j !== i))} className="text-[#e09b90]">حذف</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex h-10 items-center border border-ivory/30 px-4 text-sm hover:border-ivory disabled:opacity-50">
          {busy ? "جارٍ الرفع…" : "رفع صورة"}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) { const up = await upload(f); if (up) setImages((l) => [...l, { ...up, alt: defaultAlt }]); }
          e.target.value = "";
        }} />
        <button type="button" onClick={() => setShowLibrary((s) => !s)} className="inline-flex h-10 items-center px-2 text-sm text-ivory/70 underline underline-offset-4">
          {showLibrary ? "إخفاء المكتبة" : "اختيار من المكتبة"}
        </button>
        <span className="text-xs text-stone">JPG / PNG / WebP / AVIF حتى 8 ميجابايت. تُحوَّل تلقائيًا إلى WebP.</span>
      </div>
      {message && <p role="alert" className="text-xs text-[#e09b90]">{message}</p>}
      {error && <p className="text-xs text-[#e09b90]">{error}</p>}

      {showLibrary && (
        <ul className="grid grid-cols-4 gap-2 border border-ink-line p-3 sm:grid-cols-6 lg:grid-cols-8">
          {library.map(({ src, macro }) => (
            <li key={src}>
              <button type="button" onClick={() => setImages((l) => [...l, { src, alt: defaultAlt, width: 1200, height: 1500, macro }])} className="block w-full border border-transparent hover:border-gold" aria-label={`إضافة ${src}`}>
                <Image src={src} alt="" width={96} height={120} className="aspect-[4/5] w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
