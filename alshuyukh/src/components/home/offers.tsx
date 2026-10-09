import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@/server/catalog";
import { Price } from "@/components/ui/price";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

/** Offers presented as curated packages, never as "sale" noise. */
export function Offers({ offers }: { offers: Offer[] }) {
  return (
    <section aria-labelledby="offers-title" className="section bg-ink">
      <div className="container-site">
        <SectionHeading id="offers-title" eyebrow="البكجات" title="اختيارات تستحق" description="اختيارك الآن بقيمة أفضل." />
        <ul className="grid gap-px border border-ink-line bg-ink-line md:grid-cols-3">
          {offers.map((o, i) => (
            <Reveal as="li" key={o.id} stagger={i} className="group bg-ink">
              <Link href={o.href} className="flex h-full flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={o.image.src} alt={o.image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="zoom-on-hover object-cover opacity-90" />
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <p className="eyebrow">{o.label}</p>
                  <h3 className="mt-3 font-display text-xl md:text-2xl">{o.title}</h3>
                  <p className="mt-2 text-sm text-ivory/55">{o.description}</p>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                    <Price amount={o.price} compareAt={o.compareAtPrice} />
                    <span className="shrink-0 text-sm text-ivory/70 underline decoration-gold/50 underline-offset-8 transition-colors group-hover:text-ivory">اختر البكج</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
