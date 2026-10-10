import "server-only";
import type { CatalogRepository } from "./repository";
import { seedRepository } from "./seed-repository";

/** Resolves the active catalog backend. Swap here when the database backend lands. */
export const catalog: CatalogRepository = seedRepository;

export type * from "./types";
