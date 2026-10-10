"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useFieldError } from "./admin-form";

const box = "w-full border bg-ink-deep px-3 text-sm text-ivory outline-none transition-colors focus:border-gold";

function Wrap({ label, name, hint, children, className }: { label: string; name: string; hint?: string; children: ReactNode; className?: string }) {
  const error = useFieldError(name);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={`f-${name}`} className="text-xs text-ivory/70">{label}</label>
      {children}
      {error ? <p id={`f-${name}-err`} className="text-xs text-[#e09b90]">{error}</p> : hint ? <p className="text-xs text-stone">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ label, name, hint, className, ...props }: { label: string; name: string; hint?: string } & ComponentProps<"input">) {
  const error = useFieldError(name);
  return (
    <Wrap label={label} name={name} hint={hint} className={className}>
      <input id={`f-${name}`} name={name} aria-invalid={!!error || undefined} aria-describedby={error ? `f-${name}-err` : undefined} className={cn(box, "h-10", error ? "border-danger" : "border-ink-line")} {...props} />
    </Wrap>
  );
}

export function TextArea({ label, name, hint, className, ...props }: { label: string; name: string; hint?: string } & ComponentProps<"textarea">) {
  const error = useFieldError(name);
  return (
    <Wrap label={label} name={name} hint={hint} className={className}>
      <textarea id={`f-${name}`} name={name} rows={3} aria-invalid={!!error || undefined} className={cn(box, "py-2 leading-7", error ? "border-danger" : "border-ink-line")} {...props} />
    </Wrap>
  );
}

export function SelectInput({ label, name, hint, options, className, ...props }: { label: string; name: string; hint?: string; options: { value: string; label: string }[] } & ComponentProps<"select">) {
  const error = useFieldError(name);
  return (
    <Wrap label={label} name={name} hint={hint} className={className}>
      <select id={`f-${name}`} name={name} aria-invalid={!!error || undefined} className={cn(box, "h-10", error ? "border-danger" : "border-ink-line")} {...props}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrap>
  );
}

export function Checkbox({ label, name, className, ...props }: { label: string; name: string } & ComponentProps<"input">) {
  return (
    <label className={cn("flex min-h-10 cursor-pointer items-center gap-3 text-sm text-ivory/85", className)}>
      <input type="checkbox" name={name} value="1" className="size-4 accent-[#B89A5A]" {...props} />
      {label}
    </label>
  );
}

export function Fieldset({ legend, children, className }: { legend: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border border-ink-line p-5 md:p-6", className)}>
      <h2 className="mb-5 font-display text-base text-ivory">{legend}</h2>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}
