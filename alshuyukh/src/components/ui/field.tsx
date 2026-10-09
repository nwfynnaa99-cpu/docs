import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Underlined field: large tap target, label always visible (no placeholder-only labels). */
export function Field({ label, error, hint, className, id, ...props }: { label: string; error?: string; hint?: string } & ComponentProps<"input">) {
  const fid = id ?? props.name;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={fid} className="text-sm text-ivory/70">{label}</label>
      <input
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={cn(
          "h-12 border-0 border-b bg-transparent px-0 text-base text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-gold",
          error ? "border-danger" : "border-ivory/25",
        )}
        {...props}
      />
      {hint && !error && <p id={`${fid}-hint`} className="text-xs text-stone">{hint}</p>}
      {error && <p id={`${fid}-error`} className="text-xs text-[#d9786b]">{error}</p>}
    </div>
  );
}
