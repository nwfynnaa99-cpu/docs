import Link from "next/link";
import type { ReactNode } from "react";
import { can, ROLE_LABELS, type Capability } from "@/server/auth/roles";
import type { AdminUser } from "@/server/auth/session";
import { logoutAction } from "@/app/admin/actions";
import { AdminNavLink } from "./admin-nav-link";

const NAV: { href: string; label: string; cap?: Capability }[] = [
  { href: "/admin", label: "لوحة التحكم" },
  { href: "/admin/orders", label: "الطلبات", cap: "orders.view" },
  { href: "/admin/customers", label: "العملاء", cap: "customers" },
  { href: "/admin/products", label: "المنتجات والمخزون", cap: "catalog" },
  { href: "/admin/categories", label: "الأقسام", cap: "catalog" },
  { href: "/admin/coupons", label: "الخصومات", cap: "catalog" },
  { href: "/admin/reviews", label: "التقييمات", cap: "content" },
  { href: "/admin/content", label: "الصفحة الرئيسية والبنرات", cap: "content" },
  { href: "/admin/users", label: "المستخدمون", cap: "users" },
  { href: "/admin/audit", label: "سجل التغييرات", cap: "audit" },
];

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  const items = NAV.filter((n) => !n.cap || can(user.role, n.cap));
  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-ink-line bg-ink-deep lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-e">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" className="font-display text-lg">الشيوخ <span className="latin-label ms-1 text-[0.5rem] text-gold">ADMIN</span></Link>
          <Link href="/" className="text-xs text-stone hover:text-ivory">المتجر ↗</Link>
        </div>
        <nav aria-label="قائمة الإدارة" className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {items.map((n) => <AdminNavLink key={n.href} href={n.href}>{n.label}</AdminNavLink>)}
        </nav>
        <div className="hidden border-t border-ink-line p-5 text-xs lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="text-ivory">{user.name}</p>
          <p className="mt-0.5 text-stone">{ROLE_LABELS[user.role]}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/admin/account" className="text-ivory/70 hover:text-ivory">حسابي</Link>
            <form action={logoutAction}><button type="submit" className="text-ivory/70 hover:text-ivory">تسجيل الخروج</button></form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-ink-line px-5 py-3 text-xs lg:hidden">
          <span className="text-stone">{user.name} · {ROLE_LABELS[user.role]}</span>
          <form action={logoutAction}><button type="submit" className="h-9 text-ivory/70">تسجيل الخروج</button></form>
        </div>
        {/* The root layout already provides <main>; a second one would duplicate the landmark. */}
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}

export function PageTitle({ title, action, description }: { title: string; action?: ReactNode; description?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone">{description}</p>}
      </div>
      {action}
    </div>
  );
}
