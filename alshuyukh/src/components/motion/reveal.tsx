import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Server-rendered reveal marker. The single MotionRuntime observer adds
 * `data-revealed` when the element enters the viewport; CSS does the rest.
 * Variants: "up" (fade + rise + blur-to-sharp), "fade", "image".
 */
export function Reveal<T extends ElementType = "div">({ as, variant = "up", stagger = 0, className, style, children, ...rest }: {
  as?: T;
  variant?: "up" | "fade" | "image";
  stagger?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag data-reveal={variant} className={className} style={{ ...style, "--stagger": stagger } as CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}
