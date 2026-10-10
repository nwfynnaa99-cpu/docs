"use client";

import Image from "next/image";
import { useState } from "react";
import type { Category } from "@/server/catalog/types";
import type { FormState } from "@/lib/admin/form";
import { AdminForm } from "@/components/admin/admin-form";
import { Fieldset, SelectInput, TextArea, TextInput } from "@/components/admin/fields";

export function CategoryForm({ category, roots, library, action }: { category?: Category; roots: Category[]; library: string[]; action: (s: FormState, d: FormData) => Promise<FormState> }) {
  const [image, setImage] = useState(category?.image?.src ?? "");
  return (
    <AdminForm action={action} submitLabel={category ? "حفظ" : "إضافة القسم"}>
      <Fieldset legend="بيانات القسم">
        <TextInput label="الاسم" name="name" defaultValue={category?.name} required />
        <TextInput label="الرابط (بالإنجليزية)" name="slug" defaultValue={category?.slug} dir="ltr" required />
        <SelectInput label="القسم الرئيسي" name="parentId" defaultValue={category?.parentId ?? ""} options={[{ value: "", label: "— قسم رئيسي —" }, ...roots.filter((r) => r.id !== category?.id).map((r) => ({ value: r.id, label: r.name }))]} />
        <TextInput label="الترتيب" name="sortOrder" type="number" min={0} defaultValue={category?.sortOrder ?? 0} dir="ltr" />
        <TextArea label="الوصف" name="description" defaultValue={category?.description} className="md:col-span-2" />
      </Fieldset>
      <section className="border border-ink-line p-5 md:p-6">
        <h2 className="mb-4 font-display text-base">صورة القسم</h2>
        <input type="hidden" name="imageSrc" value={image} />
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          <button type="button" onClick={() => setImage("")} className={`grid aspect-[4/5] place-items-center border text-xs ${image === "" ? "border-gold" : "border-ink-line"}`}>بدون</button>
          {library.map((src) => (
            <button key={src} type="button" onClick={() => setImage(src)} aria-pressed={image === src} className={`border ${image === src ? "border-gold" : "border-transparent"}`}>
              <Image src={src} alt="" width={96} height={120} className="aspect-[4/5] w-full object-cover" />
            </button>
          ))}
        </div>
      </section>
    </AdminForm>
  );
}
