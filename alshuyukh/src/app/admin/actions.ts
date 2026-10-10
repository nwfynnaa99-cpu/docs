"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticate, ensureBootstrapOwner } from "@/server/auth/users";
import { createSession, destroySession, getAdmin } from "@/server/auth/session";
import { audit } from "@/server/auth/audit";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { FormState } from "@/lib/admin/form";

const Login = z.object({ email: z.string().trim().email().max(120), password: z.string().min(1).max(200) });
const GENERIC = "البريد أو كلمة المرور غير صحيحة";

export async function loginAction(_: FormState, data: FormData): Promise<FormState> {
  const ip = clientIp(await headers());
  // Per-IP throttle on top of the per-account lockout.
  if (!rateLimit(`admin-login:${ip}`, { limit: 10, windowMs: 15 * 60_000 }).ok) {
    return { ok: false, message: "محاولات كثيرة. حاول بعد 15 دقيقة." };
  }
  await ensureBootstrapOwner();
  const parsed = Login.safeParse({ email: data.get("email"), password: data.get("password") });
  if (!parsed.success) return { ok: false, message: GENERIC };

  const result = await authenticate(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    audit(null, result.reason === "locked" ? "login_locked" : "login_failed", "admin_user", undefined, parsed.data.email);
    return { ok: false, message: result.reason === "locked" ? "الحساب مقفل مؤقتًا بعد محاولات فاشلة. حاول بعد 15 دقيقة." : GENERIC };
  }
  await createSession(result.user.id);
  audit({ id: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role }, "login", "admin_user", result.user.id);
  redirect("/admin");
}

export async function logoutAction() {
  const user = await getAdmin();
  await destroySession();
  if (user) audit(user, "logout", "admin_user", user.id);
  redirect("/admin/login");
}
