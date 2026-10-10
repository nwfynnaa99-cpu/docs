import "server-only";
import { db, nowIso } from "@/server/db";
import type { AdminUser } from "./session";

export function audit(user: AdminUser | null, action: string, entity: string, entityId?: string, summary?: string) {
  db()
    .prepare("INSERT INTO audit_log (at, user_id, user_email, action, entity, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(nowIso(), user?.id ?? null, user?.email ?? null, action, entity, entityId ?? null, summary?.slice(0, 300) ?? null);
}

export function listAudit(limit = 200) {
  return db().prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT ?").all(limit) as {
    id: number; at: string; user_email: string | null; action: string; entity: string; entity_id: string | null; summary: string | null;
  }[];
}
