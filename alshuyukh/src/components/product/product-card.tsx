import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/server/catalog";
import { discountPercent } from "@/lib/format";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { cn } from "@/lib/cn";
import { AddToCartButton, WishlistButton } from "./product-actions";
import { SelectProductLink } from "./select-product-link";

const unitLabel = { meter: "متر", piece: "قطعة", set: "طقم" } as const;

export function ProductCard({ product, index = 0, priority = false, className, listName }: {
  product: Product;
  index?: number;
  priority?: boolean;
  className?: string;
  listName?: string;
}) {
  const img = product.images[0];
  const off = discountPercent(product.price, product.compareAtPrice);
  const inStock = product.inventory > 0;
  const href = `/products/${product.slug}`;
  const cartable = { id: product.id, slug: product.slug, name: product.name, price: product.price, image: img?.src ?? "", unitLabel: unitLabel[product.unit] };

  return (
    <article className={cn("group relative flex w-full flex-col", className)} data-reveal="up" style={{ "--stagger": index } as React.CSSProperties}>
      <div className="relative overflow-hidden bg-ink-soft">
        <SelectProductLink href={href} product={{ id: product.id, name: product.name, price: product.price, index }} listName={listName} tabIndex={-1} aria-hidden="true">
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              priority={priority}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
              className="zoom-on-hover aspect-[4/5] w-full object-cover"
            />
          )}
        </SelectProductLink>
        {!inStock && <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-xs tracking-wide text-ivory/80 backdrop-blur-sm">نفدت الكمية</span>}
        {off > 0 && inStock && <span className="tabular absolute start-3 top-3 bg-ink/80 px-2.5 py-1 text-2xs tracking-wide text-gold backdrop-blur-sm"><bdi dir="ltr">-{off}%</bdi></span>}
        <WishlistButton product={cartable} className="absolute end-2 top-2" />
      </div>

      <div className="flex flex-1 flex-col pt-4 md:pt-5">
        <Rating value={product.rating.average} count={product.rating.count} className="mb-2 text-xs" />
        <h3 className="font-display text-base leading-snug md:text-lg">
          <SelectProductLink href={href} product={{ id: product.id, name: product.name, price: product.price, index }} listName={listName} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {product.name}
          </SelectProductLink>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ivory/55">{product.shortDescription}</p>
        <Price amount={product.price} compareAt={product.compareAtPrice} unit={unitLabel[product.unit]} className="mt-3" />
        <div className="relative z-10 mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {inStock ? (
            <AddToCartButton product={cartable} className="w-full" />
          ) : (
            <span className="inline-flex h-10 w-full items-center justify-center border border-ink-line text-sm text-stone">غير متوفر حاليًا</span>
          )}
          <Link href={href} className="inline-flex h-10 items-center justify-center text-sm text-ivory/70 underline-offset-8 transition-colors hover:text-ivory hover:underline">
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
}
