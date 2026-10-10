import { requireAdmin } from "@/server/auth/session";
import { docs } from "@/server/db/docs";
import { mediaLibrary } from "@/server/admin/media-library";
import { homepage as seedHomepage } from "@/server/catalog/seed";
import type { Collection, HomepageContent, Offer } from "@/server/catalog/types";
import { fromHalalas } from "@/lib/admin/form";
import { PageTitle } from "@/components/admin/admin-shell";
import { AdminForm } from "@/components/admin/admin-form";
import { Checkbox, Fieldset, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { saveAnnouncement, saveCollections, saveHero, saveOffers, saveSections } from "./actions";

export const metadata = { title: "الصفحة الرئيسية" };

export default async function ContentPage() {
  await requireAdmin("content");
  const h = docs.get<HomepageContent>("setting", "homepage") ?? seedHomepage;
  const collections = docs.list<Collection>("collection");
  const offers = docs.list<Offer>("offer");
  const library = (await mediaLibrary()).map((m) => ({ value: m.src, label: m.src.split("/").pop()! }));
  const macroLibrary = [...library, ...library.map((l) => ({ value: l.value.replace(".webp", "-macro.webp"), label: `${l.label} (مقرّبة)` })).filter((l) => l.value.startsWith("/media/"))];
  const a = h.announcement ?? { enabled: false, text: "" };

  return (
    <>
      <PageTitle title="الصفحة الرئيسية والبنرات" description="التغييرات تظهر في المتجر فور الحفظ" />
      <div className="space-y-12">
        <AdminForm action={saveAnnouncement}>
          <Fieldset legend="شريط الإعلان أعلى الموقع">
            <TextInput label="النص" name="text" defaultValue={a.text} className="md:col-span-2" />
            <TextInput label="الرابط (اختياري)" name="href" defaultValue={a.href} dir="ltr" placeholder="/offers" />
            <Checkbox label="إظهار الشريط" name="enabled" defaultChecked={a.enabled} />
          </Fieldset>
        </AdminForm>

        <AdminForm action={saveHero}>
          <Fieldset legend="الواجهة الرئيسية (Hero)">
            <TextInput label="سطر تمهيدي" name="eyebrow" defaultValue={h.hero.eyebrow} />
            <TextInput label="العنوان" name="title" defaultValue={h.hero.title} />
            <TextInput label="الشعار" name="tagline" defaultValue={h.hero.tagline} />
            <SelectInput label="صورة الخلفية" name="image" defaultValue={h.hero.image.src} options={library} />
            <TextArea label="النص" name="body" defaultValue={h.hero.body} className="md:col-span-2" />
            <TextInput label="الزر الرئيسي" name="primaryLabel" defaultValue={h.hero.primaryCta.label} />
            <TextInput label="رابطه" name="primaryHref" defaultValue={h.hero.primaryCta.href} dir="ltr" />
            <TextInput label="الزر الثانوي" name="secondaryLabel" defaultValue={h.hero.secondaryCta.label} />
            <TextInput label="رابطه" name="secondaryHref" defaultValue={h.hero.secondaryCta.href} dir="ltr" />
          </Fieldset>
        </AdminForm>

        <AdminForm action={saveCollections}>
          <section className="border border-ink-line p-5 md:p-6">
            <h2 className="mb-5 font-display text-base">بطاقات «اختيارات الشيوخ»</h2>
            <div className="space-y-6">
              {collections.map((c, i) => (
                <div key={c.id} className="grid gap-4 border-b border-ink-line pb-6 last:border-0 md:grid-cols-4">
                  <TextInput label={`البطاقة ${i + 1}: العنوان`} name={`c.${i}.title`} defaultValue={c.title} />
                  <TextInput label="السطر الصغير" name={`c.${i}.subtitle`} defaultValue={c.subtitle} />
                  <TextInput label="الرابط" name={`c.${i}.href`} defaultValue={c.href} dir="ltr" />
                  <SelectInput label="الصورة" name={`c.${i}.image`} defaultValue={c.image.src} options={library} />
                </div>
              ))}
            </div>
          </section>
        </AdminForm>

        <AdminForm action={saveOffers}>
          <section className="border border-ink-line p-5 md:p-6">
            <h2 className="mb-5 font-display text-base">«اختيارات تستحق» (البكجات)</h2>
            <div className="space-y-6">
              {offers.map((o, i) => (
                <div key={o.id} className="grid gap-4 border-b border-ink-line pb-6 last:border-0 md:grid-cols-3">
                  <TextInput label={`العرض ${i + 1}: التسمية`} name={`o.${i}.label`} defaultValue={o.label} />
                  <TextInput label="العنوان" name={`o.${i}.title`} defaultValue={o.title} />
                  <TextInput label="الرابط" name={`o.${i}.href`} defaultValue={o.href} dir="ltr" />
                  <TextInput label="الوصف" name={`o.${i}.description`} defaultValue={o.description} className="md:col-span-3" />
                  <TextInput label="السعر (ر.س)" name={`o.${i}.price`} defaultValue={fromHalalas(o.price)} dir="ltr" inputMode="decimal" />
                  <TextInput label="قبل العرض (ر.س)" name={`o.${i}.compareAtPrice`} defaultValue={fromHalalas(o.compareAtPrice)} dir="ltr" inputMode="decimal" />
                  <SelectInput label="الصورة" name={`o.${i}.image`} defaultValue={o.image.src} options={library} />
                </div>
              ))}
            </div>
          </section>
        </AdminForm>

        <AdminForm action={saveSections}>
          <Fieldset legend="«تفاصيل تحكي الفخامة»">
            <TextInput label="العنوان" name="fabricTitle" defaultValue={h.fabricDetail.title} />
            <SelectInput label="الصورة المقرّبة" name="fabricImage" defaultValue={h.fabricDetail.image.src} options={macroLibrary} />
            <TextArea label="النص" name="fabricBody" defaultValue={h.fabricDetail.body} className="md:col-span-2" />
            {h.fabricDetail.points.map((pt, i) => (
              <div key={i} className="grid gap-3 md:col-span-2 md:grid-cols-[12rem_1fr]">
                <TextInput label={`النقطة ${i + 1}`} name={`points.${i}.label`} defaultValue={pt.label} />
                <TextInput label="الشرح" name={`points.${i}.text`} defaultValue={pt.text} />
              </div>
            ))}
          </Fieldset>
          <Fieldset legend="«بوكسات الشيوخ»">
            <TextInput label="العنوان" name="boxesTitle" defaultValue={h.boxes.title} />
            <TextInput label="العنوان الفرعي" name="boxesSubtitle" defaultValue={h.boxes.subtitle} />
            <TextArea label="النص" name="boxesBody" defaultValue={h.boxes.body} className="md:col-span-2" />
            <TextInput label="الرابط" name="boxesHref" defaultValue={h.boxes.href} dir="ltr" />
            <TextInput label="يبدأ من (ر.س)" name="boxesPriceFrom" defaultValue={fromHalalas(h.boxes.priceFrom)} dir="ltr" inputMode="decimal" />
          </Fieldset>
        </AdminForm>
      </div>
    </>
  );
}
