import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/server/catalog";
import { cn } from "@/lib/cn";

/**
 * Horizontal category chips. Scrolls on small screens; becomes a grid from
 * `lg` only when it fits (six items or fewer).
 */
export function CategoryChips({ categories, activeSlug, label }: { categories: Category[]; activeSlug?: string; label: string }) {
  const fitsGrid = categories.length <= 6;
  return (
    <nav aria-label={label}>
      <ul
        className={cn(
          "scrollbar-none -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory scroll-px-[var(--spacing-gutter)] gap-2 overflow-x-auto px-[var(--spacing-gutter)]",
          fitsGrid && "lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:px-0",
        )}
      >
        {categories.map((c, i) => {
          const active = c.slug === activeSlug;
          return (
            <li key={c.id} data-reveal="up" style={{ "--stagger": i } as React.CSSProperties} className="shrink-0 snap-start">
              <Link
                href={`/categories/${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-16 items-center gap-3 border pe-5 transition-colors md:h-[4.5rem]",
                  c.image ? "ps-2" : "ps-5",
                  active ? "border-gold bg-gold/5" : "border-ink-line hover:border-gold/60",
                )}
              >
                {c.image && (
                  <span className="relative size-12 shrink-0 overflow-hidden md:size-14">
                    <Image src={c.image.macro ?? c.image.src} alt="" fill sizes="56px" className="zoom-on-hover object-cover" />
                  </span>
                )}
                <span className={cn("whitespace-nowrap text-sm transition-colors", active ? "text-ivory" : "text-ivory/80 group-hover:text-ivory")}>{c.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
