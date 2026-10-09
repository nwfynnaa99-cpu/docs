import type { Category } from "@/server/catalog";
import { CategoryChips } from "@/components/category/category-chips";

/** Fast path to products: every fabric category one tap away, right under the hero. */
export function SeasonStrip({ categories }: { categories: Category[] }) {
  return (
    <section className="border-b border-ink-line bg-ink">
      <div className="container-site py-8 md:py-10">
        <CategoryChips categories={categories} label="تسوق حسب نوع القماش" />
      </div>
    </section>
  );
}
