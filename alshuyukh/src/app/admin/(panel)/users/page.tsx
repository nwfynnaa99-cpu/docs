import { requireAdmin } from "@/server/auth/session";
import { listUsers } from "@/server/auth/users";
import { ROLE_LABELS } from "@/server/auth/roles";
import { PageTitle } from "@/components/admin/admin-shell";
import { AdminForm } from "@/components/admin/admin-form";
import { Fieldset, SelectInput, TextInput } from "@/components/admin/fields";
import { addUser, removeUser, resetUserPassword } from "./actions";

export const metadata = { title: "المستخدمون" };

export default async function UsersPage() {
  const me = await requireAdmin("users");
  const users = listUsers();
  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("ar-SA-u-nu-latn-ca-gregory", { timeZone: "Asia/Riyadh" }) : "—");
  return (
    <>
      <PageTitle title="المستخدمون" description="المالك: كل الصلاحيات · المحرر: المنتجات والمحتوى · الطلبات: الطلبات والعملاء" />
      <ul className="space-y-3">
        {users.map((u) => (
          <li key={u.id} className="border border-ink-line p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="text-sm">
                <p>{u.name} {u.id === me.id && <span className="text-xs text-gold">(أنت)</span>}</p>
                <p className="text-xs text-stone" dir="ltr" style={{ textAlign: "start" }}>{u.email}</p>
                <p className="mt-1 text-xs text-ivory/60">{ROLE_LABELS[u.role]} · آخر دخول: {fmt(u.last_login_at)}{u.locked_until && u.locked_until > new Date().toISOString() && <span className="text-[#e09b90]"> · مقفل مؤقتًا</span>}</p>
              </div>
              {u.id !== me.id && (
                <div className="flex flex-wrap items-start gap-3 [&_form]:space-y-2">
                  <AdminForm action={resetUserPassword.bind(null, u.id)} submitLabel="تعيين كلمة مرور" resetOnSuccess>
                    <TextInput label="كلمة مرور جديدة" name="password" type="password" autoComplete="new-password" dir="ltr" />
                  </AdminForm>
                  <AdminForm action={removeUser.bind(null, u.id)} submitLabel="حذف" danger confirm={`حذف ${u.email}؟`}><></></AdminForm>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <AdminForm action={addUser} submitLabel="إضافة المستخدم" resetOnSuccess>
          <Fieldset legend="مستخدم جديد">
            <TextInput label="الاسم" name="name" required />
            <TextInput label="البريد" name="email" type="email" dir="ltr" required />
            <SelectInput label="الصلاحية" name="role" defaultValue="orders" options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))} />
            <TextInput label="كلمة المرور المبدئية" name="password" type="password" autoComplete="new-password" dir="ltr" hint="10 أحرف على الأقل، حروف وأرقام" required />
          </Fieldset>
        </AdminForm>
      </div>
    </>
  );
}
