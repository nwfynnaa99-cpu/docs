import type { OrderRepository } from "./repository";
import type { Order } from "./types";

/**
 * In-process order store for development and demos. Orders are lost on
 * restart and are not shared between instances; the CMS phase replaces it
 * with a database implementation of the same interface.
 */
const g = globalThis as unknown as { __alshuyukhOrders?: Map<string, Order> };
const orders = (g.__alshuyukhOrders ??= new Map<string, Order>());

export const memoryOrderRepository: OrderRepository = {
  async create(order) {
    orders.set(order.id, structuredClone(order));
    return order;
  },
  async get(id) {
    const o = orders.get(id);
    return o ? structuredClone(o) : null;
  },
  async findByIdempotencyKey(key) {
    for (const o of orders.values()) if (o.idempotencyKey === key) return structuredClone(o);
    return null;
  },
  async updateStatus(id, status, payment) {
    const o = orders.get(id);
    if (!o) return null;
    o.status = status;
    o.updatedAt = new Date().toISOString();
    if (payment) o.payment = { provider: o.payment?.provider ?? "unknown", ...o.payment, ...payment };
    return structuredClone(o);
  },
  async list(filter = {}) {
    let list = [...orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filter.status) list = list.filter((o) => o.status === filter.status);
    return (filter.limit ? list.slice(0, filter.limit) : list).map((o) => structuredClone(o));
  },
};
