import { requireAdmin } from "@/server/auth/session";
import { docs } from "@/server/db/docs";
import type { Product, Review } from "@/server/catalog/types";
import { PageTitle } from "@/components/admin/admin-shell";
import { AdminForm } from "@/components/admin/admin-form";
import { Checkbox, Fieldset, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { addReview, deleteReview, toggleApproved, toggleFeatured } from "./actions";

export const metadata = { title: "التقييمات" };

export default async function ReviewsPage() {
  await requireAdmin("content");
  const reviews = docs.list<Review>("review");
  const products = docs.list<Product>("product");
  return (
    <>
      <PageTitle title="التقييمات" description="المخفية لا تظهر في المتجر. «مميز» يظهر في الصفحة الرئيسية." />
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className={`border p-4 ${r.approved === false ? "border-ink-line opacity-60" : "border-ink-line"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="text-gold">{"★".repeat(r.rating)}</span> <span className="ms-2">{r.author}</span> <span className="text-xs text-stone">· {r.city} · {products.find((p) => p.id === r.productId)?.name ?? "عام"}</span></p>
                <p className="mt-2 text-sm leading-7 text-ivory/80">{r.body}</p>
                <p className="mt-1 text-xs text-stone">{r.approved === false ? "مخفي" : "ظاهر"}{r.featured && " · مميز في الرئيسية"}{r.verified && " · مشتري موثّق"}</p>
              </div>
              <div className="flex gap-2 [&_form]:space-y-0 [&_button]:h-8 [&_button]:px-3 [&_button]:text-xs">
                <AdminForm action={toggleApproved.bind(null, r.id)} submitLabel={r.approved === false ? "إظهار" : "إخفاء"}><></></AdminForm>
                <AdminForm action={toggleFeatured.bind(null, r.id)} submitLabel={r.featured ? "إلغاء التمييز" : "تمييز"}><></></AdminForm>
                <AdminForm action={deleteReview.bind(null, r.id)} submitLabel="حذف" danger confirm="حذف التقييم؟"><></></AdminForm>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <AdminForm action={addReview} submitLabel="إضافة التقييم" resetOnSuccess>
          <Fieldset legend="إضافة تقييم (من واتساب أو المتجر)">
            <TextInput label="اسم العميل" name="author" required />
            <TextInput label="المدينة" name="city" />
            <SelectInput label="التقييم" name="rating" defaultValue="5" options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: "★".repeat(n) }))} />
            <SelectInput label="المنتج" name="productId" options={[{ value: "", label: "تقييم عام للمتجر" }, ...products.map((p) => ({ value: p.id, label: p.name }))]} />
            <TextArea label="نص التقييم" name="body" className="md:col-span-2" required />
            <Checkbox label="مشتري موثّق" name="verified" defaultChecked />
          </Fieldset>
        </AdminForm>
      </div>
    </>
  );
}
