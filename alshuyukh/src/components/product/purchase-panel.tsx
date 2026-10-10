"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics/track";
import { formatAmount } from "@/lib/format";
import { cart, toggleWishlist, wishlistStore } from "@/lib/store/cart";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type PurchaseProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  unit: "piece" | "meter" | "set";
  inStock: boolean;
  category?: string;
};

const unitLabel = { meter: "متر", piece: "قطعة", set: "طقم" } as const;
// One thobe needs roughly 3.5–4 m of 150 cm fabric; default to a full thobe.
const defaultQty = (unit: PurchaseProduct["unit"]) => (unit === "meter" ? 4 : 1);
const MAX = 20;

export function PurchasePanel({ product }: { product: PurchaseProduct }) {
  const router = useRouter();
  const [qty, setQty] = useState(defaultQty(product.unit));
  const [showBar, setShowBar] = useState(false);
  const actions = useRef<HTMLDivElement>(null);
  const saved = wishlistStore.useStore((s) => s.ids.includes(product.id));

  useEffect(() => {
    track("view_item", {
      currency: "SAR",
      value: product.price / 100,
      items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price / 100 }],
    });
  }, [product]);

  // Sticky mobile bar appears once the main buttons scroll out of view
  useEffect(() => {
    const el = actions.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!!e && !e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const line = { productId: product.id, slug: product.slug, name: product.name, unitPrice: product.price, image: product.image, unitLabel: unitLabel[product.unit] };
  const addToCart = () => cart.add(line, qty);
  const buyNow = () => {
    cart.add(line, qty, { openDrawer: false });
    router.push("/checkout");
  };

  const unit = unitLabel[product.unit];
  const total = product.price * qty;

  return (
    <>
      <div ref={actions} className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <label htmlFor="qty" className="mb-2 block text-sm text-ivory/70">الكمية {product.unit === "meter" && <span className="text-stone">(بالمتر)</span>}</label>
            <div className="flex h-12 items-center border border-ink-line">
              <button type="button" onClick={() => setQty((q) => Math.min(MAX, q + 1))} className="grid size-12 place-items-center text-ivory/70 hover:text-ivory" aria-label="زيادة الكمية"><Icon name="plus" size={16} /></button>
              <input
                id="qty"
                inputMode="numeric"
                value={qty}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^\d]/g, ""));
                  setQty(Number.isFinite(n) ? Math.max(1, Math.min(MAX, n)) : 1);
                }}
                className="tabular h-12 w-12 bg-transparent text-center text-base outline-none"
                aria-describedby="qty-total"
              />
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-12 place-items-center text-ivory/70 hover:text-ivory" aria-label="إنقاص الكمية"><Icon name="minus" size={16} /></button>
            </div>
          </div>
          <p id="qty-total" className="tabular pb-3 text-sm text-ivory/60" aria-live="polite">
            {qty} {unit} · <span className="text-ivory">{formatAmount(total)} ر.س</span>
          </p>
        </div>

        {product.inStock ? (
          <div className="grid gap-3">
            <button type="button" onClick={addToCart} className={buttonClass("primary", "lg", "w-full")} data-magnetic>
              أضف للسلة
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={buyNow} className={buttonClass("secondary", "lg", "flex-1")}>شراء الآن</button>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-pressed={saved}
                aria-label={saved ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
                className={cn("grid size-14 shrink-0 place-items-center border border-ivory/30 transition-colors hover:border-ivory", saved && "border-gold text-gold")}
              >
                <Icon name="heart" fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-ink-line p-5 text-center">
            <p className="font-display">نفدت الكمية حاليًا</p>
            <p className="mt-1 text-sm text-ivory/55">نعيد توفيره قريبًا. أضفه للمفضلة لتجده بسهولة.</p>
            <button type="button" onClick={() => toggleWishlist(product)} className={buttonClass("secondary", "md", "mt-4")} aria-pressed={saved}>
              {saved ? "في المفضلة" : "أضف للمفضلة"}
            </button>
          </div>
        )}
      </div>

      {/* Sticky mobile purchase bar */}
      {product.inStock && (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 border-t border-ink-line bg-ink/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-500 ease-[var(--ease-silk)] md:hidden",
            showBar ? "translate-y-0" : "translate-y-full",
          )}
          aria-hidden={!showBar}
          inert={!showBar}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{product.name}</p>
              <p className="tabular text-xs text-ivory/60">{qty} {unit} · {formatAmount(total)} ر.س</p>
            </div>
            <button type="button" onClick={addToCart} className={buttonClass("primary", "md")}>أضف للسلة</button>
          </div>
        </div>
      )}
    </>
  );
}
