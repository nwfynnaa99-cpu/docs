import "server-only";
import { db, nowIso, tx } from "@/server/db";
import type { Product } from "@/server/catalog/types";
import type { OrderRepository } from "./repository";
import type { Order } from "./types";

type Row = { data: string };
const rowToOrder = (r: Row | undefined) => (r ? (JSON.parse(r.data) as Order) : null);

export const sqliteOrderRepository: OrderRepository = {
  async create(order) {
    db()
      .prepare("INSERT INTO orders (id, idempotency_key, status, phone, total, created_at, updated_at, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(order.id, order.idempotencyKey, order.status, order.contact.phone, order.totals.total, order.createdAt, order.updatedAt, JSON.stringify(order));
    return order;
  },
  async get(id) {
    return rowToOrder(db().prepare("SELECT data FROM orders WHERE id = ?").get(id) as Row | undefined);
  },
  async findByIdempotencyKey(key) {
    return rowToOrder(db().prepare("SELECT data FROM orders WHERE idempotency_key = ?").get(key) as Row | undefined);
  },
  async updateStatus(id, status, payment) {
    return tx((d) => {
      const order = rowToOrder(d.prepare("SELECT data FROM orders WHERE id = ?").get(id) as Row | undefined);
      if (!order) return null;
      const wasPaid = order.status === "paid" || order.status === "fulfilled";
      const nowPaid = status === "paid" || status === "fulfilled";
      order.status = status;
      order.updatedAt = nowIso();
      if (payment) order.payment = { provider: order.payment?.provider ?? "unknown", ...order.payment, ...payment };

      // Stock moves exactly once: deducted on payment, restored on cancelling a paid order.
      const delta = !wasPaid && nowPaid ? -1 : wasPaid && status === "cancelled" ? 1 : 0;
      if (delta) {
        const get = d.prepare("SELECT data FROM docs WHERE collection = 'product' AND id = ?");
        const put = d.prepare("UPDATE docs SET data = ?, updated_at = ? WHERE collection = 'product' AND id = ?");
        for (const l of order.lines) {
          const row = get.get(l.productId) as Row | undefined;
          if (!row) continue;
          const p = JSON.parse(row.data) as Product;
          p.inventory = Math.max(0, p.inventory + delta * l.quantity);
          put.run(JSON.stringify(p), order.updatedAt, p.id);
        }
      }
      d.prepare("UPDATE orders SET status = ?, updated_at = ?, data = ? WHERE id = ?").run(status, order.updatedAt, JSON.stringify(order), id);
      return order;
    });
  },
  async list(filter = {}) {
    const rows = filter.status
      ? db().prepare("SELECT data FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ?").all(filter.status, filter.limit ?? 500)
      : db().prepare("SELECT data FROM orders ORDER BY created_at DESC LIMIT ?").all(filter.limit ?? 500);
    return (rows as Row[]).map((r) => JSON.parse(r.data) as Order);
  },
};
