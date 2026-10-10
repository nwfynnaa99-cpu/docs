"use client";

import Link from "next/link";
import { useState } from "react";
import { mainNav, policyNav } from "@/config/site";
import { closeOverlays, ui } from "@/lib/store/cart";
import { Drawer } from "@/components/ui/drawer";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function MobileMenu() {
  const open = ui.useStore((s) => s.menuOpen);
  const [expanded, setExpanded] = useState<string | null>("/categories/fabrics");

  return (
    <Drawer open={open} onClose={closeOverlays} side="start" title="القائمة" full>
      <nav aria-label="قائمة الجوال" className="px-5 py-4">
        <ul>
          {mainNav.map((item) => (
            <li key={item.href} className="border-b border-ink-line">
              {item.children ? (
                <>
                  <button type="button" aria-expanded={expanded === item.href} onClick={() => setExpanded(expanded === item.href ? null : item.href)} className="flex h-16 w-full items-center justify-between font-display text-xl">
                    {item.label}
                    <Icon name="plus" size={18} className={cn("text-gold transition-transform duration-300", expanded === item.href && "rotate-45")} />
                  </button>
                  <div className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-silk)]", expanded === item.href ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <ul className="overflow-hidden">
                      <li><Link href={item.href} onClick={closeOverlays} className="flex h-12 items-center text-gold">عرض الكل</Link></li>
                      {item.children.map((c) => (
                        <li key={c.href}><Link href={c.href} onClick={closeOverlays} className="flex h-12 items-center text-ivory/75">{c.label}</Link></li>
                      ))}
                      <li className="h-3" />
                    </ul>
                  </div>
                </>
              ) : (
                <Link href={item.href} onClick={closeOverlays} className="flex h-16 items-center font-display text-xl">{item.label}</Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <Link href="/account" onClick={closeOverlays} className="flex h-12 items-center gap-2 border border-ink-line px-4"><Icon name="user" size={18} /> حسابي</Link>
          <Link href="/wishlist" onClick={closeOverlays} className="flex h-12 items-center gap-2 border border-ink-line px-4"><Icon name="heart" size={18} /> المفضلة</Link>
        </div>
        <ul className="mt-8 space-y-1 text-sm text-ivory/50">
          {policyNav.map((p) => (
            <li key={p.href}><Link href={p.href} onClick={closeOverlays} className="inline-flex h-10 items-center">{p.label}</Link></li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
