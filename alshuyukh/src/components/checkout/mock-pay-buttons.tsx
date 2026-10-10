"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/button";

export function MockPayButtons({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false);
  const confirm = async (outcome: "paid" | "failed") => {
    setBusy(true);
    const r = await fetch("/api/payments/mock-confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, outcome }) });
    const data = await r.json().catch(() => ({}));
    if (data.redirectUrl) window.location.assign(data.redirectUrl);
    else setBusy(false);
  };
  return (
    <div className="mt-8 grid gap-3">
      <button type="button" disabled={busy} onClick={() => confirm("paid")} className={buttonClass("primary", "lg", "w-full")}>محاكاة دفع ناجح</button>
      <button type="button" disabled={busy} onClick={() => confirm("failed")} className={buttonClass("secondary", "lg", "w-full")}>محاكاة رفض البطاقة</button>
    </div>
  );
}
