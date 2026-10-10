import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth/session";
import { docs } from "@/server/db/docs";
import { mediaLibrary } from "@/server/admin/media-library";
import type { Category, Product } from "@/server/catalog/types";
import { PageTitle } from "@/components/admin/admin-shell";
import { AdminForm } from "@/components/admin/admin-form";
import { ProductForm } from "../product-form";
import { deleteProduct, saveProduct } from "../actions";

export const metadata = { title: "تعديل منتج" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin("catalog");
  const { id } = await params;
  const { created } = await searchParams;
  const isNew = id === "new";
  const product = isNew ? undefined : (docs.get<Product>("product", id) ?? undefined);
  if (!isNew && !product) notFound();
  const [categories, library] = [docs.list<Category>("category"), await mediaLibrary()];

  return (
    <>
      <PageTitle
        title={product ? product.name : "منتج جديد"}
        action={product && <Link href={`/products/${product.slug}`} target="_blank" className="text-sm text-ivory/70 hover:text-ivory">عرض في المتجر ↗</Link>}
      />
      {created && <p role="status" className="mb-6 text-sm text-gold">أُضيف المنتج وأصبح ظاهرًا في المتجر.</p>}
      <ProductForm product={product} categories={categories} library={library} action={saveProduct.bind(null, product?.id ?? null)} />
      {product && (
        <section className="mt-12 border border-danger/40 p-5">
          <h2 className="mb-3 font-display text-base">حذف المنتج</h2>
          <p className="mb-4 text-sm text-stone">يختفي المنتج من المتجر فورًا. الطلبات السابقة تبقى كما هي.</p>
          <AdminForm action={deleteProduct.bind(null, product.id)} submitLabel="حذف المنتج نهائيًا" danger confirm={`حذف «${product.name}»؟ لا يمكن التراجع.`}>
            <></>
          </AdminForm>
        </section>
      )}
    </>
  );
}
