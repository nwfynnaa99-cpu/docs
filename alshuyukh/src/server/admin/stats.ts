import "server-only";
import { db } from "@/server/db";
import { docs } from "@/server/db/docs";
import type { Product } from "@/server/catalog/types";

const PAID = "('paid','fulfilled')";

export function dashboardStats() {
  const d = db();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const one = (sql: string, ...args: (string | number)[]) => d.prepare(sql).get(...args) as { n: number; s: number | null };
  const today = one(`SELECT COUNT(*) n, SUM(total) s FROM orders WHERE status IN ${PAID} AND created_at >= ?`, startOfDay.toISOString());
  const month = one(`SELECT COUNT(*) n, SUM(total) s FROM orders WHERE status IN ${PAID} AND created_at >= ?`, since30);
  const pending = one("SELECT COUNT(*) n, 0 s FROM orders WHERE status = 'paid'"); // paid, awaiting fulfilment
  const products = docs.list<Product>("product");
  return {
    todayOrders: today.n,
    todayRevenue: today.s ?? 0,
    monthOrders: month.n,
    monthRevenue: month.s ?? 0,
    toFulfil: pending.n,
    lowStock: products.filter((p) => p.inventory <= 5).sort((a, b) => a.inventory - b.inventory).slice(0, 8),
    productCount: products.length,
  };
}

export function customers() {
  return db()
    .prepare(
      `SELECT phone,
              json_extract(data, '$.contact.name') AS name,
              json_extract(data, '$.address.city') AS city,
              COUNT(*) AS orders,
              SUM(CASE WHEN status IN ${PAID} THEN total ELSE 0 END) AS spent,
              MAX(created_at) AS last_order
       FROM orders GROUP BY phone ORDER BY last_order DESC LIMIT 500`,
    )
    .all() as { phone: string; name: string; city: string; orders: number; spent: number; last_order: string }[];
}
