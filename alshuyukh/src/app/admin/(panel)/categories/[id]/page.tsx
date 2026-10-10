import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth/session";
import { docs } from "@/server/db/docs";
import { mediaLibrary } from "@/server/admin/media-library";
import type { Category } from "@/server/catalog/types";
import { PageTitle } from "@/components/admin/admin-shell";
import { AdminForm } from "@/components/admin/admin-form";
import { CategoryForm } from "../category-form";
import { deleteCategory, saveCategory } from "../actions";

export const metadata = { title: "تعديل قسم" };

export default async function EditCategory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin("catalog");
  const { id } = await params;
  const { created } = await searchParams;
  const all = docs.list<Category>("category");
  const category = id === "new" ? undefined : all.find((c) => c.id === id);
  if (id !== "new" && !category) notFound();
  const library = (await mediaLibrary()).map((m) => m.src);
  return (
    <>
      <PageTitle title={category?.name ?? "قسم جديد"} />
      {created && <p role="status" className="mb-6 text-sm text-gold">أُضيف القسم.</p>}
      <CategoryForm category={category} roots={all.filter((c) => !c.parentId)} library={library} action={saveCategory.bind(null, category?.id ?? null)} />
      {category && (
        <section className="mt-12 border border-danger/40 p-5">
          <h2 className="mb-4 font-display text-base">حذف القسم</h2>
          <AdminForm action={deleteCategory.bind(null, category.id)} submitLabel="حذف القسم" danger confirm={`حذف «${category.name}»؟`}><></></AdminForm>
        </section>
      )}
    </>
  );
}
