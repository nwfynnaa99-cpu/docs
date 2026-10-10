import type { Order, OrderStatus } from "./types";

export interface OrderRepository {
  create(order: Order): Promise<Order>;
  get(id: string): Promise<Order | null>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus, payment?: Partial<NonNullable<Order["payment"]>>): Promise<Order | null>;
  list(filter?: { status?: OrderStatus; limit?: number }): Promise<Order[]>;
}
