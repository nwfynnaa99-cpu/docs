import "server-only";
import { randomUUID } from "node:crypto";
import { db, nowIso } from "@/server/db";
import { hashPassword, verifyPassword } from "./password";
import type { Role } from "./roles";

export type AdminUserRow = { id: string; email: string; name: string; role: Role; password_hash: string; failed_attempts: number; locked_until: string | null; created_at: string; last_login_at: string | null };

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
// Verified against when the email doesn't exist, so response time doesn't reveal valid emails.
let dummyHash: Promise<string> | null = null;

export const findUserByEmail = (email: string) => db().prepare("SELECT * FROM admin_users WHERE email = ?").get(email.trim()) as AdminUserRow | undefined;
export const findUserById = (id: string) => db().prepare("SELECT * FROM admin_users WHERE id = ?").get(id) as AdminUserRow | undefined;
export const listUsers = () => db().prepare("SELECT id, email, name, role, created_at, last_login_at, locked_until FROM admin_users ORDER BY created_at").all() as Omit<AdminUserRow, "password_hash" | "failed_attempts">[];
export const countOwners = () => (db().prepare("SELECT COUNT(*) n FROM admin_users WHERE role = 'owner'").get() as { n: number }).n;

export async function createUser(input: { email: string; name: string; role: Role; password: string }) {
  const id = randomUUID();
  db()
    .prepare("INSERT INTO admin_users (id, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, input.email.trim().toLowerCase(), input.name.trim(), input.role, await hashPassword(input.password), nowIso());
  return id;
}

export async function setPassword(userId: string, password: string) {
  db().prepare("UPDATE admin_users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?").run(await hashPassword(password), userId);
}

export function deleteUser(id: string) {
  db().prepare("DELETE FROM admin_users WHERE id = ?").run(id);
}

export type LoginResult = { ok: true; user: AdminUserRow } | { ok: false; reason: "invalid" | "locked" };

/** Verifies credentials with per-account lockout (5 failures → 15 minutes). */
export async function authenticate(email: string, password: string): Promise<LoginResult> {
  const user = findUserByEmail(email);
  if (!user) {
    await verifyPassword(password, await (dummyHash ??= hashPassword("timing-equalizer-not-a-password")));
    return { ok: false, reason: "invalid" };
  }
  if (user.locked_until && user.locked_until > nowIso()) return { ok: false, reason: "locked" };
  if (!(await verifyPassword(password, user.password_hash))) {
    const failures = user.failed_attempts + 1;
    const lock = failures >= MAX_FAILURES ? new Date(Date.now() + LOCK_MS).toISOString() : null;
    db().prepare("UPDATE admin_users SET failed_attempts = ?, locked_until = ? WHERE id = ?").run(lock ? 0 : failures, lock, user.id);
    return { ok: false, reason: lock ? "locked" : "invalid" };
  }
  db().prepare("UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login_at = ? WHERE id = ?").run(nowIso(), user.id);
  return { ok: true, user };
}

/**
 * First run: if no admin exists, create the owner from ADMIN_EMAIL /
 * ADMIN_PASSWORD. Without those variables the admin stays locked.
 */
export async function ensureBootstrapOwner() {
  const n = (db().prepare("SELECT COUNT(*) n FROM admin_users").get() as { n: number }).n;
  if (n > 0) return;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  await createUser({ email, name: "المالك", role: "owner", password });
}
