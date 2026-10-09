import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "light" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-3 whitespace-nowrap font-medium select-none rounded-[var(--radius-xs)] transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-silk)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.99]";

const variants: Record<ButtonVariant, string> = {
  // The one gold action per view
  primary: "bg-gold text-ink hover:bg-gold-light",
  // Outline on dark backgrounds
  secondary: "border border-ivory/30 text-ivory hover:border-ivory hover:bg-ivory/5",
  ghost: "text-ivory/80 hover:text-ivory",
  // Solid on light backgrounds
  light: "bg-ink text-ivory hover:bg-ink-soft",
  link: "px-0! h-auto! text-ivory underline-offset-8 decoration-gold/60 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

export const buttonClass = (variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) =>
  cn(base, variants[variant], sizes[size], className);

type Common = { variant?: ButtonVariant; size?: ButtonSize; children: ReactNode; className?: string };

export function Button({ variant, size, className, ...props }: Common & ComponentProps<"button">) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
