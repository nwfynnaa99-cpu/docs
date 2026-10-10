import Link from "next/link";
import { requireAdmin } from "@/server/auth/session";
import { can } from "@/server/auth/roles";
import { dashboardStats } from "@/server/admin/stats";
import { orders } from "@/server/orders";
import { formatAmount } from "@/lib/format";
import { PageTitle } from "@/components/admin/admin-shell";
import { StatusBadge, Table } from "@/components/admin/status";

export const metadata = { title: "لوحة التحكم" };

const sar = (n: number) => `${formatAmount(n)} ر.س`;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireAdmin();
  const { denied } = await searchParams;
  const s = dashboardStats();
  const recent = can(user.role, "orders.view") ? await orders.list({ limit: 8 }) : [];

  const tiles = [
    { label: "طلبات اليوم", value: String(s.todayOrders), sub: sar(s.todayRevenue) },
    { label: "آخر 30 يومًا", value: sar(s.monthRevenue), sub: `${s.monthOrders} طلب مدفوع` },
    { label: "بانتظار التجهيز", value: String(s.toFulfil), sub: "مدفوعة ولم تُشحن", href: "/admin/orders?status=paid" },
    { label: "المنتجات", value: String(s.productCount), sub: `${s.lowStock.length} بمخزون منخفض`, href: "/admin/products" },
  ];

  return (
    <>
      {denied && <p role="alert" className="mb-6 border border-danger/60 bg-danger/10 p-4 text-sm">لا تملك صلاحية الوصول إلى تلك الصفحة.</p>}
      <PageTitle title={`أهلًا ${user.name}`} description="نظرة سريعة على المتجر" />
      <div className="grid grid-cols-2 gap-px border border-ink-line bg-ink-line lg:grid-cols-4">
        {tiles.map((t) => {
          const body = (
            <>
              <p className="text-xs text-stone">{t.label}</p>
              <p className="tabular mt-2 font-display text-2xl">{t.value}</p>
              <p className="tabular mt-1 text-xs text-ivory/55">{t.sub}</p>
            </>
          );
          return t.href ? <Link key={t.label} href={t.href} className="bg-ink p-5 hover:bg-ink-soft">{body}</Link> : <div key={t.label} className="bg-ink p-5">{body}</div>;
        })}
      </div>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 xl:grid-cols-3">
        {can(user.role, "orders.view") && (
          <section className="min-w-0 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-display">أحدث الطلبات</h2><Link href="/admin/orders" className="text-xs text-gold">كل الطلبات</Link></div>
            <Table head={["الطلب", "العميل", "المبلغ", "الحالة"]} empty={recent.length ? undefined : "لا توجد طلبات بعد."}>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} dir="ltr" className="text-gold hover:underline">{o.id}</Link></td>
                  <td className="px-4 py-3">{o.contact.name}<span className="block text-xs text-stone">{o.address.city}</span></td>
                  <td className="tabular px-4 py-3">{sar(o.totals.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </Table>
          </section>
        )}
        {can(user.role, "catalog") && (
          <section>
            <h2 className="mb-4 font-display">مخزون منخفض</h2>
            <ul className="divide-y divide-ink-line border border-ink-line">
              {s.lowStock.length === 0 && <li className="p-4 text-sm text-stone">كل المنتجات بمخزون كافٍ.</li>}
              {s.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-4 text-sm">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-gold">{p.name}</Link>
                  <span className={`tabular ${p.inventory === 0 ? "text-[#e09b90]" : "text-gold"}`}>{p.inventory === 0 ? "نفد" : p.inventory}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
