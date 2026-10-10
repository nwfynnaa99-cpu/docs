import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({ id, eyebrow, title, description, action, align = "start", tone = "dark", className }: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "start" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between", align === "center" && "items-center text-center md:flex-col md:items-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Reveal as="p" className="eyebrow mb-4">{eyebrow}</Reveal>}
        <Reveal as="h2" id={id} stagger={1} className={cn("font-display text-display-sm font-medium", tone === "dark" ? "text-ivory" : "text-ink")}>
          {title}
        </Reveal>
        {description && (
          <Reveal as="p" stagger={2} className={cn("mt-4 text-base md:text-lg", tone === "dark" ? "text-ivory/65" : "text-stone-dark")}>
            {description}
          </Reveal>
        )}
      </div>
      {action && <Reveal stagger={3} className="shrink-0">{action}</Reveal>}
    </div>
  );
}
