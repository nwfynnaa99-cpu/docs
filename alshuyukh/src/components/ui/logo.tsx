import Link from "next/link";
import { cn } from "@/lib/cn";

/** Wordmark lockup: Arabic display name over a tracked Latin name, separated by a gold hairline. */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" title="الصفحة الرئيسية" className={cn("group inline-flex flex-col items-center leading-none", className)}>
      <span className={cn("font-display font-semibold text-ivory transition-[font-size] duration-500 ease-[var(--ease-silk)]", compact ? "text-xl" : "text-2xl md:text-[1.75rem]")}>
        الشيوخ
      </span>
      <span className={cn("latin-label mt-1.5 flex items-center gap-2 text-gold transition-[font-size,opacity] duration-500", compact ? "text-[0.5rem]" : "text-[0.5625rem]")}>
        <span className="h-px w-3 bg-gold/50" />
        ALSHUYUKH
        <span className="h-px w-3 bg-gold/50" />
      </span>
    </Link>
  );
}
