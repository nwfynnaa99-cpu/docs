import { requireAdmin } from "@/server/auth/session";
import { listAudit } from "@/server/auth/audit";
import { PageTitle } from "@/components/admin/admin-shell";
import { Table } from "@/components/admin/status";

export const metadata = { title: "سجل التغييرات" };

export default async function AuditPage() {
  await requireAdmin("audit");
  const rows = listAudit(300);
  const fmt = new Intl.DateTimeFormat("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Riyadh" });
  return (
    <>
      <PageTitle title="سجل التغييرات" description="آخر 300 عملية" />
      <Table head={["الوقت", "المستخدم", "العملية", "العنصر", "التفاصيل"]}>
        {rows.map((r) => (
          <tr key={r.id} className={r.action.startsWith("login_") ? "text-[#e09b90]" : undefined}>
            <td className="tabular px-4 py-2.5 text-xs text-stone">{fmt.format(new Date(r.at))}</td>
            <td className="px-4 py-2.5 text-xs" dir="ltr" style={{ textAlign: "start" }}>{r.user_email ?? "—"}</td>
            <td className="px-4 py-2.5 text-xs">{r.action}</td>
            <td className="px-4 py-2.5 text-xs">{r.entity}<span className="block text-stone" dir="ltr">{r.entity_id}</span></td>
            <td className="px-4 py-2.5 text-xs text-ivory/70">{r.summary}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
