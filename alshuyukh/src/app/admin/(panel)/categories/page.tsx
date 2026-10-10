import Link from "next/link";
import { requireAdmin } from "@/server/auth/session";
import { docs } from "@/server/db/docs";
import type { Category, Product } from "@/server/catalog/types";
import { PageTitle } from "@/components/admin/admin-shell";
import { Table } from "@/components/admin/status";

export const metadata = { title: "الأقسام" };

export default async function CategoriesPage() {
  await requireAdmin("catalog");
  const cats = docs.list<Category>("category");
  const products = docs.list<Product>("product");
  const ordered = cats.filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder).flatMap((r) => [r, ...cats.filter((c) => c.parentId === r.id).sort((a, b) => a.sortOrder - b.sortOrder)]);
  return (
    <>
      <PageTitle title="الأقسام" description="الترتيب يتحكم في ظهورها بالقوائم" action={<Link href="/admin/categories/new" className="inline-flex h-10 items-center bg-gold px-5 text-sm text-ink hover:bg-gold-light">+ قسم جديد</Link>} />
      <Table head={["القسم", "الرابط", "المنتجات", "الترتيب", ""]}>
        {ordered.map((c) => (
          <tr key={c.id}>
            <td className={`px-4 py-3 ${c.parentId ? "ps-10 text-ivory/80" : "font-medium"}`}>{c.parentId && "— "}{c.name}</td>
            <td className="px-4 py-3 text-xs text-stone" dir="ltr">/categories/{c.slug}</td>
            <td className="tabular px-4 py-3">{products.filter((p) => p.categoryIds.includes(c.id)).length}</td>
            <td className="tabular px-4 py-3">{c.sortOrder}</td>
            <td className="px-4 py-3 text-end"><Link href={`/admin/categories/${c.id}`} className="text-xs text-ivory/70 hover:text-ivory">تعديل</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
