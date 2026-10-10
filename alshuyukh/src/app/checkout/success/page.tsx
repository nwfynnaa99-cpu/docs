import Image from "next/image";
import { notFound } from "next/navigation";
import { orders } from "@/server/orders";
import { verifyOrderToken } from "@/server/orders/token";
import { formatAmount } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/checkout/fields";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PurchaseTracker } from "@/components/checkout/purchase-tracker";

export const dynamic = "force-dynamic";
export const metadata = { title: "تأكيد الطلب", robots: { index: false, follow: false } };

const sar = (n: number) => `${formatAmount(n)} ر.س`;
const maskPhone = (p: string) => `${p.slice(0, 3)}•••••${p.slice(-2)}`;

export default async function SuccessPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { order: id, t } = await searchParams;
  // Unknown id and bad token look the same, so order numbers can't be probed.
  if (!id || !verifyOrderToken(id, t)) notFound();
  const order = await orders.get(id);
  if (!order) notFound();

  const paid = order.status === "paid" || order.status === "fulfilled";
  const failed = order.status === "payment_failed";
  const firstName = order.contact.name.split(" ")[0];

  return (
    <div className="container-site pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className={`mx-auto grid size-16 place-items-center rounded-full border ${paid ? "border-gold text-gold" : "border-ivory/30 text-ivory/70"}`}>
            <Icon name={paid ? "gift" : "lock"} size={28} />
          </span>
          <h1 className="hero-title mt-8 font-display text-display-sm font-medium">
            {paid ? `شكرًا ${firstName}، طلبك مؤكد` : failed ? "لم تكتمل عملية الدفع" : "بانتظار تأكيد الدفع"}
          </h1>
          <p className="mt-4 text-ivory/65">
            {paid
              ? <>أرسلنا التفاصيل إلى <bdi dir="ltr">{maskPhone(order.contact.phone)}</bdi>. نجهّز طلبك الآن بعناية.</>
              : failed
                ? "لم يُخصم أي مبلغ. يمكنك المحاولة مرة أخرى بنفس السلة."
                : "نتحقق من الدفع مع البوابة. حدّث الصفحة بعد لحظات."}
          </p>
          <p className="tabular mt-6 text-sm text-stone">رقم الطلب <span dir="ltr" className="font-medium text-ivory">{order.id}</span></p>
        </div>

        <div className="mt-12 border border-ink-line p-6 md:p-8">
          <ul className="divide-y divide-ink-line">
            {order.lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-4 py-4">
                <Image src={l.image} alt="" width={56} height={70} className="h-[70px] w-14 object-cover" />
                <div className="flex-1">
                  <p className="font-display">{l.name}</p>
                  <p className="tabular text-xs text-stone">{l.quantity} {l.unitLabel} × {sar(l.unitPrice)}</p>
                </div>
                <p className="tabular text-sm">{sar(l.unitPrice * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="tabular mt-4 space-y-2 border-t border-ink-line pt-4 text-sm">
            {order.totals.discount > 0 && <div className="flex justify-between text-gold"><dt>الخصم {order.coupon && `(${order.coupon})`}</dt><dd>− {sar(order.totals.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ivory/65">الشحن</dt><dd>{order.totals.shipping ? sar(order.totals.shipping) : "مجاني"}</dd></div>
            <div className="flex justify-between text-base"><dt>الإجمالي</dt><dd className="font-display text-xl">{sar(order.totals.total)}</dd></div>
          </dl>
          <div className="mt-6 grid gap-6 border-t border-ink-line pt-6 text-sm sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-2">التوصيل إلى</p>
              <p className="text-ivory/80">{order.address.city}، {order.address.district}</p>
              <p className="text-xs text-stone">{order.shippingMethod === "express" ? "توصيل سريع خلال 24 ساعة" : "توصيل عادي خلال 2–4 أيام عمل"}</p>
            </div>
            <div>
              <p className="eyebrow mb-2">الدفع</p>
              <p className="text-ivory/80">{PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {failed ? <ButtonLink href="/checkout" size="lg">إعادة المحاولة</ButtonLink> : <ButtonLink href="/categories/fabrics" size="lg">متابعة التسوق</ButtonLink>}
          <a href={`https://wa.me/966500000000?text=${encodeURIComponent(`استفسار عن الطلب ${order.id}`)}`} rel="noopener" className="inline-flex h-14 items-center px-6 text-sm text-ivory/70 underline underline-offset-8 hover:text-ivory">تواصل معنا بخصوص الطلب</a>
        </div>
      </div>

      {paid && (
        <PurchaseTracker
          order={{
            id: order.id,
            total: order.totals.total,
            shipping: order.totals.shipping,
            tax: order.totals.vatIncluded,
            coupon: order.coupon,
            items: order.lines.map((l) => ({ item_id: l.productId, item_name: l.name, price: l.unitPrice / 100, quantity: l.quantity })),
          }}
        />
      )}
    </div>
  );
}
