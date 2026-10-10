"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Media } from "@/server/catalog";
import { cn } from "@/lib/cn";
import { FabricZoom } from "./fabric-zoom";

/**
 * Desktop: one large zoomable image with thumbnails.
 * Mobile: swipeable snap carousel with position dots; tap an image to zoom.
 */
// Identical `sizes` on the mobile and desktop renders so both priority
// preloads resolve to the same URL and the hero image downloads once.
const SIZES = "(min-width: 1024px) 50vw, (min-width: 768px) 55vw, 100vw";

export function ProductGallery({ images, name }: { images: Media[]; name: string }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const current = images[active] ?? images[0];
  if (!current) return null;

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (i !== active) setActive(i);
  };
  const goTo = (i: number) => {
    setActive(i);
    const el = track.current;
    // RTL scroll offsets are negative in modern browsers
    if (el) el.scrollTo({ left: -i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      {/* Mobile carousel */}
      <div className="md:hidden">
        <div ref={track} onScroll={onScroll} className="scrollbar-none -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory overflow-x-auto" aria-roledescription="carousel" aria-label={`صور ${name}`}>
          {images.map((img, i) => (
            <div key={img.src + i} className="w-full shrink-0 snap-center" aria-roledescription="slide" aria-label={`${i + 1} من ${images.length}`}>
              <FabricZoom src={img.src} alt={img.alt} width={img.width} height={img.height} sizes={SIZES} priority={i === 0} zoom={2.2} className="aspect-[4/5] w-full" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {images.map((_, i) => (
              <button key={i} type="button" onClick={() => goTo(i)} aria-label={`الصورة ${i + 1}`} aria-current={i === active} className="grid size-8 place-items-center">
                <span className={cn("h-px transition-all duration-500", i === active ? "w-6 bg-gold" : "w-3 bg-ivory/30")} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnails + main */}
      <div className="hidden gap-4 md:grid md:grid-cols-[5rem_1fr]">
        <ul className="flex flex-col gap-3" aria-label="صور المنتج">
          {images.map((img, i) => (
            <li key={img.src + i}>
              <button type="button" onClick={() => setActive(i)} aria-label={`عرض الصورة ${i + 1}`} aria-current={i === active} className={cn("block w-full overflow-hidden border transition-colors", i === active ? "border-gold" : "border-transparent opacity-60 hover:opacity-100")}>
                <Image src={img.src} alt="" width={80} height={100} className="aspect-[4/5] w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
        <FabricZoom key={current.src} src={current.src} alt={current.alt} width={current.width} height={current.height} sizes={SIZES} priority={active === 0} zoom={2.6} className="aspect-[4/5] w-full" />
      </div>
    </div>
  );
}
