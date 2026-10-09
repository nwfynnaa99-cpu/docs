"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics/track";
import { formatAmount } from "@/lib/format";
import { closeOverlays, ui } from "@/lib/store/cart";
import { Icon } from "@/components/ui/icon";
import { Drawer } from "@/components/ui/drawer";

type Result = {
  products: { id: string; slug: string; name: string; price: number; image: string; category: string }[];
  categories: { slug: string; name: string }[];
  suggestions: string[];
};

const popular = ["ياباني", "صيفي", "صوف شتوي", "قطن", "شماغ", "بوكس هدية"];

export function SearchOverlay() {
  const open = ui.useStore((s) => s.searchOpen);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, Result>());

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setRes(null);
      return;
    }
    const hit = cache.current.get(term);
    if (hit) {
      setRes(hit);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!r.ok) throw new Error(String(r.status));
        const data = (await r.json()) as Result;
        cache.current.set(term, data);
        setRes(data);
        track("search", { search_term: term });
      } catch {
        /* aborted or offline — keep last results */
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  const close = closeOverlays;

  return (
    <Drawer open={open} onClose={close} side="top" title="البحث" className="min-h-[60dvh] md:min-h-[70vh]">
      <div className="container-site py-6 md:py-10">
        <form role="search" action="/search" onSubmit={(e) => { if (!q.trim()) e.preventDefault(); }} className="flex items-center gap-4 border-b border-ivory/25 focus-within:border-gold">
          <Icon name="search" size={26} className="shrink-0 text-gold" />
          <label htmlFor="site-search" className="sr-only">ابحث في الشيوخ</label>
          <input
            id="site-search"
            name="q"
            data-autofocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="ابحث عن قماش، لون، موسم…"
            className="h-16 w-full bg-transparent font-display text-xl text-ivory outline-none placeholder:text-ivory/30 md:h-20 md:text-3xl"
          />
          {loading && <span className="size-4 shrink-0 animate-spin rounded-full border border-gold border-t-transparent" aria-hidden />}
        </form>

        {!res ? (
          <div className="mt-8">
            <p className="eyebrow mb-4">عمليات بحث شائعة</p>
            <div className="flex flex-wrap gap-2">
              {popular.map((p) => (
                <button key={p} type="button" onClick={() => setQ(p)} className="h-10 border border-ink-line px-4 text-sm text-ivory/75 transition-colors hover:border-gold hover:text-ivory">{p}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-[14rem_1fr]" aria-live="polite">
            <div className="space-y-8">
              {res.categories.length > 0 && (
                <section>
                  <p className="eyebrow mb-3">التصنيفات</p>
                  <ul>{res.categories.map((c) => <li key={c.slug}><Link href={`/categories/${c.slug}`} onClick={close} className="flex h-10 items-center text-ivory/80 hover:text-ivory">{c.name}</Link></li>)}</ul>
                </section>
              )}
              {res.suggestions.length > 0 && (
                <section>
                  <p className="eyebrow mb-3">اقتراحات</p>
                  <ul>{res.suggestions.map((s) => <li key={s}><button type="button" onClick={() => setQ(s)} className="flex h-10 items-center text-ivory/60 hover:text-ivory">{s}</button></li>)}</ul>
                </section>
              )}
            </div>
            <section className="max-md:order-first">
              <p className="eyebrow mb-3">المنتجات</p>
              {res.products.length === 0 ? (
                <p className="text-ivory/60">لم نجد نتائج لـ «{q}». جرّب كلمة أخرى أو تصفح الأقمشة.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {res.products.map((p) => (
                    <li key={p.id}>
                      <Link href={`/products/${p.slug}`} onClick={close} className="group block">
                        <div className="overflow-hidden"><Image src={p.image} alt={p.name} width={320} height={400} sizes="(min-width:1024px) 15vw, 45vw" className="zoom-on-hover aspect-[4/5] w-full object-cover" /></div>
                        <p className="mt-3 font-display">{p.name}</p>
                        <p className="tabular text-sm text-ivory/55">{formatAmount(p.price)} ر.س · {p.category}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </Drawer>
  );
}
