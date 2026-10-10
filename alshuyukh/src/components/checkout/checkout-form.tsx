"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics/track";
import { formatAmount } from "@/lib/format";
import { cartStore } from "@/lib/store/cart";
import { CITIES, shippingOptions, type ShippingMethodId } from "@/lib/checkout/shipping";
import { computeTotals, type Totals } from "@/lib/checkout/totals";
import { PAYMENT_METHODS, normalizeSaudiMobile, type PaymentMethodId } from "@/lib/checkout/fields";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type Contact = { name: string; phone: string; email: string };
type Address = { city: string; district: string; street: string; shortAddress: string; notes: string };
type CouponState = { code: string; ok: boolean; label?: string; message?: string; discount?: number } | null;

const SAVED_KEY = "alshuyukh.checkout.v1";
const sar = (n: number) => `${formatAmount(n)} ر.س`;

function loadSaved(): { contact?: Contact; address?: Address } {
  try {
    return JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function CheckoutForm({ notice }: { notice?: "failed" | "cancelled" }) {
  const lines = cartStore.useStore((s) => s.lines);
  const [hydrated, setHydrated] = useState(false);
  const [contact, setContact] = useState<Contact>({ name: "", phone: "", email: "" });
  const [address, setAddress] = useState<Address>({ city: "", district: "", street: "", shortAddress: "", notes: "" });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("mada");
  const [applePay, setApplePay] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponState>(null);
  const [serverTotals, setServerTotals] = useState<Totals | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef<string>("");
  const errorRef = useRef<HTMLDivElement>(null);

  // Restore saved details, detect Apple Pay, record checkout start.
  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
    const saved = loadSaved();
    if (saved.contact) setContact((c) => ({ ...c, ...saved.contact }));
    if (saved.address) setAddress((a) => ({ ...a, ...saved.address }));
    const w = window as unknown as { ApplePaySession?: { canMakePayments?: () => boolean } };
    const canApplePay = !!w.ApplePaySession?.canMakePayments?.();
    setApplePay(canApplePay);
    if (canApplePay) setPaymentMethod("applepay");
    setHydrated(true);
    const current = cartStore.get().lines;
    if (current.length) {
      track("begin_checkout", {
        currency: "SAR",
        value: current.reduce((n, l) => n + l.unitPrice * l.quantity, 0) / 100,
        items: current.map((l) => ({ item_id: l.productId, item_name: l.name, price: l.unitPrice / 100, quantity: l.quantity })),
      });
    }
  }, []);

  // Display totals: computed locally for instant feedback, then replaced by the server quote.
  const subtotal = useMemo(() => lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0), [lines]);
  const discount = coupon?.ok ? (coupon.discount ?? 0) : 0;
  const options = shippingOptions(address.city || undefined, subtotal - discount);
  const selectedShipping = options.find((o) => o.id === shippingMethod);
  useEffect(() => {
    if (shippingMethod === "express" && selectedShipping && !selectedShipping.available) setShippingMethod("standard");
  }, [shippingMethod, selectedShipping]);
  const localTotals = computeTotals(
    lines.map((l) => ({ productId: l.productId, name: l.name, unitPrice: l.unitPrice, quantity: l.quantity })),
    { discount, shipping: selectedShipping?.available ? selectedShipping.fee : 0 },
  );
  const totals = serverTotals ?? localTotals;

  // Authoritative quote from the server whenever inputs that affect price change.
  useEffect(() => {
    if (!lines.length) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const r = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: lines.map(({ productId, quantity }) => ({ productId, quantity })), coupon: coupon?.ok ? coupon.code : undefined, shippingMethod, city: address.city || undefined }),
          signal: ctrl.signal,
        });
        const data = await r.json();
        if (r.ok) {
          setServerTotals(data.totals);
          // Keep the cart's display prices in sync with the catalog
          const changed = data.lines.some((sl: { productId: string; unitPrice: number }) => lines.find((l) => l.productId === sl.productId)?.unitPrice !== sl.unitPrice);
          if (changed) {
            cartStore.set((s) => ({ lines: s.lines.map((l) => ({ ...l, unitPrice: data.lines.find((x: { productId: string }) => x.productId === l.productId)?.unitPrice ?? l.unitPrice })) }));
            setFormError("تم تحديث بعض الأسعار حسب الكتالوج الحالي.");
          }
        } else if (data.message) {
          setFormError(data.message);
        }
      } catch {
        /* network blip: keep local totals */
      }
    }, 250);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [lines, coupon, shippingMethod, address.city]);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    const r = await fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: lines.map(({ productId, quantity }) => ({ productId, quantity })), coupon: code, shippingMethod, city: address.city || undefined }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.coupon) return setCoupon({ code, ok: false, message: data.message ?? "تعذّر التحقق من الرمز" });
    setCoupon(data.coupon.ok ? { code: data.coupon.code, ok: true, label: data.coupon.label, discount: data.coupon.discount } : { code, ok: false, message: data.coupon.message });
    if (data.coupon.ok) setServerTotals(data.totals);
  };

  const choosePayment = (id: PaymentMethodId) => {
    setPaymentMethod(id);
    track("add_payment_info", { currency: "SAR", value: totals.total / 100, payment_type: id, items: lines.map((l) => ({ item_id: l.productId, item_name: l.name, price: l.unitPrice / 100, quantity: l.quantity })) });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (contact.name.trim().length < 2) e["contact.name"] = "اكتب اسمك";
    if (!normalizeSaudiMobile(contact.phone)) e["contact.phone"] = "رقم جوال سعودي غير صحيح (05XXXXXXXX)";
    if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email)) e["contact.email"] = "بريد غير صحيح";
    if (!address.city) e["address.city"] = "اختر المدينة";
    if (address.district.trim().length < 2) e["address.district"] = "اكتب الحي";
    if (address.street.trim().length < 3) e["address.street"] = "اكتب الشارع ورقم المبنى";
    if (address.shortAddress && !/^[A-Za-z]{4}\d{4}$/.test(address.shortAddress.trim())) e["address.shortAddress"] = "4 حروف و4 أرقام، مثل RRRD2929";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting) return;
    setFormError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError("راجع الحقول المحددة أدناه.");
      requestAnimationFrame(() => {
        errorRef.current?.focus();
        document.getElementById(Object.keys(e)[0]!.replace(".", "-"))?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          contact,
          address,
          shippingMethod,
          paymentMethod,
          coupon: coupon?.ok ? coupon.code : undefined,
          lines: lines.map(({ productId, quantity }) => ({ productId, quantity })),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.message ?? "تعذّر إتمام الطلب. راجع البيانات وحاول مرة أخرى.");
        setSubmitting(false);
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }
      try {
        window.localStorage.setItem(SAVED_KEY, JSON.stringify({ contact, address: { ...address, notes: "" } }));
      } catch {
        /* storage blocked */
      }
      window.location.assign(data.redirectUrl);
    } catch {
      setFormError("انقطع الاتصال. تحقق من الإنترنت وحاول مرة أخرى.");
      setSubmitting(false);
    }
  };

  // The cart lives in the browser. Until it's read, hold a full-height
  // placeholder so neither the form nor the empty state shifts the layout.
  if (!hydrated) {
    return <div className="min-h-[100dvh]" aria-busy="true" aria-label="جارٍ تحميل السلة" />;
  }

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center text-center">
        <Icon name="bag" size={36} className="text-gold" />
        <h1 className="mt-6 font-display text-display-sm">سلتك فارغة</h1>
        <p className="mt-3 text-ivory/60">أضف قطعك المختارة ثم عد لإتمام الطلب.</p>
        <Link href="/categories/fabrics" className={buttonClass("primary", "lg", "mt-10")}>اكتشف الأقمشة</Link>
      </div>
    );
  }

  const field = (path: string) => ({
    id: path.replace(".", "-"),
    error: errors[path],
    onInput: () => errors[path] && setErrors(({ [path]: _cleared, ...rest }) => rest),
  });
  const payments = PAYMENT_METHODS.filter((p) => p.id !== "applepay" || applePay);

  const summary = (
    <div>
      <ul className="divide-y divide-ink-line">
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-4 py-4">
            <div className="relative shrink-0">
              <Image src={l.image} alt={l.name} width={64} height={80} className="h-20 w-16 object-cover" />
              <span className="tabular absolute -end-2 -top-2 grid min-w-5 place-items-center rounded-full bg-ivory px-1 text-[0.6875rem] leading-5 text-ink">{l.quantity}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display">{l.name}</p>
              <p className="tabular text-xs text-stone">{sar(l.unitPrice)}{l.unitLabel && ` / ${l.unitLabel}`}</p>
            </div>
            <p className="tabular text-sm">{sar(l.unitPrice * l.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-ink-line pt-5">
        <label htmlFor="coupon" className="text-sm text-ivory/70">رمز الخصم</label>
        <div className="mt-2 flex gap-2">
          <input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())} dir="ltr" autoComplete="off" className="h-11 min-w-0 flex-1 border border-ink-line bg-transparent px-3 text-start uppercase text-ivory outline-none focus:border-gold" />
          <button type="button" onClick={applyCoupon} className={buttonClass("secondary", "sm", "h-11")}>تطبيق</button>
        </div>
        {coupon && <p className={cn("mt-2 text-xs", coupon.ok ? "text-gold" : "text-[#d9786b]")} role="status">{coupon.ok ? coupon.label : coupon.message}</p>}
      </div>

      <dl className="tabular mt-5 space-y-2 border-t border-ink-line pt-5 text-sm">
        <div className="flex justify-between"><dt className="text-ivory/65">المجموع</dt><dd>{sar(totals.subtotal)}</dd></div>
        {totals.discount > 0 && <div className="flex justify-between text-gold"><dt>الخصم</dt><dd>− {sar(totals.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-ivory/65">الشحن</dt><dd>{totals.shipping === 0 ? "مجاني" : sar(totals.shipping)}</dd></div>
        <div className="flex items-baseline justify-between border-t border-ink-line pt-4 text-base">
          <dt>الإجمالي</dt>
          <dd className="font-display text-2xl">{sar(totals.total)}</dd>
        </div>
        <p className="text-xs text-stone">شامل ضريبة القيمة المضافة ({sar(totals.vatIncluded)})</p>
      </dl>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-12 lg:gap-16">
      {/* Mobile: collapsible summary first */}
      <details className="group min-w-0 border-y border-ink-line lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-sm text-ivory/85"><Icon name="bag" size={18} className="text-gold" /> ملخص الطلب <span className="text-xs text-stone group-open:hidden">(عرض)</span></span>
          <span className="tabular font-display text-lg">{sar(totals.total)}</span>
        </summary>
        <div className="pb-6">{summary}</div>
      </details>

      <div className="min-w-0 space-y-12 lg:col-span-7">
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" className="outline-none">
          {notice === "failed" && !formError && <p className="border border-danger/60 bg-danger/10 p-4 text-sm">لم تكتمل عملية الدفع. لم يُخصم أي مبلغ، ويمكنك المحاولة مرة أخرى.</p>}
          {notice === "cancelled" && !formError && <p className="border border-ink-line p-4 text-sm text-ivory/75">ألغيت عملية الدفع. سلتك كما هي.</p>}
          {formError && <p role="alert" className="border border-danger/60 bg-danger/10 p-4 text-sm">{formError}</p>}
        </div>

        <Section n={1} title="بيانات التواصل">
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="الاسم" name="name" {...field("contact.name")} autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} required />
            <Field label="رقم الجوال" name="phone" {...field("contact.phone")} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="05XXXXXXXX" className="[&_input]:text-start" hint="لتأكيد الطلب وتحديثات الشحن" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} required />
            <Field label="البريد الإلكتروني (اختياري)" name="email" {...field("contact.email")} type="email" inputMode="email" autoComplete="email" dir="ltr" className="sm:col-span-2 [&_input]:text-start" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </div>
        </Section>

        <Section n={2} title="عنوان التوصيل">
          <div className="grid gap-8 sm:grid-cols-2">
            <SelectField label="المدينة" name="city" {...field("address.city")} options={CITIES} placeholder="اختر المدينة" autoComplete="address-level2" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
            <Field label="الحي" name="district" {...field("address.district")} autoComplete="address-level3" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} required />
            <Field label="الشارع ورقم المبنى" name="street" {...field("address.street")} autoComplete="address-line1" className="sm:col-span-2" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
            <Field label="العنوان الوطني المختصر (اختياري)" name="shortAddress" {...field("address.shortAddress")} dir="ltr" placeholder="RRRD2929" autoComplete="off" className="[&_input]:text-start [&_input]:uppercase" hint="يسرّع التوصيل" value={address.shortAddress} onChange={(e) => setAddress({ ...address, shortAddress: e.target.value })} />
            <Field label="ملاحظات للمندوب (اختياري)" name="notes" id="address-notes" value={address.notes} onChange={(e) => setAddress({ ...address, notes: e.target.value })} maxLength={200} />
          </div>
        </Section>

        <Section n={3} title="طريقة الشحن">
          <div role="radiogroup" aria-label="طريقة الشحن" className="grid gap-3">
            {options.map((o) => (
              <Choice key={o.id} name="shipping" checked={shippingMethod === o.id} disabled={!o.available} onChange={() => setShippingMethod(o.id)}>
                <span className="flex-1">
                  <span className="block">{o.label}</span>
                  <span className="block text-xs text-stone">{o.available ? o.eta : "متاح في الرياض وجدة والمنطقة الشرقية"}</span>
                </span>
                <span className="tabular text-sm">{o.fee === 0 ? "مجاني" : sar(o.fee)}</span>
              </Choice>
            ))}
          </div>
        </Section>

        <Section n={4} title="الدفع">
          <div role="radiogroup" aria-label="طريقة الدفع" className="grid gap-3">
            {payments.map((p) => (
              <Choice key={p.id} name="payment" checked={paymentMethod === p.id} onChange={() => choosePayment(p.id)}>
                <span className="flex-1">
                  <span className="block"><bdi dir="auto">{p.label}</bdi></span>
                  <span className="block text-xs text-stone">
                    {p.id === "tamara" ? `4 دفعات × ${sar(Math.ceil(totals.total / 4))} بدون فوائد` : p.note}
                  </span>
                </span>
              </Choice>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-stone">
            <Icon name="lock" size={14} className="mt-1 shrink-0 text-gold" />
            تُدخل بيانات البطاقة في صفحة بوابة الدفع المشفّرة مباشرة، ولا تُحفظ لدينا أبدًا.
          </p>
        </Section>

        <div className="space-y-4">
          <button type="submit" disabled={submitting || !hydrated} className={buttonClass("primary", "lg", "w-full")} data-magnetic>
            {submitting ? (
              <span className="flex items-center gap-3"><span className="size-4 animate-spin rounded-full border border-ink border-t-transparent" aria-hidden /> جارٍ تحويلك للدفع…</span>
            ) : (
              <>ادفع {sar(totals.total)}</>
            )}
          </button>
          <p className="text-center text-xs text-stone">
            بإتمام الطلب أنت توافق على <Link href="/policies/terms" className="underline underline-offset-4">الشروط والأحكام</Link> و<Link href="/policies/returns" className="underline underline-offset-4">سياسة الاسترجاع</Link>.
          </p>
        </div>
      </div>

      <aside aria-label="ملخص الطلب" className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-24 border border-ink-line p-8">
          <h2 className="mb-2 font-display text-xl">ملخص الطلب</h2>
          {summary}
        </div>
      </aside>
    </form>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-6 flex items-center gap-4 font-display text-xl">
        <span className="tabular grid size-8 place-items-center border border-gold/50 text-sm text-gold" aria-hidden="true">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Choice({ name, checked, disabled, onChange, children }: { name: string; checked: boolean; disabled?: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className={cn("flex min-h-16 cursor-pointer items-center gap-4 border px-5 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-gold-light", checked ? "border-gold bg-gold/5" : "border-ink-line hover:border-ivory/40", disabled && "cursor-not-allowed opacity-45 hover:border-ink-line")}>
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
      <span aria-hidden="true" className={cn("grid size-4 shrink-0 place-items-center rounded-full border", checked ? "border-gold" : "border-ivory/40")}>
        {checked && <span className="size-2 rounded-full bg-gold" />}
      </span>
      {children}
    </label>
  );
}
