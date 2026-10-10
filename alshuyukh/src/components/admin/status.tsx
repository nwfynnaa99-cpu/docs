import type { OrderStatus } from "@/server/orders/types";
import { cn } from "@/lib/cn";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "بانتظار الدفع",
  paid: "مدفوع — للتجهيز",
  fulfilled: "تم الشحن",
  payment_failed: "فشل الدفع",
  cancelled: "ملغي",
};

const tone: Record<OrderStatus, string> = {
  pending_payment: "border-ivory/25 text-ivory/70",
  paid: "border-gold text-gold",
  fulfilled: "border-success text-[#9fbf98]",
  payment_failed: "border-danger/70 text-[#e09b90]",
  cancelled: "border-ink-line text-stone",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn("inline-flex h-6 items-center whitespace-nowrap border px-2 text-[0.6875rem]", tone[status])}>{STATUS_LABELS[status]}</span>;
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto border border-ink-line">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="bg-ink-soft text-xs text-stone">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 text-start font-normal">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-ink-line">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-10 text-center text-sm text-stone">{empty}</p>}
    </div>
  );
}
