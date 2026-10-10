import { requireAdmin } from "@/server/auth/session";
import { ROLE_LABELS } from "@/server/auth/roles";
import { PageTitle } from "@/components/admin/admin-shell";
import { AdminForm } from "@/components/admin/admin-form";
import { Fieldset, TextInput } from "@/components/admin/fields";
import { changeOwnPassword } from "../users/actions";

export const metadata = { title: "حسابي" };

export default async function AccountPage() {
  const user = await requireAdmin();
  return (
    <>
      <PageTitle title="حسابي" description={`${user.email} · ${ROLE_LABELS[user.role]}`} />
      <AdminForm action={changeOwnPassword} submitLabel="تغيير كلمة المرور" resetOnSuccess>
        <Fieldset legend="تغيير كلمة المرور">
          <TextInput label="كلمة المرور الحالية" name="current" type="password" autoComplete="current-password" dir="ltr" className="md:col-span-2" />
          <TextInput label="الجديدة" name="password" type="password" autoComplete="new-password" dir="ltr" />
          <TextInput label="تأكيد الجديدة" name="confirm" type="password" autoComplete="new-password" dir="ltr" />
        </Fieldset>
      </AdminForm>
    </>
  );
}
