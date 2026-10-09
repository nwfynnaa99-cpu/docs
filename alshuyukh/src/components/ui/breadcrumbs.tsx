import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/cn";

export type Crumb = { name: string; href: string };

/** Visible breadcrumb trail plus matching BreadcrumbList schema. Last crumb is the current page. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <nav aria-label="مسار التنقل" className={cn("text-xs text-ivory/55", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((c, i) => (
            <li key={c.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="text-gold/60">/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-ivory/85">{c.name}</span>
              ) : (
                <Link href={c.href} className="inline-flex min-h-8 items-center hover:text-ivory">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.href) })),
        }}
      />
    </>
  );
}
