import "server-only";
import type { CatalogRepository } from "./repository";
import { sqliteCatalog } from "./sqlite-catalog";

/** Active catalog backend. The admin writes to the same database. */
export const catalog: CatalogRepository = sqliteCatalog;

export type * from "./types";
