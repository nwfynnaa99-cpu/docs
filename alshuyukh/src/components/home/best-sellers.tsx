import Link from "next/link";
import type { Product } from "@/server/catalog";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

export function BestSellers({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="best-title" className="section border-t border-ink-line bg-ink">
      <div className="container-site">
        <SectionHeading
          id="best-title"
          eyebrow="الأكثر طلبًا"
          title="الأكثر اختيارًا"
          description="قطع اختارها عملاؤنا لأنها تجمع بين الجودة والحضور."
          action={<Link href="/categories/fabrics?sort=best" className="inline-flex h-11 items-center gap-2 text-sm text-ivory/75 underline decoration-gold/50 underline-offset-8 hover:text-ivory">عرض كل الأقمشة</Link>}
        />
        {/* 2 products on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} listName="الأكثر اختيارًا" className={cn(i >= 2 && "max-lg:hidden")} />
          ))}
        </div>
      </div>
    </section>
  );
}
