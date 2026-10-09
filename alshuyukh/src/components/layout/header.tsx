"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/cn";
import { cartStore, cartTotals, openOverlay } from "@/lib/store/cart";
import { Icon, type IconName } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";

function IconButton({ icon, label, onClick, href, badge, className }: { icon: IconName; label: string; onClick?: () => void; href?: string; badge?: number; className?: string }) {
  const cls = cn("relative grid size-11 place-items-center text-ivory/80 transition-colors hover:text-ivory", className);
  const inner = (
    <>
      <Icon name={icon} />
      {!!badge && <span className="tabular absolute end-1 top-1.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.625rem] leading-4 font-semibold text-ink">{badge}</span>}
    </>
  );
  return href ? <Link href={href} aria-label={label} className={cls}>{inner}</Link> : <button type="button" aria-label={label} onClick={onClick} className={cls}>{inner}</button>;
}

/**
 * Sticky header. Transparent over the hero, then condenses (88 → 64px)
 * into a blurred black bar after the first scroll.
 * Desktop: logo left · nav centre · actions right (as specified, physical sides).
 * Mobile:  menu · logo · search · cart.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const count = cartStore.useStore((s) => cartTotals(s.lines).count);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = pathname === "/" && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-silk)]",
        overHero ? "border-b border-transparent bg-gradient-to-b from-ink-deep/60 to-transparent" : "border-b border-ink-line/80 bg-ink/85 backdrop-blur-xl",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        انتقل إلى المحتوى
      </a>
      <div className={cn("container-site grid items-center transition-[height] duration-500 ease-[var(--ease-silk)]", "grid-cols-[1fr_auto_1fr]", scrolled ? "h-16" : "h-[4.5rem] md:h-[5.5rem]")}>
        {/* RTL: first column renders on the right → actions on the right. */}
        <div className="flex items-center gap-0.5 justify-self-start">
          <IconButton icon="menu" label="القائمة" onClick={() => openOverlay("menuOpen")} className="-ms-3 lg:hidden" />
          <IconButton icon="search" label="بحث" onClick={() => openOverlay("searchOpen")} className="max-lg:hidden lg:-ms-3" />
          <IconButton icon="user" label="حسابي" href="/account" className="max-lg:hidden" />
          <IconButton icon="heart" label="المفضلة" href="/wishlist" className="max-lg:hidden" />
          <IconButton icon="bag" label={`السلة${count ? ` (${count})` : ""}`} onClick={() => openOverlay("cartOpen")} badge={count} className="max-lg:hidden" />
        </div>

        {/* Centre: nav on desktop, logo on mobile */}
        <nav aria-label="التنقل الرئيسي" className="max-lg:hidden">
          <ul className="flex items-center gap-1 xl:gap-3">
            {mainNav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href} className="group/nav relative">
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("relative inline-flex h-11 items-center px-3 text-[0.9375rem] transition-colors", active ? "text-ivory" : "text-ivory/65 hover:text-ivory")}>
                    {item.label}
                    <span className={cn("absolute inset-x-3 bottom-1.5 h-px origin-center bg-gold transition-transform duration-500 ease-[var(--ease-silk)]", active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100")} />
                  </Link>
                  {item.children && (
                    <div className="invisible absolute start-1/2 top-full w-56 translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-300 group-focus-within/nav:visible group-focus-within/nav:opacity-100 group-hover/nav:visible group-hover/nav:opacity-100">
                      <ul className="border border-ink-line bg-ink/95 p-2 backdrop-blur-xl">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="block px-4 py-2.5 text-sm text-ivory/70 transition-colors hover:bg-ivory/5 hover:text-ivory">{c.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="lg:hidden">
          <Logo compact={scrolled} />
        </div>

        <div className="flex items-center justify-self-end">
          <Logo compact={scrolled} className="max-lg:hidden" />
          <IconButton icon="search" label="بحث" onClick={() => openOverlay("searchOpen")} className="lg:hidden" />
          <IconButton icon="bag" label={`السلة${count ? ` (${count})` : ""}`} onClick={() => openOverlay("cartOpen")} badge={count} className="-me-3 lg:hidden" />
        </div>
      </div>
    </header>
  );
}
