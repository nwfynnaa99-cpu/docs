import type { DatabaseSync } from "node:sqlite";
import { categories, collections, coupons, homepage, offers, products, reviews } from "@/server/catalog/seed";

/** First-run seed (idempotent): runs once per database, inside a write lock. */
export function seedDatabase(db: DatabaseSync) {
  if (db.prepare("SELECT 1 FROM meta WHERE key = 'seeded'").get()) return;
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!db.prepare("SELECT 1 FROM meta WHERE key = 'seeded'").get()) {
      const now = new Date().toISOString();
      const put = db.prepare("INSERT OR IGNORE INTO docs (collection, id, slug, sort, data, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
      categories.forEach((c) => put.run("category", c.id, c.slug, c.sortOrder, JSON.stringify(c), now));
      products.forEach((p, i) => put.run("product", p.id, p.slug, i, JSON.stringify(p), now));
      collections.forEach((c) => put.run("collection", c.id, c.slug, c.sortOrder, JSON.stringify(c), now));
      offers.forEach((o, i) => put.run("offer", o.id, null, i, JSON.stringify(o), now));
      reviews.forEach((r, i) => put.run("review", r.id, null, i, JSON.stringify({ approved: true, ...r }), now));
      coupons.forEach((c, i) => put.run("coupon", c.id, null, i, JSON.stringify(c), now));
      put.run("setting", "homepage", null, 0, JSON.stringify({ id: "homepage", ...homepage }), now);
      db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', ?)").run(now);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
