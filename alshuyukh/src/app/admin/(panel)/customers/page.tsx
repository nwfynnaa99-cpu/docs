import Link from "next/link";
import { requireAdmin } from "@/server/auth/session";
import { customers } from "@/server/admin/stats";
import { formatAmount } from "@/lib/format";
import { PageTitle } from "@/components/admin/admin-shell";
import { Table } from "@/components/admin/status";

export const metadata = { title: "العملاء" };

export default async function CustomersPage() {
  await requireAdmin("customers");
  const list = customers();
  return (
    <>
      <PageTitle title="العملاء" description="مجمّعون حسب رقم الجوال من الطلبات" />
      <Table head={["العميل", "المدينة", "الطلبات", "المدفوع", "آخر طلب"]} empty={list.length ? undefined : "لا يوجد عملاء بعد."}>
        {list.map((c) => (
          <tr key={c.phone}>
            <td className="px-4 py-3">{c.name}<span className="block text-xs text-stone" dir="ltr">{c.phone}</span></td>
            <td className="px-4 py-3">{c.city}</td>
            <td className="tabular px-4 py-3"><Link href={`/admin/orders?q=${c.phone}`} className="text-gold hover:underline">{c.orders}</Link></td>
            <td className="tabular px-4 py-3">{formatAmount(c.spent)} ر.س</td>
            <td className="tabular px-4 py-3 text-xs text-stone">{new Date(c.last_order).toLocaleDateString("ar-SA-u-nu-latn-ca-gregory")}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
