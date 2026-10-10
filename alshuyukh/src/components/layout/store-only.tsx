"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Renders storefront chrome (footer, overlays) everywhere except the admin. */
export function StoreOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : <>{children}</>;
}
