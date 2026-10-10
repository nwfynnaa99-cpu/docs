import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

/** Native select styled like Field: native pickers are fastest on phones. */
export function SelectField({ label, error, options, placeholder, className, id, ...props }: {
  label: string;
  error?: string;
  options: readonly string[];
  placeholder?: string;
} & ComponentProps<"select">) {
  const fid = id ?? props.name;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={fid} className="text-sm text-ivory/70">{label}</label>
      <div className="relative">
        <select
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-error` : undefined}
          className={cn("h-12 w-full cursor-pointer appearance-none border-0 border-b bg-transparent pe-8 ps-0 text-base text-ivory outline-none transition-colors focus:border-gold", error ? "border-danger" : "border-ivory/25")}
          {...props}
        >
          {placeholder && <option value="" disabled className="bg-ink">{placeholder}</option>}
          {options.map((o) => <option key={o} value={o} className="bg-ink">{o}</option>)}
        </select>
        <Icon name="chevron" size={14} className="pointer-events-none absolute end-0 top-1/2 -translate-y-1/2 -rotate-90 text-gold" />
      </div>
      {error && <p id={`${fid}-error`} className="text-xs text-[#d9786b]">{error}</p>}
    </div>
  );
}
