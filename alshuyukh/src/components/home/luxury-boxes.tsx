import Image from "next/image";
import type { HomepageContent } from "@/server/catalog";
import { formatAmount } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";

const contents = ["قماش مختار", "شماغ", "عطر", "عود"];

/**
 * The box is drawn in CSS (no photo needed): base and lid move at
 * different parallax rates, so the lid appears to lift as you scroll.
 */
export function LuxuryBoxes({ content }: { content: HomepageContent["boxes"] }) {
  return (
    <section aria-labelledby="boxes-title" className="relative isolate overflow-hidden bg-ink-deep">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div data-parallax="0.12" className="absolute inset-x-0 -top-[15%] h-[130%]">
          <Image src="/media/box-backdrop.webp" alt="" fill sizes="100vw" quality={60} className="object-cover opacity-60" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-ink-deep via-ink-deep/80 to-ink-deep/30" />
      </div>

      <div className="container-site section grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <Reveal as="p" className="eyebrow mb-4">هدايا الدار</Reveal>
          <Reveal as="h2" id="boxes-title" stagger={1} className="font-display text-display font-medium">{content.title}</Reveal>
          <Reveal as="p" stagger={2} className="mt-4 font-display text-xl text-gold-light md:text-2xl">{content.subtitle}</Reveal>
          <Reveal as="p" stagger={3} className="mt-6 max-w-md text-base leading-8 text-ivory/65 md:text-lg">{content.body}</Reveal>
          <Reveal as="ul" stagger={4} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ivory/75">
            {contents.map((c) => (
              <li key={c} className="flex items-center gap-2"><span className="size-1 rotate-45 bg-gold" />{c}</li>
            ))}
          </Reveal>
          <Reveal stagger={5} className="mt-10 flex flex-wrap items-center gap-6">
            <ButtonLink href={content.href} size="lg" data-magnetic>اختر بوكسك</ButtonLink>
            <p className="tabular text-sm text-ivory/60">يبدأ من {formatAmount(content.priceFrom)} ر.س</p>
          </Reveal>
        </div>

        <Reveal variant="fade" className="relative mx-auto aspect-square w-full max-w-[26rem]" aria-hidden="true">
          {/* Shadow */}
          <div className="absolute inset-x-[8%] bottom-[2%] h-[12%] rounded-[50%] bg-black/80 blur-2xl" />
          {/* Base */}
          <div data-parallax="0.04" className="absolute inset-x-[6%] bottom-[8%] top-[26%] border border-gold/25 bg-gradient-to-b from-[#151412] to-[#0a0a09] shadow-[inset_0_1px_0_rgb(212_184_120/0.15)]">
            <div className="absolute inset-y-0 start-1/2 w-px bg-gold/40" />
          </div>
          {/* Lid */}
          <div data-parallax="0.1" className="absolute inset-x-[3%] top-[14%] h-[24%] border border-gold/35 bg-gradient-to-b from-[#1c1a17] to-[#0f0e0c] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)]">
            <div className="absolute inset-y-0 start-1/2 w-px bg-gold/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="bg-[#14130f] px-4 font-display text-2xl text-ivory md:text-3xl">الشيوخ</span>
              <span className="latin-label mt-1 bg-[#14130f] px-3 text-[0.5rem] text-gold">ALSHUYUKH</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
