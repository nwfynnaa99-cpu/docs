"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * High-magnification fabric loupe. Desktop: zoom follows the pointer.
 * Touch: tap to zoom at the tapped point, tap again to release.
 * Only transform + transform-origin change, so it stays on the compositor.
 */
export function FabricZoom({ src, alt, width, height, zoom = 2.4, sizes, className, priority }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  zoom?: number;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("50% 50%");
  const [active, setActive] = useState(false);

  const place = (clientX: number, clientY: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setOrigin(`${(((clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden bg-ink-soft", active ? "cursor-zoom-out" : "cursor-zoom-in", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setActive(false)}
      onPointerMove={(e) => e.pointerType === "mouse" && place(e.clientX, e.clientY)}
      onClick={(e) => {
        place(e.clientX, e.clientY);
        if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === "mouse") return;
        setActive((a) => !a);
      }}
      role="img"
      aria-label={`${alt} — مرّر أو اضغط للتكبير`}
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={90}
        className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-silk)] will-change-transform"
        style={{ transformOrigin: origin, transform: active ? `scale(${zoom})` : "scale(1)" }}
      />
      <span className={cn("pointer-events-none absolute bottom-4 start-4 bg-ink/70 px-3 py-1.5 text-2xs tracking-wide text-ivory/80 backdrop-blur-sm transition-opacity", active && "opacity-0")}>
        <span className="hidden [@media(hover:hover)]:inline">مرّر للتكبير</span>
        <span className="[@media(hover:hover)]:hidden">اضغط للتكبير</span>
      </span>
    </div>
  );
}
