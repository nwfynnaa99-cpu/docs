import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function Rating({ value, count, showValue = true, className }: { value: number; count?: number; showValue?: boolean; className?: string }) {
  const rounded = Math.round(value);
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="flex text-gold" role="img" aria-label={`التقييم ${value.toFixed(1)} من 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Icon key={i} name="star" size={13} fill={i < rounded ? "currentColor" : "none"} strokeWidth={1} />
        ))}
      </span>
      {(showValue || count !== undefined) && (
        <span className="tabular text-stone">
          {showValue && value.toFixed(1)}
          {count !== undefined && <span> ({count})</span>}
        </span>
      )}
    </div>
  );
}
