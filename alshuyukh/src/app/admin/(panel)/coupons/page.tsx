import { requireAdmin } from "@/server/auth/session";
import { docs } from "@/server/db/docs";
import type { Coupon } from "@/server/catalog/types";
import { formatAmount } from "@/lib/format";
import { PageTitle } from "@/components/admin/admin-shell";
import { Table } from "@/components/admin/status";
import { AdminForm } from "@/components/admin/admin-form";
import { Fieldset, SelectInput, TextInput } from "@/components/admin/fields";
import { createCoupon, deleteCoupon, toggleCoupon } from "./actions";

export const metadata = { title: "الخصومات" };

export default async function CouponsPage() {
  await requireAdmin("catalog");
  const coupons = docs.list<Coupon>("coupon");
  return (
    <>
      <PageTitle title="الخصومات" description="رموز الخصم. خصومات المنتجات تُضبط من «السعر قبل الخصم» في صفحة المنتج." />
      <Table head={["الرمز", "الخصم", "الشروط", "الحالة", ""]} empty={coupons.length ? undefined : "لا توجد رموز."}>
        {coupons.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3 font-medium" dir="ltr">{c.code}<span className="block text-xs font-normal text-stone" dir="rtl">{c.label}</span></td>
            <td className="tabular px-4 py-3">{c.percent ? `${c.percent}%` : `${formatAmount(c.amount ?? 0)} ر.س`}</td>
            <td className="px-4 py-3 text-xs text-stone">
              {c.minSubtotal ? `من ${formatAmount(c.minSubtotal)} ر.س` : "بدون حد أدنى"}
              {c.expiresAt && <span className="block">ينتهي {new Date(c.expiresAt).toLocaleDateString("ar-SA-u-nu-latn-ca-gregory")}</span>}
            </td>
            <td className="px-4 py-3"><span className={c.active ? "text-gold" : "text-stone"}>{c.active ? "مفعّل" : "موقوف"}</span></td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-2 [&_form]:space-y-0 [&_button]:h-8 [&_button]:px-3 [&_button]:text-xs">
                <AdminForm action={toggleCoupon.bind(null, c.code)} submitLabel={c.active ? "إيقاف" : "تفعيل"}><></></AdminForm>
                <AdminForm action={deleteCoupon.bind(null, c.code)} submitLabel="حذف" danger confirm={`حذف ${c.code}؟`}><></></AdminForm>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <div className="mt-10">
        <AdminForm action={createCoupon} submitLabel="إضافة الرمز" resetOnSuccess>
          <Fieldset legend="رمز جديد">
            <TextInput label="الرمز" name="code" dir="ltr" placeholder="EID2026" required />
            <TextInput label="الوصف للعميل" name="label" placeholder="خصم العيد 15%" required />
            <SelectInput label="النوع" name="kind" options={[{ value: "percent", label: "نسبة مئوية %" }, { value: "amount", label: "مبلغ ثابت (ر.س)" }]} />
            <TextInput label="القيمة" name="value" inputMode="decimal" dir="ltr" required />
            <TextInput label="الحد الأدنى للطلب (ر.س، اختياري)" name="minSubtotal" inputMode="decimal" dir="ltr" />
            <TextInput label="تاريخ الانتهاء (اختياري)" name="expiresAt" type="date" dir="ltr" />
          </Fieldset>
        </AdminForm>
      </div>
    </>
  );
}
