import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedDatabase } from "./seed";

/**
 * SQLite through Node's built-in driver: no native packages, one file.
 * Fits a single server or container with a persistent volume. For
 * serverless hosting, implement the repositories against a hosted
 * database (e.g. libSQL/Turso or Postgres); nothing else changes.
 */
const MIGRATIONS: string[] = [
  `
  CREATE TABLE docs (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    slug TEXT,
    sort INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  );
  CREATE UNIQUE INDEX docs_slug ON docs(collection, slug) WHERE slug IS NOT NULL;

  CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    phone TEXT NOT NULL,
    total INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    data TEXT NOT NULL
  );
  CREATE INDEX orders_status ON orders(status, created_at);
  CREATE INDEX orders_phone ON orders(phone);

  CREATE TABLE admin_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner','editor','orders')),
    password_hash TEXT NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );

  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT
  );
  CREATE INDEX sessions_user ON sessions(user_id);

  CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    at TEXT NOT NULL,
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    summary TEXT
  );

  CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `,
];

function open() {
  const file = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "alshuyukh.db");
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;");

  const version = (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
  for (let v = version; v < MIGRATIONS.length; v++) {
    db.exec("BEGIN IMMEDIATE");
    try {
      // Re-check inside the write lock: parallel build workers may race here.
      const current = (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
      if (current === v) {
        db.exec(MIGRATIONS[v]!);
        db.exec(`PRAGMA user_version = ${v + 1}`);
      }
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  seedDatabase(db);
  return db;
}

const g = globalThis as unknown as { __alshuyukhDb?: DatabaseSync };

export function db() {
  return (g.__alshuyukhDb ??= open());
}

/** Runs fn inside a write transaction (BEGIN IMMEDIATE … COMMIT/ROLLBACK). */
export function tx<T>(fn: (d: DatabaseSync) => T): T {
  const d = db();
  d.exec("BEGIN IMMEDIATE");
  try {
    const out = fn(d);
    d.exec("COMMIT");
    return out;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}

export const nowIso = () => new Date().toISOString();
