import "server-only";
import { db, nowIso } from "./index";

/**
 * Document-style storage for catalog and content entities: one row per
 * entity, JSON body, with slug and sort lifted into columns for lookups.
 */
export type Collection = "product" | "category" | "collection" | "offer" | "review" | "coupon" | "setting";

type Row = { data: string };
const parse = <T>(r: Row | undefined) => (r ? (JSON.parse(r.data) as T) : null);

export const docs = {
  list<T>(collection: Collection): T[] {
    return (db().prepare("SELECT data FROM docs WHERE collection = ? ORDER BY sort, id").all(collection) as Row[]).map((r) => JSON.parse(r.data) as T);
  },
  get<T>(collection: Collection, id: string): T | null {
    return parse<T>(db().prepare("SELECT data FROM docs WHERE collection = ? AND id = ?").get(collection, id) as Row | undefined);
  },
  getBySlug<T>(collection: Collection, slug: string): T | null {
    return parse<T>(db().prepare("SELECT data FROM docs WHERE collection = ? AND slug = ?").get(collection, slug) as Row | undefined);
  },
  put<T extends { id: string }>(collection: Collection, doc: T, opts: { slug?: string | null; sort?: number } = {}) {
    db()
      .prepare(
        `INSERT INTO docs (collection, id, slug, sort, data, updated_at) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(collection, id) DO UPDATE SET slug = excluded.slug, sort = excluded.sort, data = excluded.data, updated_at = excluded.updated_at`,
      )
      .run(collection, doc.id, opts.slug ?? null, opts.sort ?? 0, JSON.stringify(doc), nowIso());
    return doc;
  },
  remove(collection: Collection, id: string) {
    return db().prepare("DELETE FROM docs WHERE collection = ? AND id = ?").run(collection, id).changes > 0;
  },
  slugTaken(collection: Collection, slug: string, exceptId?: string) {
    const r = db().prepare("SELECT id FROM docs WHERE collection = ? AND slug = ?").get(collection, slug) as { id: string } | undefined;
    return !!r && r.id !== exceptId;
  },
};
