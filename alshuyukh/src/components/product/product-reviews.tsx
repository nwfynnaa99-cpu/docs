import type { Review } from "@/server/catalog";
import { Rating } from "@/components/ui/rating";
import { countLabel } from "@/lib/format";

const reviewForms = { one: "تقييم واحد", two: "تقييمان", few: "تقييمات", many: "تقييمًا", zero: "لا تقييمات" };

export function ProductReviews({ reviews, average, count }: { reviews: Review[]; average: number; count: number }) {
  // Distribution from the written reviews we have; the headline uses the store-wide aggregate.
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="tabular font-display text-6xl">{average.toFixed(1)}</p>
        <Rating value={average} showValue={false} className="mt-2" />
        <p className="mt-2 text-sm text-stone">من {countLabel(count, reviewForms)}</p>
        {reviews.length > 0 && (
          <ul className="mt-8 space-y-2" aria-label="توزيع التقييمات المكتوبة">
            {dist.map(({ s, n }) => (
              <li key={s} className="tabular flex items-center gap-3 text-xs text-stone">
                <span className="w-3">{s}</span>
                <span className="h-px flex-1 bg-ink-line"><span className="block h-px bg-gold" style={{ width: `${(n / reviews.length) * 100}%` }} /></span>
                <span className="w-4 text-end">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="lg:col-span-8">
        {reviews.length === 0 ? (
          <p className="text-ivory/60">لا توجد تقييمات مكتوبة بعد لهذا المنتج.</p>
        ) : (
          <ul className="divide-y divide-ink-line border-y border-ink-line">
            {reviews.map((r) => (
              <li key={r.id} className="py-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Rating value={r.rating} showValue={false} />
                  <time dateTime={r.createdAt} className="tabular text-xs text-stone">
                    {new Intl.DateTimeFormat("ar-SA-u-nu-latn-ca-gregory", { year: "numeric", month: "long", day: "numeric" }).format(new Date(r.createdAt))}
                  </time>
                </div>
                <p className="mt-4 leading-8 text-ivory/85">{r.body}</p>
                <p className="mt-4 text-sm">
                  <span className="text-ivory">{r.author}</span>
                  <span className="text-stone">{r.city && ` · ${r.city}`}</span>
                  {r.verified && <span className="text-gold"> · مشتري موثّق</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
