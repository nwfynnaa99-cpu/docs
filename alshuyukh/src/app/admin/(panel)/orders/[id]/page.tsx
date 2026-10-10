import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth/session";
import { can } from "@/server/auth/roles";
import { orders } from "@/server/orders";
import { formatAmount } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/checkout/fields";
import { PageTitle } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status";
import { AdminForm } from "@/components/admin/admin-form";
import { setOrderStatus } from "../actions";

export const metadata = { title: "تفاصيل الطلب" };
const sar = (n: number) => `${formatAmount(n)} ر.س`;

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin("orders.view");
  const { id } = await params;
  const o = await orders.get(id);
  if (!o) notFound();
  const manage = can(user.role, "orders.manage");
  const fmt = new Intl.DateTimeFormat("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Riyadh" });
  const wa = `https://wa.me/966${o.contact.phone.slice(1)}?text=${encodeURIComponent(`مرحبًا ${o.contact.name}، بخصوص طلبك ${o.id} من الشيوخ`)}`;

  return (
    <>
      <PageTitle title={`الطلب ${o.id}`} description={fmt.format(new Date(o.createdAt))} action={<StatusBadge status={o.status} />} />
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="border border-ink-line p-5 lg:col-span-2">
          <h2 className="mb-4 font-display">المنتجات</h2>
          <ul className="divide-y divide-ink-line">
            {o.lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-4 py-3 text-sm">
                <Image src={l.image} alt="" width={48} height={60} className="h-[60px] w-12 object-cover" />
                <div className="flex-1">{l.name}<span className="tabular block text-xs text-stone">{l.quantity} {l.unitLabel} × {sar(l.unitPrice)}</span></div>
                <span className="tabular">{sar(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="tabular mt-4 space-y-1.5 border-t border-ink-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-stone">المجموع</dt><dd>{sar(o.totals.subtotal)}</dd></div>
            {o.totals.discount > 0 && <div className="flex justify-between text-gold"><dt>الخصم ({o.coupon})</dt><dd>− {sar(o.totals.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-stone">الشحن ({o.shippingMethod === "express" ? "سريع" : "عادي"})</dt><dd>{o.totals.shipping ? sar(o.totals.shipping) : "مجاني"}</dd></div>
            <div className="flex justify-between font-medium"><dt>الإجمالي</dt><dd>{sar(o.totals.total)}</dd></div>
            <div className="flex justify-between text-xs text-stone"><dt>منها ضريبة القيمة المضافة</dt><dd>{sar(o.totals.vatIncluded)}</dd></div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="border border-ink-line p-5 text-sm">
            <h2 className="mb-3 font-display">العميل</h2>
            <p>{o.contact.name}</p>
            <p className="text-stone" dir="ltr" style={{ textAlign: "start" }}>{o.contact.phone}</p>
            {o.contact.email && <p className="text-stone" dir="ltr" style={{ textAlign: "start" }}>{o.contact.email}</p>}
            <a href={wa} target="_blank" rel="noopener" className="mt-3 inline-block text-xs text-gold">مراسلة عبر واتساب ↗</a>
          </section>
          <section className="border border-ink-line p-5 text-sm">
            <h2 className="mb-3 font-display">التوصيل</h2>
            <p>{o.address.city}، {o.address.district}</p>
            <p className="text-ivory/75">{o.address.street}</p>
            {o.address.shortAddress && <p className="text-stone" dir="ltr" style={{ textAlign: "start" }}>{o.address.shortAddress}</p>}
            {o.address.notes && <p className="mt-2 text-xs text-stone">ملاحظة: {o.address.notes}</p>}
          </section>
          <section className="border border-ink-line p-5 text-sm">
            <h2 className="mb-3 font-display">الدفع</h2>
            <p>{PAYMENT_METHODS.find((m) => m.id === o.paymentMethod)?.label}</p>
            {o.payment?.reference && <p className="text-xs text-stone" dir="ltr" style={{ textAlign: "start" }}>{o.payment.provider} · {o.payment.reference}</p>}
            {o.payment?.failureReason && <p className="text-xs text-[#e09b90]">{o.payment.failureReason}</p>}
          </section>
          {manage && (
            <section className="space-y-3 border border-ink-line p-5">
              <h2 className="font-display">الإجراءات</h2>
              {o.status === "paid" && <AdminForm action={setOrderStatus.bind(null, o.id, "fulfilled")} submitLabel="تم الشحن"><></></AdminForm>}
              {o.status !== "cancelled" && (
                <AdminForm action={setOrderStatus.bind(null, o.id, "cancelled")} submitLabel="إلغاء الطلب" danger confirm={o.status === "paid" || o.status === "fulfilled" ? "إلغاء طلب مدفوع: يُعاد المخزون. تذكّر استرداد المبلغ من بوابة الدفع. متابعة؟" : "إلغاء الطلب؟"}>
                  <></>
                </AdminForm>
              )}
              <p className="text-xs text-stone">حالة الدفع تتحدث تلقائيًا من بوابة الدفع.</p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
