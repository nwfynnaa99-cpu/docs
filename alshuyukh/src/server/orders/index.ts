import "server-only";
import type { OrderRepository } from "./repository";
import { sqliteOrderRepository } from "./sqlite-repository";

export const orders: OrderRepository = sqliteOrderRepository;
export type * from "./types";
