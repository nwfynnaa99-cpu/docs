import Image from "next/image";
import type { HomepageContent } from "@/server/catalog";
import { ButtonLink } from "@/components/ui/button";

export function Hero({ hero }: { hero: HomepageContent["hero"] }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink-deep">
      {/* Fabric: parallax wrapper (scroll) + slow breathing image (time) */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div data-parallax="0.22" className="absolute inset-x-0 -top-[10%] h-[120%] will-change-transform">
          <Image
            src={hero.image.src}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={70}
            className="drape-breathe object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgb(184_154_90/0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-ink-deep/75 via-ink-deep/10 to-transparent" />
      </div>

      <div className="container-site relative pb-16 pt-32 md:pb-24 lg:pb-28">
        <p className="fade-up eyebrow mb-6 flex items-center gap-3 md:mb-8" style={{ "--line": 0 } as React.CSSProperties}>
          <span className="h-px w-8 bg-gold/70" />
          {hero.eyebrow}
        </p>

        <h1 id="hero-title" className="hero-title font-display font-medium text-display-xl tracking-tight text-ivory">
          {hero.title}
        </h1>
        <p className="text-reveal mt-2 font-display text-display-sm font-normal text-gold-light md:mt-4">
          <span><span style={{ "--line": 1 } as React.CSSProperties}>{hero.tagline}</span></span>
        </p>

        <p className="fade-up mt-6 max-w-md text-base leading-8 text-ivory/70 md:mt-8 md:text-lg" style={{ "--line": 2 } as React.CSSProperties}>
          أقمشة رجالية مختارة بعناية،
          <br />
          لتصنع إطلالة تليق بك.
        </p>

        <div className="fade-up mt-10 flex flex-col gap-3 xs:flex-row xs:items-center md:mt-12" style={{ "--line": 3 } as React.CSSProperties}>
          <ButtonLink href={hero.primaryCta.href} size="lg" data-magnetic className="xs:min-w-52">
            {hero.primaryCta.label}
          </ButtonLink>
          <ButtonLink href={hero.secondaryCta.href} size="lg" variant="secondary" className="xs:min-w-40">
            {hero.secondaryCta.label}
          </ButtonLink>
        </div>
      </div>

      {/* Desktop-only side mark and scroll cue */}
      <div className="pointer-events-none absolute bottom-24 end-[var(--spacing-gutter)] hidden flex-col items-center gap-6 lg:flex" aria-hidden="true">
        <span className="latin-label text-[0.625rem] text-ivory/45 [writing-mode:vertical-rl]">ALSHUYUKH · EST. RIYADH</span>
        <span className="relative h-16 w-px overflow-hidden bg-ivory/15">
          <span className="absolute inset-0 bg-gold [animation:scroll-cue_2.4s_var(--ease-drape)_infinite]" />
        </span>
      </div>
    </section>
  );
}
