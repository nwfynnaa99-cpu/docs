import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, nowIso } from "@/server/db";
import { can, type Capability, type Role } from "./roles";

export type AdminUser = { id: string; email: string; name: string; role: Role };

const PROD = process.env.NODE_ENV === "production";
// __Host- prefix: Secure, Path=/, no Domain, so subdomains can't plant or read it.
export const SESSION_COOKIE = PROD ? "__Host-alshuyukh_admin" : "alshuyukh_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  const expires = new Date(Date.now() + TTL_MS);
  db()
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)")
    .run(hashToken(token), userId, nowIso(), expires.toISOString(), h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? null, (h.get("user-agent") ?? "").slice(0, 200));
  // Opportunistic cleanup of expired sessions
  db().prepare("DELETE FROM sessions WHERE expires_at < ?").run(nowIso());
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: PROD, sameSite: "strict", path: "/", expires });
}

/** Only the token's hash is stored, so a leaked database can't be replayed as sessions. */
export async function getAdmin(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, s.expires_at FROM sessions s JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .get(hashToken(token)) as (AdminUser & { expires_at: string }) | undefined;
  if (!row || row.expires_at < nowIso()) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  // A __Host- cookie can only be overwritten with the same Secure/Path
  // attributes; a bare delete() is ignored by the browser.
  jar.set(SESSION_COOKIE, "", { httpOnly: true, secure: PROD, sameSite: "strict", path: "/", maxAge: 0 });
}

export function destroyUserSessions(userId: string, exceptCurrentToken?: string) {
  if (exceptCurrentToken) db().prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").run(userId, hashToken(exceptCurrentToken));
  else db().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

/** Guard for admin pages and actions. Redirects to login, or to the dashboard if the role lacks the capability. */
export async function requireAdmin(cap?: Capability): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  if (cap && !can(user.role, cap)) redirect("/admin?denied=1");
  return user;
}
