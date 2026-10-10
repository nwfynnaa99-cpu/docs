"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex h-10 shrink-0 items-center whitespace-nowrap px-3 text-sm transition-colors", active ? "bg-gold/10 text-ivory shadow-[inset_-2px_0_0_var(--color-gold)]" : "text-ivory/65 hover:bg-ivory/5 hover:text-ivory")}>
      {children}
    </Link>
  );
}
