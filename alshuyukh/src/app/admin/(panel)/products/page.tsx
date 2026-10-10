import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/server/auth/session";
import { docs } from "@/server/db/docs";
import type { Category, Product } from "@/server/catalog/types";
import { normalizeArabic } from "@/lib/arabic";
import { formatAmount, discountPercent } from "@/lib/format";
import { PageTitle } from "@/components/admin/admin-shell";
import { Table } from "@/components/admin/status";
import { InventoryCell } from "./inventory-cell";
import { setInventory } from "./actions";

export const metadata = { title: "المنتجات" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; stock?: string; deleted?: string }> }) {
  await requireAdmin("catalog");
  const sp = await searchParams;
  const categories = docs.list<Category>("category");
  let products = docs.list<Product>("product");
  if (sp.q) {
    const q = normalizeArabic(sp.q);
    products = products.filter((p) => normalizeArabic(`${p.name} ${p.slug} ${p.sku}`).includes(q));
  }
  if (sp.cat) products = products.filter((p) => p.categoryIds.includes(sp.cat!));
  if (sp.stock === "low") products = products.filter((p) => p.inventory <= 5);

  return (
    <>
      <PageTitle title="المنتجات والمخزون" description={`${products.length} منتج`} action={<Link href="/admin/products/new" className="inline-flex h-10 items-center bg-gold px-5 text-sm text-ink hover:bg-gold-light">+ منتج جديد</Link>} />
      {sp.deleted && <p role="status" className="mb-4 text-sm text-gold">حُذف المنتج.</p>}
      <form className="mb-6 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={sp.q} placeholder="ابحث بالاسم أو الرابط" aria-label="بحث" className="h-10 min-w-56 flex-1 border border-ink-line bg-ink-deep px-3 text-sm outline-none focus:border-gold" />
        <select name="cat" defaultValue={sp.cat ?? ""} aria-label="القسم" className="h-10 border border-ink-line bg-ink-deep px-3 text-sm">
          <option value="">كل الأقسام</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.parentId ? "— " : ""}{c.name}</option>)}
        </select>
        <select name="stock" defaultValue={sp.stock ?? ""} aria-label="المخزون" className="h-10 border border-ink-line bg-ink-deep px-3 text-sm">
          <option value="">كل المخزون</option>
          <option value="low">منخفض (5 أو أقل)</option>
        </select>
        <button type="submit" className="h-10 border border-ivory/30 px-4 text-sm">تصفية</button>
      </form>
      <Table head={["المنتج", "السعر", "المخزون", ""]} empty={products.length ? undefined : "لا توجد منتجات مطابقة."}>
        {products.map((p) => {
          const off = discountPercent(p.price, p.compareAtPrice);
          return (
            <tr key={p.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {p.images[0] && <Image src={p.images[0].src} alt="" width={40} height={50} className="h-[50px] w-10 object-cover" />}
                  <div>
                    <Link href={`/admin/products/${p.id}`} className="hover:text-gold">{p.name}</Link>
                    <span className="block text-xs text-stone" dir="ltr">{p.slug}</span>
                  </div>
                </div>
              </td>
              <td className="tabular px-4 py-3">
                {formatAmount(p.price)} ر.س
                {off > 0 && <span className="block text-xs text-gold">خصم {off}% من {formatAmount(p.compareAtPrice!)}</span>}
              </td>
              <td className="px-4 py-3"><InventoryCell value={p.inventory} action={setInventory.bind(null, p.id)} /></td>
              <td className="px-4 py-3 text-end">
                <Link href={`/admin/products/${p.id}`} className="text-xs text-ivory/70 hover:text-ivory">تعديل</Link>
                <Link href={`/products/${p.slug}`} target="_blank" className="ms-4 text-xs text-ivory/50 hover:text-ivory">عرض ↗</Link>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
