"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics/track";
import {
  FACETS,
  PRICE_BUCKETS,
  SORTS,
  activeFilterCount,
  applyListing,
  emptyState,
  facetValues,
  parseState,
  serializeState,
  type FacetKey,
  type ListingItem,
  type ListingState,
  type SortId,
} from "@/lib/catalog/listing";
import { Button, buttonClass } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { countLabel } from "@/lib/format";

const PAGE = 12;

/**
 * Filters and sorts server-rendered product cards in the browser.
 * Cards arrive as RSC nodes, so the client only toggles visibility and
 * CSS order: no card markup or images are re-rendered, and the page stays
 * statically cacheable. State is mirrored to the URL for sharing/back.
 */
export function CategoryBrowser({ listId, listName, items, cards }: {
  listId: string;
  listName: string;
  items: ListingItem[];
  cards: Record<string, ReactNode>;
}) {
  const [state, setState] = useState<ListingState>(emptyState);
  const [limit, setLimit] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hydrated = useRef(false);

  // Read the URL once on mount (avoids useSearchParams, which would opt the page out of static rendering).
  useEffect(() => {
    setState(parseState(new URLSearchParams(window.location.search)));
    hydrated.current = true;
    track("view_category", {
      item_list_id: listId,
      item_list_name: listName,
      items: items.slice(0, 20).map((i, index) => ({ item_id: i.id, item_name: i.name, price: i.price / 100, index })),
    });
    const onPop = () => setState(parseState(new URLSearchParams(window.location.search)));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const next = `${window.location.pathname}${serializeState(state)}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", next);
  }, [state]);

  const ordered = useMemo(() => applyListing(items, state), [items, state]);
  const position = useMemo(() => new Map(ordered.map((id, i) => [id, i])), [ordered]);
  const facets = useMemo(() => facetValues(items), [items]);
  const filterCount = activeFilterCount(state);
  const shown = Math.min(limit, ordered.length);

  const update = (patch: Partial<ListingState>) => {
    setState((s) => ({ ...s, ...patch }));
    setLimit(PAGE);
  };
  const toggle = (key: FacetKey | "price", value: string) =>
    update({ [key]: state[key].includes(value) ? state[key].filter((v) => v !== value) : [...state[key], value] } as Partial<ListingState>);

  const chips: { label: string; remove: () => void }[] = [
    ...FACETS.flatMap(({ key }) => state[key].map((v) => ({ label: v, remove: () => toggle(key, v) }))),
    ...state.price.map((id) => ({ label: PRICE_BUCKETS.find((b) => b.id === id)?.label ?? id, remove: () => toggle("price", id) })),
    ...(state.inStock ? [{ label: "المتوفر فقط", remove: () => update({ inStock: false }) }] : []),
  ];

  return (
    <section aria-labelledby={`${listId}-products`}>
      <h2 id={`${listId}-products`} className="sr-only">المنتجات</h2>
      {/* Toolbar */}
      <div className="sticky top-16 z-30 -mx-[var(--spacing-gutter)] border-y border-ink-line bg-ink/90 px-[var(--spacing-gutter)] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-3 md:h-16">
          <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex h-11 items-center gap-2 text-sm text-ivory/85 hover:text-ivory">
            <Icon name="menu" size={18} className="text-gold" />
            تصفية
            {filterCount > 0 && <span className="tabular grid min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[0.6875rem] leading-5 font-semibold text-ink">{filterCount}</span>}
          </button>
          <p className="tabular text-xs text-stone max-xs:hidden" aria-live="polite">{countLabel(ordered.length)}</p>
          <label className="relative inline-flex h-11 items-center gap-2 text-sm text-ivory/85">
            <span className="sr-only md:not-sr-only md:text-stone">ترتيب حسب</span>
            <select
              value={state.sort}
              onChange={(e) => update({ sort: e.target.value as SortId })}
              className="h-11 cursor-pointer appearance-none bg-transparent pe-6 ps-0 text-ivory outline-none focus-visible:outline-1 focus-visible:outline-gold-light"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id} className="bg-ink">{s.label}</option>)}
            </select>
            <Icon name="chevron" size={14} className="pointer-events-none absolute end-0 -rotate-90 text-gold" />
          </label>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="الفلاتر المفعّلة">
          {chips.map((c) => (
            <li key={c.label}>
              <button type="button" onClick={c.remove} className="inline-flex h-9 items-center gap-2 border border-gold/40 px-3 text-xs text-ivory/85 hover:border-gold" aria-label={`إزالة ${c.label}`}>
                {c.label} <Icon name="close" size={12} />
              </button>
            </li>
          ))}
          <li><button type="button" onClick={() => update({ ...emptyState(), sort: state.sort })} className="inline-flex h-9 items-center px-2 text-xs text-stone underline underline-offset-4 hover:text-ivory">مسح الكل</button></li>
        </ul>
      )}

      {/* Grid: server-rendered cards, reordered with CSS order */}
      {ordered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-xl">لا توجد منتجات تطابق اختيارك</p>
          <p className="mt-2 text-sm text-ivory/55">جرّب إزالة بعض الفلاتر.</p>
          <Button variant="secondary" className="mt-8" onClick={() => update({ ...emptyState(), sort: state.sort })}>مسح الفلاتر</Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-12 md:mt-10 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((i) => {
            const pos = position.get(i.id);
            const visible = pos !== undefined && pos < shown;
            return (
              <div key={i.id} style={{ order: pos ?? 9999 }} hidden={!visible} className="flex">
                {cards[i.id]}
              </div>
            );
          })}
        </div>
      )}

      {shown < ordered.length && (
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="tabular text-xs text-stone">عرض {shown} من {ordered.length}</p>
          <div className="h-px w-40 bg-ink-line"><div className="h-px bg-gold" style={{ width: `${(shown / ordered.length) * 100}%` }} /></div>
          <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>عرض المزيد</Button>
        </div>
      )}

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="start"
        title="تصفية المنتجات"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setFiltersOpen(false)} className={buttonClass("primary", "lg", "flex-1")} data-autofocus>
              {ordered.length ? `عرض ${countLabel(ordered.length)}` : "لا توجد نتائج"}
            </button>
            <button type="button" onClick={() => update({ ...emptyState(), sort: state.sort })} className={buttonClass("ghost", "lg")} disabled={!filterCount}>
              مسح
            </button>
          </div>
        }
      >
        <div className="divide-y divide-ink-line px-5 md:px-8">
          {FACETS.map(({ key, label }) =>
            facets[key].length > 1 ? (
              <div key={key} role="group" aria-labelledby={`facet-${key}`} className="py-6">
                <p id={`facet-${key}`} className="mb-4 font-display text-lg">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {facets[key].map((f) => (
                    <FilterChip key={f.value} checked={state[key].includes(f.value)} onChange={() => toggle(key, f.value)} label={f.value} count={f.count} />
                  ))}
                </div>
              </div>
            ) : null,
          )}
          <div role="group" aria-labelledby="facet-price" className="py-6">
            <p id="facet-price" className="mb-4 font-display text-lg">السعر</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_BUCKETS.map((b) => (
                <FilterChip key={b.id} checked={state.price.includes(b.id)} onChange={() => toggle("price", b.id)} label={b.label} />
              ))}
            </div>
          </div>
          <div className="py-6">
            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
              <span className="font-display text-lg">المتوفر فقط</span>
              <input type="checkbox" checked={state.inStock} onChange={(e) => update({ inStock: e.target.checked })} className="peer sr-only" />
              <span aria-hidden="true" className="relative h-6 w-11 shrink-0 border border-ivory/30 transition-colors peer-checked:border-gold peer-checked:bg-gold/20 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-gold-light">
                <span className={cn("absolute top-1/2 size-4 -translate-y-1/2 bg-ivory/70 transition-[inset-inline-start,background-color] duration-300", state.inStock ? "start-[calc(100%-1.25rem)] bg-gold" : "start-1")} />
              </span>
            </label>
          </div>
        </div>
      </Drawer>
    </section>
  );
}

function FilterChip({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className={cn("inline-flex h-11 cursor-pointer items-center gap-2 border px-4 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-gold-light", checked ? "border-gold bg-gold/10 text-ivory" : "border-ink-line text-ivory/75 hover:border-ivory/40")}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
      {count !== undefined && <span className="tabular text-xs text-stone">{count}</span>}
    </label>
  );
}
