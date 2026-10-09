import { notFound } from "next/navigation";
import { catalog, type Category, type Product } from "@/server/catalog";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { toListingItem } from "@/lib/catalog/to-listing";
import { site } from "@/config/site";
import { CategoryHeader } from "@/components/category/category-header";
import { CategoryChips } from "@/components/category/category-chips";
import { CategoryBrowser } from "@/components/category/category-browser";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 300;
// Categories added later in the CMS render on first request, then cache.
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await catalog.listCategories()).map((c) => ({ slug: c.slug }));
}

async function load(slug: string) {
  const [category, all] = await Promise.all([catalog.getCategory(slug), catalog.listCategories()]);
  if (!category) return null;
  const products = await catalog.listProducts({ categorySlug: slug });
  const parent = category.parentId ? all.find((c) => c.id === category.parentId) : undefined;
  const children = all.filter((c) => c.parentId === category.id);
  const siblings = parent ? all.filter((c) => c.parentId === parent.id) : [];
  return { category, products, parent, children, siblings };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const { category, products } = data;
  return buildMetadata({
    title: category.name,
    description: category.description
      ? `${category.description} تسوق ${category.name} من ${site.name}: ${products.length} منتج مختار بعناية.`
      : `تسوق ${category.name} من ${site.name}، دار الأقمشة الرجالية السعودية الفاخرة.`,
    path: `/categories/${slug}`,
    image: category.image?.src,
  });
}

const headerImage = (category: Category, children: Category[], products: Product[]) =>
  category.image ?? children.find((c) => c.image)?.image ?? products[0]?.images[0];

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { category, products, parent, children, siblings } = data;

  const crumbs = [
    { name: "الرئيسية", href: "/" },
    ...(parent ? [{ name: parent.name, href: `/categories/${parent.slug}` }] : []),
    { name: category.name, href: `/categories/${category.slug}` },
  ];
  const nav = children.length ? children : siblings;

  return (
    <>
      <CategoryHeader
        title={category.name}
        description={category.description}
        eyebrow={parent?.name}
        image={headerImage(category, children, products)}
        crumbs={crumbs}
        count={products.length}
      />

      <div className="container-site pb-24">
        {nav.length > 0 && (
          <div className="py-8 md:py-10">
            <CategoryChips categories={nav} activeSlug={category.slug} label={children.length ? `أقسام ${category.name}` : `أقسام ${parent?.name ?? ""}`} />
          </div>
        )}

        {products.length === 0 ? (
          <section className="flex flex-col items-center py-24 text-center">
            <p className="eyebrow">قريبًا</p>
            <h2 className="mt-4 font-display text-display-sm">نجهّز هذا القسم بعناية</h2>
            <p className="mt-4 max-w-md text-ivory/60">نضيف قطع {category.name} قريبًا. اكتشف الأقمشة المختارة إلى ذلك الحين.</p>
            <ButtonLink href="/categories/fabrics" className="mt-10">اكتشف الأقمشة</ButtonLink>
          </section>
        ) : (
          <CategoryBrowser
            listId={category.slug}
            listName={category.name}
            items={products.map(toListingItem)}
            cards={Object.fromEntries(products.map((p, i) => [p.id, <ProductCard key={p.id} product={p} index={i % 4} priority={i < 2} listName={category.name} />]))}
          />
        )}
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: category.name,
          description: category.description,
          url: absoluteUrl(`/categories/${category.slug}`),
          inLanguage: "ar-SA",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: products.length,
            itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/products/${p.slug}`), name: p.name })),
          },
        }}
      />
    </>
  );
}
