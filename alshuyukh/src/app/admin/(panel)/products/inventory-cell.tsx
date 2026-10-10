"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/cn";

/** Inline stock edit in the product list. */
export function InventoryCell({ value, action }: { value: number; action: (s: FormState, d: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); startTransition(() => formAction(d)); }} className="flex items-center gap-2">
      <input name="inventory" type="number" min={0} defaultValue={value} aria-label="المخزون" className={cn("tabular h-9 w-20 border bg-ink-deep px-2 text-sm outline-none focus:border-gold", value === 0 ? "border-danger/60" : "border-ink-line")} dir="ltr" />
      <button type="submit" disabled={pending} className="h-9 px-2 text-xs text-gold disabled:opacity-40">حفظ</button>
      {state?.message && <span className={cn("text-xs", state.ok ? "text-gold" : "text-[#e09b90]")} role="status">{state.message}</span>}
    </form>
  );
}
