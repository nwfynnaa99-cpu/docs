import Image from "next/image";
import type { Media } from "@/server/catalog";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { countLabel } from "@/lib/format";

/** Editorial banner: large type over a dark-scrimmed fabric image. */
export function CategoryHeader({ title, description, eyebrow, image, crumbs, count }: {
  title: string;
  description?: string;
  eyebrow?: string;
  image?: Media;
  crumbs: Crumb[];
  count: number;
}) {
  return (
    <header className="relative isolate overflow-hidden bg-ink-deep">
      {image && (
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div data-parallax="0.12" className="absolute inset-x-0 -top-[12%] h-[124%]">
            <Image src={image.src} alt="" fill priority sizes="100vw" quality={50} className="object-cover opacity-55" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink-deep/40" />
        </div>
      )}
      <div className="container-site flex min-h-[19rem] flex-col justify-end pb-10 pt-28 md:min-h-[26rem] md:pb-14 md:pt-36">
        <Breadcrumbs items={crumbs} className="mb-6" />
        {eyebrow && <p className="fade-up eyebrow mb-3" style={{ "--line": 0 } as React.CSSProperties}>{eyebrow}</p>}
        <h1 className="hero-title font-display text-display font-medium text-ivory">{title}</h1>
        {description && (
          <p className="fade-up mt-4 max-w-xl text-base leading-8 text-ivory/70 md:text-lg" style={{ "--line": 1 } as React.CSSProperties}>
            {description}
          </p>
        )}
        <p className="fade-up tabular mt-4 text-sm text-stone" style={{ "--line": 2 } as React.CSSProperties}>{countLabel(count)}</p>
      </div>
    </header>
  );
}
