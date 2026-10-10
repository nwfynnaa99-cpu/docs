import { discountPercent, formatAmount } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Riyal symbol rendered as text label to avoid font-coverage gaps for U+20C1. */
export function Price({ amount, compareAt, unit, size = "md", tone = "dark", className }: {
  amount: number;
  compareAt?: number | null;
  unit?: string;
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light";
  className?: string;
}) {
  const off = discountPercent(amount, compareAt);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      <span className={cn("tabular font-medium", size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base", tone === "dark" ? "text-ivory" : "text-ink")}>
        {formatAmount(amount)} <span className="text-[0.75em] font-normal opacity-70">ر.س</span>
        {unit && <span className="text-[0.75em] font-normal opacity-60"> / {unit}</span>}
      </span>
      {off > 0 && compareAt && (
        <>
          <s className={cn("tabular text-sm", tone === "dark" ? "text-stone" : "text-stone-dark")} aria-label={`السعر السابق ${formatAmount(compareAt)} ريال`}>
            {formatAmount(compareAt)}
          </s>
          <span className="tabular text-2xs tracking-wide text-gold">وفّر <bdi dir="ltr">{off}%</bdi></span>
        </>
      )}
    </div>
  );
}
