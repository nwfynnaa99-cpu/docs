import type { Review } from "@/server/catalog";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function Testimonials({ reviews }: { reviews: Review[] }) {
  const avg = reviews.reduce((n, r) => n + r.rating, 0) / (reviews.length || 1);
  return (
    <section aria-labelledby="reviews-title" className="section border-t border-ink-line bg-ink">
      <div className="container-site">
        <SectionHeading
          id="reviews-title"
          eyebrow="آراء العملاء"
          title="بكلمات عملائنا"
          action={
            <div className="flex items-center gap-4">
              <p className="tabular font-display text-4xl text-ivory">{avg.toFixed(1)}</p>
              <div>
                <Rating value={avg} showValue={false} />
                <p className="mt-1 text-xs text-stone">متوسط تقييمات المشترين الموثّقين</p>
              </div>
            </div>
          }
        />
        <ul className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <Reveal as="li" key={r.id} stagger={i} className="flex flex-col border-t border-gold/30 pt-6">
              <Rating value={r.rating} />
              <blockquote className="mt-5 flex-1 text-base leading-8 text-ivory/80">«{r.body}»</blockquote>
              <footer className="mt-6 text-sm">
                <p className="font-medium text-ivory">{r.author}</p>
                <p className="mt-0.5 text-stone">
                  {r.city}
                  {r.verified && <span className="text-gold"> · مشتري موثّق</span>}
                </p>
              </footer>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
