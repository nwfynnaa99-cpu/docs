"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { requireAdmin, destroyUserSessions, SESSION_COOKIE } from "@/server/auth/session";
import { audit } from "@/server/auth/audit";
import { countOwners, createUser, deleteUser, findUserByEmail, findUserById, setPassword } from "@/server/auth/users";
import { passwordProblem, verifyPassword } from "@/server/auth/password";
import { done, fail, fieldErrors, type FormState } from "@/lib/admin/form";

const NewUser = z.object({
  email: z.string().trim().toLowerCase().email("بريد غير صحيح").max(120),
  name: z.string().trim().min(2, "اكتب الاسم").max(60),
  role: z.enum(["owner", "editor", "orders"]),
  password: z.string(),
});

export async function addUser(_: FormState, d: FormData): Promise<FormState> {
  const user = await requireAdmin("users");
  const p = NewUser.safeParse({ email: d.get("email"), name: d.get("name"), role: d.get("role"), password: d.get("password") });
  if (!p.success) return fail("راجع الحقول", fieldErrors(p.error));
  const problem = passwordProblem(p.data.password);
  if (problem) return fail(problem, { password: problem });
  if (findUserByEmail(p.data.email)) return fail("البريد مستخدم", { email: "يوجد مستخدم بهذا البريد" });
  const id = await createUser(p.data);
  audit(user, "create", "admin_user", id, `${p.data.email} (${p.data.role})`);
  revalidatePath("/admin/users");
  return done("أُضيف المستخدم");
}

export async function removeUser(id: string, _s?: FormState, _d?: FormData): Promise<FormState> {
  const user = await requireAdmin("users");
  if (id === user.id) return fail("لا يمكنك حذف حسابك");
  const target = findUserById(id);
  if (!target) return fail("غير موجود");
  if (target.role === "owner" && countOwners() <= 1) return fail("لا يمكن حذف آخر مالك");
  deleteUser(id); // sessions cascade
  audit(user, "delete", "admin_user", id, target.email);
  revalidatePath("/admin/users");
  return done("حُذف");
}

export async function resetUserPassword(id: string, _: FormState, d: FormData): Promise<FormState> {
  const user = await requireAdmin("users");
  const pw = String(d.get("password") ?? "");
  const problem = passwordProblem(pw);
  if (problem) return fail(problem, { password: problem });
  if (!findUserById(id)) return fail("غير موجود");
  await setPassword(id, pw);
  destroyUserSessions(id); // force re-login everywhere
  audit(user, "reset_password", "admin_user", id);
  return done("تم تعيين كلمة المرور وتسجيل خروجه من كل الأجهزة");
}

export async function changeOwnPassword(_: FormState, d: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const row = findUserById(user.id);
  if (!row || !(await verifyPassword(String(d.get("current") ?? ""), row.password_hash))) return fail("كلمة المرور الحالية غير صحيحة", { current: "غير صحيحة" });
  const pw = String(d.get("password") ?? "");
  const problem = passwordProblem(pw);
  if (problem) return fail(problem, { password: problem });
  if (pw !== String(d.get("confirm") ?? "")) return fail("التأكيد لا يطابق", { confirm: "لا يطابق" });
  await setPassword(user.id, pw);
  // Keep this session, sign out every other device.
  destroyUserSessions(user.id, (await cookies()).get(SESSION_COOKIE)?.value);
  audit(user, "change_password", "admin_user", user.id);
  return done("تم تغيير كلمة المرور. سُجّل خروجك من الأجهزة الأخرى.");
}
