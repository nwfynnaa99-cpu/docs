"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One tiny runtime for all ambient motion, instead of a component per effect:
 *  - [data-reveal]   → adds data-revealed on first intersection
 *  - [data-parallax] → translateY by (distance from viewport centre × factor)
 *  - [data-magnetic] → gentle pull toward the pointer (fine pointers only)
 * Uses one IntersectionObserver, one rAF-throttled scroll listener, and
 * transform-only writes. Fully inert under prefers-reduced-motion.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.remove("no-js");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    if (reduced) {
      reveals.forEach((el) => el.setAttribute("data-revealed", ""));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    reveals.forEach((el) => io.observe(el));

    // Parallax: only elements currently near the viewport are updated.
    const active = new Set<HTMLElement>();
    const pio = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? active.add(e.target as HTMLElement) : active.delete(e.target as HTMLElement))),
      { rootMargin: "20% 0px" },
    );
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    parallax.forEach((el) => pio.observe(el));

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      active.forEach((el) => {
        const factor = Number(el.dataset.parallax) || 0.1;
        const r = el.getBoundingClientRect();
        // Clamp so the layer never travels further than its own bleed (~12% of height).
        const limit = r.height * 0.12;
        const offset = Math.max(-limit, Math.min(limit, (r.top + r.height / 2 - vh / 2) * -factor));
        const scale = el.dataset.parallaxScale ? 1 + Math.min(Math.abs(offset) / vh, 0.04) : 1;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    // Magnetic buttons
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];
    if (fine) {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const strength = 0.18;
        const move = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const x = (ev.clientX - (r.left + r.width / 2)) * strength;
          const y = (ev.clientY - (r.top + r.height / 2)) * strength;
          el.style.transform = `translate3d(${Math.max(-6, Math.min(6, x))}px, ${Math.max(-5, Math.min(5, y))}px, 0)`;
        };
        const leave = () => (el.style.transform = "");
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });
    }

    return () => {
      io.disconnect();
      pio.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      cleanups.forEach((c) => c());
    };
  }, [pathname]);

  return null;
}
