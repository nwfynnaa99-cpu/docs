import { catalog } from "@/server/catalog";
import { buildMetadata } from "@/lib/seo";
import { toListingItem } from "@/lib/catalog/to-listing";
import { CategoryHeader } from "@/components/category/category-header";
import { CategoryBrowser } from "@/components/category/category-browser";
import { ProductCard } from "@/components/product/product-card";
import { Offers } from "@/components/home/offers";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "اختيارات تستحق",
  description: "بكجات الشيوخ وقطع مختارة بقيمة أفضل: أقمشة ومستلزمات إطلالة رجالية فاخرة.",
  path: "/offers",
});

export default async function OffersPage() {
  const [offers, products] = await Promise.all([catalog.listOffers(), catalog.listProducts()]);
  const discounted = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);

  return (
    <>
      <CategoryHeader
        title="اختيارات تستحق"
        description="اختيارك الآن بقيمة أفضل."
        eyebrow="العروض والبكجات"
        image={{ src: "/media/box-backdrop.webp", alt: "", width: 1600, height: 1600 }}
        crumbs={[{ name: "الرئيسية", href: "/" }, { name: "العروض", href: "/offers" }]}
        count={offers.length + discounted.length}
      />
      <Offers offers={offers} />
      <section aria-labelledby="value-title" className="container-site pb-24">
        <h2 id="value-title" className="mb-8 font-display text-display-sm font-medium">قطع بقيمة أفضل</h2>
        <CategoryBrowser
          listId="offers"
          listName="العروض"
          items={discounted.map(toListingItem)}
          cards={Object.fromEntries(discounted.map((p, i) => [p.id, <ProductCard key={p.id} product={p} index={i % 4} listName="العروض" />]))}
        />
      </section>
    </>
  );
}
