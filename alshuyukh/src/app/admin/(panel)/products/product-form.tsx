"use client";

import { useState } from "react";
import type { Category, Media, Product } from "@/server/catalog/types";
import { fromHalalas, type FormState } from "@/lib/admin/form";
import { AdminForm, useFieldError } from "@/components/admin/admin-form";
import { Checkbox, Fieldset, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { ImagePicker } from "@/components/admin/image-picker";

function CategoryChecks({ categories, selected }: { categories: Category[]; selected: string[] }) {
  const error = useFieldError("categoryIds");
  const roots = categories.filter((c) => !c.parentId);
  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-xs text-ivory/70">الأقسام</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roots.map((r) => (
          <div key={r.id} className="border border-ink-line p-3">
            <Checkbox name="categoryIds" value={r.id} defaultChecked={selected.includes(r.id)} label={r.name} className="font-medium" />
            {categories.filter((c) => c.parentId === r.id).map((c) => (
              <Checkbox key={c.id} name="categoryIds" value={c.id} defaultChecked={selected.includes(c.id)} label={c.name} className="ms-6 min-h-9" />
            ))}
          </div>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-[#e09b90]">{error}</p>}
    </div>
  );
}

export function ProductForm({ product, categories, library, action }: {
  product?: Product;
  categories: Category[];
  library: { src: string; macro?: string }[];
  action: (state: FormState, data: FormData) => Promise<FormState>;
}) {
  const [isFabric, setIsFabric] = useState(product ? !!product.fabric : true);
  const f = product?.fabric;
  const a = product?.attributes;
  return (
    <AdminForm action={action} submitLabel={product ? "حفظ التعديلات" : "إضافة المنتج"}>
      <Fieldset legend="المعلومات الأساسية">
        <TextInput label="اسم المنتج" name="name" defaultValue={product?.name} required />
        <TextInput label="الرابط (بالإنجليزية)" name="slug" defaultValue={product?.slug} dir="ltr" hint="مثل kyoto-japanese-white ← /products/kyoto-japanese-white" required />
        <TextInput label="وصف قصير (يظهر في البطاقة)" name="shortDescription" defaultValue={product?.shortDescription} className="md:col-span-2" required />
        <TextArea label="الوصف الكامل" name="description" defaultValue={product?.description} rows={4} className="md:col-span-2" required />
        <TextInput label="كلمات مفتاحية للبحث (مفصولة بفاصلة)" name="tags" defaultValue={product?.tags.join("، ")} className="md:col-span-2" />
      </Fieldset>

      <Fieldset legend="السعر والمخزون">
        <TextInput label="السعر (ر.س)" name="price" inputMode="decimal" dir="ltr" defaultValue={fromHalalas(product?.price)} required />
        <TextInput label="السعر قبل الخصم (اختياري)" name="compareAtPrice" inputMode="decimal" dir="ltr" defaultValue={fromHalalas(product?.compareAtPrice)} hint="اتركه فارغًا إن لم يكن هناك خصم" />
        <SelectInput label="وحدة البيع" name="unit" defaultValue={product?.unit ?? "meter"} options={[{ value: "meter", label: "بالمتر" }, { value: "piece", label: "بالقطعة" }, { value: "set", label: "طقم / بوكس" }]} />
        <TextInput label="الكمية في المخزون" name="inventory" type="number" min={0} dir="ltr" defaultValue={product?.inventory ?? 0} required />
        <Checkbox label="ضمن «الأكثر اختيارًا» في الرئيسية" name="isBestSeller" defaultChecked={product?.isBestSeller} />
      </Fieldset>

      <Fieldset legend="الأقسام">
        <CategoryChecks categories={categories} selected={product?.categoryIds ?? []} />
      </Fieldset>

      <section className="border border-ink-line p-5 md:p-6">
        <h2 className="mb-5 font-display text-base">الصور</h2>
        <ImagePicker initial={product?.images ?? ([] as Media[])} library={library} defaultAlt={product?.name ?? ""} />
      </section>

      <section className="border border-ink-line p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base">{isFabric ? "تفاصيل القماش" : "الخصائص"}</h2>
          <Checkbox label="هذا المنتج قماش" name="isFabric" checked={isFabric} onChange={(e) => setIsFabric(e.target.checked)} />
        </div>
        {isFabric ? (
          <div className="grid gap-5 md:grid-cols-3">
            <TextInput label="نوع القماش" name="fabric.type" defaultValue={f?.type} placeholder="ساتان ياباني" />
            <TextInput label="الخامة" name="fabric.material" defaultValue={f?.material} placeholder="بوليستر ياباني عالي الكثافة" />
            <TextInput label="الملمس" name="fabric.texture" defaultValue={f?.texture} placeholder="مصقول بلمعة هادئة" />
            <TextInput label="الموسم" name="fabric.season" defaultValue={f?.season} placeholder="صيفي / شتوي / كل المواسم" />
            <TextInput label="اللون" name="fabric.color" defaultValue={f?.color} />
            <TextInput label="العرض" name="fabric.width" defaultValue={f?.width} placeholder="150 سم" />
            <TextInput label="المنشأ (اختياري)" name="fabric.origin" defaultValue={f?.origin} />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            <TextInput label="اللون (للتصفية)" name="attributes.color" defaultValue={a?.color} />
            <TextInput label="الموسم (للتصفية)" name="attributes.season" defaultValue={a?.season} />
            <TextInput label="المنشأ" name="attributes.origin" defaultValue={a?.origin} />
          </div>
        )}
      </section>
    </AdminForm>
  );
}
