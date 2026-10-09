"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ui } from "@/lib/store/cart";

const MobileMenu = dynamic(() => import("./mobile-menu").then((m) => m.MobileMenu), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const SearchOverlay = dynamic(() => import("@/components/search/search-overlay").then((m) => m.SearchOverlay), { ssr: false });

/**
 * Overlays are not needed for first paint. They mount when the browser is
 * idle (so the first open still animates) or immediately on first use.
 */
export function Overlays() {
  const [ready, setReady] = useState(false);
  const anyOpen = ui.useStore((s) => s.cartOpen || s.searchOpen || s.menuOpen);

  useEffect(() => {
    if (ready) return;
    if (anyOpen) return setReady(true);
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setReady(true), { timeout: 4000 });
    return () => cic(id);
  }, [ready, anyOpen]);

  if (!ready) return null;
  return (
    <>
      <MobileMenu />
      <CartDrawer />
      <SearchOverlay />
    </>
  );
}
