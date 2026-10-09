import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/server/catalog";
import { Reveal } from "@/components/motion/reveal";

/** Fast path to products: every fabric category one tap away, right under the hero. */
export function SeasonStrip({ categories }: { categories: Category[] }) {
  return (
    <section aria-label="تسوق حسب نوع القماش" className="border-b border-ink-line bg-ink">
      <div className="container-site py-8 md:py-10">
        <ul className="scrollbar-none -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory scroll-px-[var(--spacing-gutter)] gap-2 overflow-x-auto px-[var(--spacing-gutter)] lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:px-0">
          {categories.map((c, i) => (
            <Reveal as="li" key={c.id} stagger={i} className="shrink-0 snap-start">
              <Link href={`/categories/${c.slug}`} className="group flex h-16 items-center gap-3 border border-ink-line pe-5 ps-2 transition-colors hover:border-gold/60 md:h-[4.5rem]">
                {c.image && (
                  <span className="relative size-12 shrink-0 overflow-hidden md:size-14">
                    <Image src={c.image.macro ?? c.image.src} alt="" fill sizes="56px" className="zoom-on-hover object-cover" />
                  </span>
                )}
                <span className="whitespace-nowrap text-sm text-ivory/80 transition-colors group-hover:text-ivory">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
