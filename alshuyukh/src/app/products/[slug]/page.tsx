import { notFound } from "next/navigation";
import { catalog, type Product } from "@/server/catalog";
import { site } from "@/config/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Icon } from "@/components/ui/icon";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { FabricSpecs } from "@/components/product/fabric-specs";
import { FabricZoom } from "@/components/product/fabric-zoom";
import { MeterGuide } from "@/components/product/meter-guide";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCard } from "@/components/product/product-card";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await catalog.listProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await catalog.getProduct(slug);
  if (!p) return {};
  return buildMetadata({
    title: p.name,
    description: `${p.shortDescription} ${p.fabric ? `${p.fabric.material}، ${p.fabric.season}. ` : ""}اطلبه من ${site.name} مع شحن لكل مدن المملكة.`,
    path: `/products/${p.slug}`,
    image: p.images[0]?.src,
  });
}

const unitLabel = { meter: "متر", piece: "قطعة", set: "طقم" } as const;

async function related(p: Product) {
  const all = await catalog.listProducts();
  const shared = (q: Product) => q.categoryIds.filter((c) => p.categoryIds.includes(c)).length;
  return all
    .filter((q) => q.id !== p.id && shared(q) > 0)
    .sort((a, b) => shared(b) - shared(a) || b.rating.count - a.rating.count)
    .slice(0, 4);
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await catalog.getProduct(slug);
  if (!product) notFound();

  const [categories, reviews, more] = await Promise.all([catalog.listCategories(), catalog.listReviews({ productId: product.id }), related(product)]);
  // Keep the product's own category order: its first sub-category is the primary one.
  const cats = product.categoryIds.map((id) => categories.find((c) => c.id === id)).filter((c) => !!c);
  const top = cats.find((c) => !c.parentId);
  const sub = cats.find((c) => c.parentId === top?.id) ?? cats.find((c) => c.parentId);
  const inStock = product.inventory > 0;

  const gallery = [...product.images, ...product.images.filter((i) => i.macro).map((i) => ({ src: i.macro!, alt: `${i.alt} — تفاصيل النسيج عن قرب`, width: 1200, height: 1200 }))];
  const macro = product.images.find((i) => i.macro);

  const crumbs = [
    { name: "الرئيسية", href: "/" },
    ...(top ? [{ name: top.name, href: `/categories/${top.slug}` }] : []),
    ...(sub ? [{ name: sub.name, href: `/categories/${sub.slug}` }] : []),
    { name: product.name, href: `/products/${product.slug}` },
  ];

  const highlights = product.fabric
    ? [product.fabric.material, `${product.fabric.season} · ${product.fabric.texture}`, `العرض ${product.fabric.width}`]
    : [];

  return (
    <>
      <div className="container-site pb-16 pt-24 md:pt-32">
        <Breadcrumbs items={crumbs} className="mb-6 md:mb-10" />

        <div className="grid gap-10 md:grid-cols-12 lg:gap-16">
          <div className="md:col-span-7">
            <ProductGallery images={gallery} name={product.name} />
          </div>

          <div className="md:col-span-5">
            <div className="md:sticky md:top-24">
              {sub && <p className="eyebrow mb-3">{sub.name}</p>}
              <h1 className="hero-title font-display text-display-sm font-medium">{product.name}</h1>
              <a href="#reviews" className="mt-3 inline-flex min-h-8 items-center">
                <Rating value={product.rating.average} count={product.rating.count} />
              </a>
              <Price amount={product.price} compareAt={product.compareAtPrice} unit={unitLabel[product.unit]} size="lg" className="mt-6" />
              <p className="mt-1 text-xs text-stone">شامل ضريبة القيمة المضافة</p>
              <p className="mt-6 leading-8 text-ivory/75">{product.shortDescription}</p>

              {highlights.length > 0 && (
                <ul className="mt-6 space-y-2 text-sm text-ivory/75">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-center gap-3"><span className="size-1 rotate-45 bg-gold" aria-hidden="true" />{h}</li>
                  ))}
                </ul>
              )}

              <div className="mt-8">
                <PurchasePanel
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    image: product.images[0]?.src ?? "",
                    unit: product.unit,
                    inStock,
                    category: sub?.name ?? top?.name,
                  }}
                />
              </div>

              {product.unit === "meter" && <div className="mt-8"><MeterGuide /></div>}

              <ul className="mt-8 grid grid-cols-2 gap-4 text-xs text-ivory/65">
                <li className="flex items-center gap-2"><Icon name="truck" size={18} className="text-gold" /> شحن خلال 1–4 أيام</li>
                <li className="flex items-center gap-2"><Icon name="return" size={18} className="text-gold" /> استرجاع خلال 14 يومًا</li>
                <li className="flex items-center gap-2"><Icon name="lock" size={18} className="text-gold" /> دفع آمن</li>
                <li className="flex items-center gap-2"><Icon name="gift" size={18} className="text-gold" /> تغليف هدايا متاح</li>
              </ul>
              <p className="mt-6 text-xs text-stone">
                مدى · Apple Pay · Visa · Mastercard · تمارا
              </p>
            </div>
          </div>
        </div>
      </div>

      {product.fabric && (
        <section aria-labelledby="specs-title" className="section border-t border-ink-line">
          <div className="container-site">
            <SectionHeading id="specs-title" eyebrow="المواصفات" title="تفاصيل القماش" description={product.description} />
            <FabricSpecs fabric={product.fabric} />
          </div>
        </section>
      )}

      {macro?.macro && (
        <section aria-labelledby="macro-title" className="section bg-ivory text-ink">
          <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
            <Reveal variant="image" className="lg:col-span-7">
              <FabricZoom src={macro.macro} alt={`نسيج ${product.name} عن قرب`} width={1200} height={1200} zoom={2.8} sizes="(min-width: 1024px) 55vw, 100vw" className="aspect-square md:aspect-[5/4]" />
            </Reveal>
            <div className="lg:col-span-5">
              <Reveal as="p" className="eyebrow mb-4 !text-[#8a6f37]">عن قرب</Reveal>
              <Reveal as="h2" id="macro-title" stagger={1} className="font-display text-display-sm font-medium">تفاصيل تحكي الفخامة</Reveal>
              <Reveal as="p" stagger={2} className="mt-5 text-base leading-8 text-stone-dark md:text-lg">
                مرّر المؤشر على الصورة أو اضغط عليها لترى النسيج والخامة والملمس واللون كما تراها بين يديك.
              </Reveal>
              {product.fabric && (
                <Reveal as="dl" stagger={3} className="mt-8 grid grid-cols-2 gap-6 border-t border-hairline pt-8 text-sm">
                  <div><dt className="text-stone-dark">النسيج</dt><dd className="mt-1 font-display text-lg">{product.fabric.type}</dd></div>
                  <div><dt className="text-stone-dark">الملمس</dt><dd className="mt-1 font-display text-lg">{product.fabric.texture}</dd></div>
                  <div><dt className="text-stone-dark">الخامة</dt><dd className="mt-1 font-display text-lg">{product.fabric.material}</dd></div>
                  <div><dt className="text-stone-dark">اللون</dt><dd className="mt-1 font-display text-lg">{product.fabric.color}</dd></div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {!product.fabric && (
        <section aria-labelledby="desc-title" className="section border-t border-ink-line">
          <div className="container-site max-w-3xl">
            <h2 id="desc-title" className="font-display text-display-sm font-medium">عن المنتج</h2>
            <p className="mt-6 text-lg leading-9 text-ivory/75">{product.description}</p>
          </div>
        </section>
      )}

      <section id="reviews" aria-labelledby="reviews-title" className="section scroll-mt-24 border-t border-ink-line">
        <div className="container-site">
          <SectionHeading id="reviews-title" eyebrow="آراء العملاء" title="ماذا قالوا عنه" />
          <ProductReviews reviews={reviews} average={product.rating.average} count={product.rating.count} />
        </div>
      </section>

      {more.length > 0 && (
        <section aria-labelledby="related-title" className="section border-t border-ink-line">
          <div className="container-site">
            <SectionHeading id="related-title" eyebrow="من الدار" title="قد يعجبك أيضًا" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {more.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} listName="قد يعجبك أيضًا" />
              ))}
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          sku: product.sku,
          image: product.images.map((i) => absoluteUrl(i.src)),
          brand: { "@type": "Brand", name: site.name },
          category: sub?.name ?? top?.name,
          ...(product.fabric && {
            material: product.fabric.material,
            color: product.fabric.color,
            ...(product.fabric.origin && { countryOfOrigin: product.fabric.origin }),
          }),
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/products/${product.slug}`),
            priceCurrency: "SAR",
            price: (product.price / 100).toFixed(2),
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: site.name },
            ...(product.unit === "meter" && { priceSpecification: { "@type": "UnitPriceSpecification", price: (product.price / 100).toFixed(2), priceCurrency: "SAR", unitCode: "MTR" } }),
          },
          aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average, reviewCount: product.rating.count, bestRating: 5 },
          ...(reviews.length > 0 && {
            review: reviews.map((r) => ({
              "@type": "Review",
              author: { "@type": "Person", name: r.author },
              datePublished: r.createdAt,
              reviewBody: r.body,
              reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            })),
          }),
        }}
      />
    </>
  );
}
