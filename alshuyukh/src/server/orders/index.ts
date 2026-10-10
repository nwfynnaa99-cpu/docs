import "server-only";
import { memoryOrderRepository } from "./memory-repository";
import type { OrderRepository } from "./repository";

export const orders: OrderRepository = memoryOrderRepository;
export type * from "./types";
