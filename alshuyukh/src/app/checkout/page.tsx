import { buildMetadata } from "@/lib/seo";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = buildMetadata({ title: "إتمام الطلب", path: "/checkout", noindex: true });

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const notice = sp.failed ? "failed" : sp.cancelled ? "cancelled" : undefined;
  return (
    <div className="container-site pb-24 pt-24 md:pt-32">
      <h1 className="sr-only">إتمام الطلب</h1>
      <CheckoutForm notice={notice} />
    </div>
  );
}
