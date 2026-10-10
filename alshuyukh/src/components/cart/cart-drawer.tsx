"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { formatAmount } from "@/lib/format";
import { cart, cartStore, cartTotals, closeOverlays, ui } from "@/lib/store/cart";
import { buttonClass } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Icon } from "@/components/ui/icon";

function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const threshold = site.freeShippingThreshold * 100;
  if (!threshold) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  return (
    <div className="px-5 pt-5 md:px-8">
      <p className="text-sm text-ivory/75">
        {remaining > 0 ? (
          <>أضف <span className="tabular text-ivory">{formatAmount(remaining)} ر.س</span> ليصلك الطلب بشحن مجاني.</>
        ) : (
          <span className="text-gold">طلبك مؤهل للشحن المجاني.</span>
        )}
      </p>
      <div className="mt-3 h-px w-full bg-ink-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="التقدم نحو الشحن المجاني">
        <div className="h-px origin-right bg-gold transition-transform duration-700 ease-[var(--ease-silk)]" style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const open = ui.useStore((s) => s.cartOpen);
  const lines = cartStore.useStore((s) => s.lines);
  const { count, subtotal } = cartTotals(lines);

  // begin_checkout fires on the checkout page itself, so direct visits count too.
  const beginCheckout = closeOverlays;

  return (
    <Drawer
      open={open}
      onClose={closeOverlays}
      side="end"
      title={count ? `السلة (${count})` : "السلة"}
      footer={
        lines.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-ivory/70">الإجمالي</span>
              <span className="tabular text-xl">{formatAmount(subtotal)} <span className="text-sm text-ivory/60">ر.س</span></span>
            </div>
            <p className="text-xs text-stone">شامل ضريبة القيمة المضافة. تُحسب رسوم الشحن عند إتمام الطلب.</p>
            <Link href="/checkout" onClick={beginCheckout} className={buttonClass("primary", "lg", "w-full")} data-autofocus>
              إتمام الطلب
            </Link>
            <p className="flex items-center justify-center gap-2 text-xs text-stone"><Icon name="lock" size={14} /> دفع آمن ومشفّر</p>
          </div>
        )
      }
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <Icon name="bag" size={36} className="text-gold" />
          <p className="mt-6 font-display text-xl">سلتك بانتظار اختيارك</p>
          <p className="mt-2 text-sm text-ivory/55">ابدأ بالأقمشة الأكثر اختيارًا هذا الموسم.</p>
          <Link href="/categories/fabrics" onClick={closeOverlays} className={buttonClass("secondary", "md", "mt-8")}>اكتشف الأقمشة</Link>
        </div>
      ) : (
        <>
          <FreeShippingProgress subtotal={subtotal} />
          <ul className="divide-y divide-ink-line px-5 md:px-8">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-4 py-6">
                <Link href={`/products/${l.slug}`} onClick={closeOverlays} className="shrink-0">
                  <Image src={l.image} alt={l.name} width={96} height={120} className="h-[7.5rem] w-24 object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/products/${l.slug}`} onClick={closeOverlays} className="font-display leading-snug">{l.name}</Link>
                    <button type="button" onClick={() => cart.remove(l.productId)} className="-me-2 -mt-2 grid size-10 shrink-0 place-items-center text-ivory/45 hover:text-ivory" aria-label={`إزالة ${l.name}`}>
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                  <p className="tabular mt-1 text-sm text-ivory/55">{formatAmount(l.unitPrice)} ر.س{l.unitLabel && ` / ${l.unitLabel}`}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex h-10 items-center border border-ink-line">
                      <button type="button" onClick={() => cart.setQuantity(l.productId, l.quantity + 1)} className="grid size-10 place-items-center text-ivory/70 hover:text-ivory" aria-label="زيادة الكمية"><Icon name="plus" size={14} /></button>
                      <span className="tabular w-8 text-center text-sm" aria-live="polite">{l.quantity}</span>
                      <button type="button" onClick={() => cart.setQuantity(l.productId, l.quantity - 1)} className="grid size-10 place-items-center text-ivory/70 hover:text-ivory" aria-label="إنقاص الكمية"><Icon name="minus" size={14} /></button>
                    </div>
                    <span className="tabular">{formatAmount(l.unitPrice * l.quantity)} <span className="text-xs text-ivory/60">ر.س</span></span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Drawer>
  );
}
