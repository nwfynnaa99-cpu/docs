import "server-only";
import { docs } from "@/server/db/docs";
import { homepage as seedHomepage } from "./seed";
import { memoryCatalog } from "./memory-catalog";
import type { HomepageContent } from "./types";

/** Storefront reads straight from SQLite; pages cache via ISR and are revalidated on admin edits. */
export const sqliteCatalog = memoryCatalog(() => ({
  categories: docs.list("category"),
  products: docs.list("product"),
  collections: docs.list("collection"),
  offers: docs.list("offer"),
  reviews: docs.list("review"),
  homepage: docs.get<HomepageContent & { id: string }>("setting", "homepage") ?? seedHomepage,
}));
