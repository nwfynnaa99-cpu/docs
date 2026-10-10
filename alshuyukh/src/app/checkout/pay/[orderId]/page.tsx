import { notFound } from "next/navigation";
import { orders } from "@/server/orders";
import { paymentGateway } from "@/server/payments";
import { formatAmount } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/checkout/fields";
import { MockPayButtons } from "@/components/checkout/mock-pay-buttons";

export const dynamic = "force-dynamic";
export const metadata = { title: "بوابة الدفع التجريبية", robots: { index: false, follow: false } };

/** Stands in for the gateway's hosted payment page. Only exists with PAYMENT_PROVIDER=mock. */
export default async function MockGatewayPage({ params }: { params: Promise<{ orderId: string }> }) {
  if (paymentGateway().id !== "mock") notFound();
  const { orderId } = await params;
  const order = await orders.get(decodeURIComponent(orderId));
  if (!order) notFound();
  const method = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label;

  return (
    <div className="container-site flex min-h-[80dvh] items-center justify-center pb-16 pt-28">
      <div className="w-full max-w-md border border-dashed border-gold/50 p-8 text-center">
        <p className="eyebrow">بيئة التطوير</p>
        <h1 className="mt-3 font-display text-2xl">بوابة دفع تجريبية</h1>
        <p className="mt-3 text-sm leading-7 text-ivory/60">
          هذه الصفحة مكان صفحة بوابة الدفع الحقيقية (مثل Moyasar أو Tap). لا تُدخل أي بيانات بطاقة هنا.
        </p>
        <dl className="tabular mt-8 space-y-2 border-y border-ink-line py-5 text-sm">
          <div className="flex justify-between"><dt className="text-stone">رقم الطلب</dt><dd dir="ltr">{order.id}</dd></div>
          <div className="flex justify-between"><dt className="text-stone">طريقة الدفع</dt><dd>{method}</dd></div>
          <div className="flex justify-between"><dt className="text-stone">المبلغ</dt><dd className="font-display text-lg">{formatAmount(order.totals.total)} ر.س</dd></div>
        </dl>
        <MockPayButtons orderId={order.id} />
      </div>
    </div>
  );
}
