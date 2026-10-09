"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

/**
 * Accessible side drawer / overlay.
 * Escape closes, focus moves in on open and returns on close, Tab is
 * trapped, background scroll is locked. "start" opens from the right in RTL.
 */
export function Drawer({ open, onClose, side = "end", title, children, footer, className, full = false }: {
  open: boolean;
  onClose: () => void;
  side?: "start" | "end" | "top";
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  full?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  // Keep the latest onClose without re-running the open/close effect on every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      const p = panel.current;
      (p?.querySelector<HTMLElement>("[data-autofocus]") ?? p?.querySelector<HTMLElement>("button, a, input"))?.focus();
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0]!;
      const last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      html.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [open]);

  const position =
    side === "top"
      ? "inset-x-0 top-0 max-h-[100dvh] w-full"
      : cn("inset-y-0 h-[100dvh] w-full", full ? "" : "sm:w-[28rem]", side === "start" ? "start-0" : "end-0");
  const hidden = side === "top" ? "-translate-y-6 opacity-0" : side === "start" ? "rtl:translate-x-full ltr:-translate-x-full" : "rtl:-translate-x-full ltr:translate-x-full";

  return (
    <div className={cn("fixed inset-0 z-[60]", !open && "pointer-events-none")} aria-hidden={!open} inert={!open}>
      <div className={cn("absolute inset-0 bg-ink-deep/70 backdrop-blur-[2px] transition-opacity duration-500", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute flex flex-col bg-ink text-ivory shadow-[0_0_80px_rgb(0_0_0/0.6)] transition-[transform,opacity] duration-500 ease-[var(--ease-silk)]",
          position,
          open ? "translate-x-0 translate-y-0 opacity-100" : hidden,
          className,
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-line px-5 md:h-20 md:px-8">
          <p className="font-display text-lg">{title}</p>
          <button type="button" onClick={onClose} className="-me-3 grid size-12 place-items-center text-ivory/70 transition-colors hover:text-ivory" aria-label="إغلاق">
            <Icon name="close" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-ink-line px-5 py-5 md:px-8">{footer}</div>}
      </div>
    </div>
  );
}
