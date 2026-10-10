import type { HomepageContent } from "@/server/catalog";
import { FabricZoom } from "@/components/product/fabric-zoom";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";

const numerals = ["01", "02", "03", "04"];

/** Light section: the one place the page turns ivory, to let the macro weave be seen. */
export function FabricDetail({ content }: { content: HomepageContent["fabricDetail"] }) {
  return (
    <section aria-labelledby="fabric-title" className="section bg-ivory text-ink">
      <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
        <Reveal variant="image" className="lg:col-span-7">
          <FabricZoom src={content.image.src} alt={content.image.alt} width={content.image.width} height={content.image.height} sizes="(min-width: 1024px) 55vw, 100vw" className="aspect-square md:aspect-[5/4]" />
        </Reveal>
        <div className="lg:col-span-5">
          <Reveal as="p" className="eyebrow mb-4 !text-[#8a6f37]">تجربة القماش</Reveal>
          <Reveal as="h2" id="fabric-title" stagger={1} className="font-display text-display-sm font-medium">{content.title}</Reveal>
          <Reveal as="p" stagger={2} className="mt-5 text-base leading-8 text-stone-dark md:text-lg">{content.body}</Reveal>
          <dl className="mt-10 divide-y divide-hairline border-y border-hairline">
            {content.points.map((p, i) => (
              <Reveal key={p.label} stagger={3 + i} className="py-5 ps-16 relative">
                <dt className="font-display text-lg">
                  <span className="latin-label absolute start-0 top-6 text-sm text-[#8a6f37]" aria-hidden="true">{numerals[i]}</span>
                  {p.label}
                </dt>
                <dd className="mt-1 text-sm leading-7 text-stone-dark">{p.text}</dd>
              </Reveal>
            ))}
          </dl>
          <Reveal stagger={8} className="mt-10">
            <ButtonLink href="/categories/japanese-fabrics" variant="light" size="lg">اكتشف الأقمشة اليابانية</ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
