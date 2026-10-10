"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/cn";

const ErrorsContext = createContext<Record<string, string>>({});
export const useFieldError = (name: string) => useContext(ErrorsContext)[name];

function SubmitButton({ label, danger, pending }: { label: string; danger?: boolean; pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className={cn("inline-flex h-11 items-center justify-center gap-2 px-6 text-sm font-medium transition-colors disabled:opacity-50", danger ? "border border-danger/60 text-[#e09b90] hover:bg-danger/15" : "bg-gold text-ink hover:bg-gold-light")}>
      {pending && <span className="size-3.5 animate-spin rounded-full border border-current border-t-transparent" aria-hidden />}
      {label}
    </button>
  );
}

/** Server-action form with inline field errors and a status line. */
export function AdminForm({ action, children, submitLabel = "حفظ", className, danger, confirm, resetOnSuccess }: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  danger?: boolean;
  confirm?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <ErrorsContext.Provider value={state?.errors ?? {}}>
      <form
        ref={ref}
        className={cn("space-y-6", className)}
        // Submitting manually (instead of <form action>) stops React 19 from
        // resetting every field after the action, so a validation error
        // never wipes what the admin typed.
        onSubmit={(e) => {
          e.preventDefault();
          if (pending || (confirm && !window.confirm(confirm))) return;
          const data = new FormData(e.currentTarget);
          startTransition(() => formAction(data));
        }}
      >
        {children}
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton label={submitLabel} danger={danger} pending={pending} />
          {state?.message && (
            <p role={state.ok ? "status" : "alert"} className={cn("text-sm", state.ok ? "text-gold" : "text-[#e09b90]")}>
              {state.message}
            </p>
          )}
        </div>
      </form>
    </ErrorsContext.Provider>
  );
}
