import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/server/catalog";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

// Editorial grid on desktop (12 cols). Mobile: snap carousel of tall cards.
const span = ["md:col-span-7 md:row-span-2", "md:col-span-5", "md:col-span-5", "md:col-span-6", "md:col-span-6"];

export function Collections({ items }: { items: Collection[] }) {
  return (
    <section aria-labelledby="collections-title" className="section bg-ink">
      <div className="container-site">
        <SectionHeading id="collections-title" eyebrow="المجموعات" title="اختيارات الشيوخ" description="مجموعات مرتبة حسب الموسم والخامة، لتصل إلى قماشك من أقصر طريق." />
        <ul className="scrollbar-none -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory scroll-px-[var(--spacing-gutter)] gap-3 overflow-x-auto px-[var(--spacing-gutter)] md:mx-0 md:grid md:auto-rows-[17rem] md:grid-cols-12 md:gap-4 lg:auto-rows-[21rem] md:overflow-visible md:px-0">
          {items.map((c, i) => (
            <li key={c.id} data-reveal="image" style={{ "--stagger": i } as React.CSSProperties} className={cn("w-[82vw] shrink-0 snap-start xs:w-[70vw] md:w-auto", span[i])}>
              <Link href={c.href} className="group relative block aspect-[3/4] overflow-hidden bg-ink-soft md:aspect-auto md:h-full">
                <div className="absolute inset-0">
                  <Image src={c.image.src} alt={c.image.alt} fill sizes={i === 0 ? "(min-width: 768px) 58vw, 82vw" : "(min-width: 768px) 42vw, 82vw"} className="object-cover transition-transform duration-[1800ms] ease-[var(--ease-silk)] group-hover:scale-[1.03]" />
                  <div className="scrim absolute inset-0" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-8">
                  <div>
                    <p className="eyebrow mb-2">{c.subtitle}</p>
                    <h3 className={cn("font-display font-medium text-ivory", i === 0 ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl")}>{c.title}</h3>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center border border-ivory/30 text-ivory transition-colors duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <Icon name="arrow" size={18} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
