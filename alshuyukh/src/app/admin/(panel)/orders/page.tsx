import Link from "next/link";
import { requireAdmin } from "@/server/auth/session";
import { orders, type OrderStatus } from "@/server/orders";
import { formatAmount } from "@/lib/format";
import { PageTitle } from "@/components/admin/admin-shell";
import { StatusBadge, STATUS_LABELS, Table } from "@/components/admin/status";

export const metadata = { title: "الطلبات" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin("orders.view");
  const sp = await searchParams;
  const status = sp.status && sp.status in STATUS_LABELS ? (sp.status as OrderStatus) : undefined;
  let list = await orders.list({ status, limit: 500 });
  const q = sp.q?.trim().toUpperCase();
  if (q) list = list.filter((o) => o.id.includes(q) || o.contact.phone.includes(q.replace(/\D/g, "")) || o.contact.name.toUpperCase().includes(q));
  const fmt = new Intl.DateTimeFormat("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" });

  return (
    <>
      <PageTitle title="الطلبات" description={`${list.length} طلب`} />
      <nav className="mb-4 flex flex-wrap gap-2 text-xs" aria-label="تصفية حسب الحالة">
        {[["", "الكل"], ...Object.entries(STATUS_LABELS)].map(([k, v]) => (
          <Link key={k} href={k ? `/admin/orders?status=${k}` : "/admin/orders"} aria-current={(status ?? "") === k ? "page" : undefined} className={`inline-flex h-9 items-center border px-3 ${(status ?? "") === k ? "border-gold text-ivory" : "border-ink-line text-ivory/65 hover:text-ivory"}`}>{v}</Link>
        ))}
      </nav>
      <form className="mb-6" role="search">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={sp.q} placeholder="رقم الطلب أو الجوال أو الاسم" aria-label="بحث" className="h-10 w-full max-w-md border border-ink-line bg-ink-deep px-3 text-sm outline-none focus:border-gold" />
      </form>
      <Table head={["الطلب", "التاريخ", "العميل", "المبلغ", "الحالة"]} empty={list.length ? undefined : "لا توجد طلبات مطابقة."}>
        {list.map((o) => (
          <tr key={o.id}>
            <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} dir="ltr" className="text-gold hover:underline">{o.id}</Link></td>
            <td className="tabular px-4 py-3 text-xs text-stone">{fmt.format(new Date(o.createdAt))}</td>
            <td className="px-4 py-3">{o.contact.name}<span className="block text-xs text-stone" dir="ltr">{o.contact.phone}</span></td>
            <td className="tabular px-4 py-3">{formatAmount(o.totals.total)} ر.س</td>
            <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
