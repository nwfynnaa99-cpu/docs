import { catalog } from "@/server/catalog";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { ProductCard } from "@/components/product/product-card";
import { FabricZoom } from "@/components/product/fabric-zoom";
import { Reveal } from "@/components/motion/reveal";

export const metadata = { ...buildMetadata({ title: "نظام التصميم", path: "/design-system", noindex: true }) };

const colors = [
  { name: "Primary Black", token: "ink", hex: "#0B0B0B", use: "الخلفية الأساسية" },
  { name: "Deep Black", token: "ink-deep", hex: "#050505", use: "الهيرو والفوتر والطبقات" },
  { name: "Luxury Gold", token: "gold", hex: "#B89A5A", use: "لمسة فقط: خطوط، تسميات، زر رئيسي واحد" },
  { name: "Light Gold", token: "gold-light", hex: "#D4B878", use: "حالة hover والشعار النصي" },
  { name: "Ivory", token: "ivory", hex: "#F5F1E8", use: "النص على الداكن، والأقسام الفاتحة" },
  { name: "Warm White", token: "paper", hex: "#FAF9F6", use: "صفحات المحتوى الطويل" },
];

const type = [
  { label: "Display XL · Noto Kufi Arabic 500", cls: "font-display text-display-xl font-semibold", sample: "الشيوخ" },
  { label: "Display · Noto Kufi Arabic 500", cls: "font-display text-display font-medium", sample: "بوكسات الشيوخ" },
  { label: "Display SM · Noto Kufi Arabic 500", cls: "font-display text-display-sm font-medium", sample: "تفاصيل تحكي الفخامة" },
  { label: "Body LG · IBM Plex Sans Arabic 400", cls: "text-lg leading-8", sample: "أقمشة رجالية مختارة بعناية، لتصنع إطلالة تليق بك." },
  { label: "Body · IBM Plex Sans Arabic 400", cls: "text-base", sample: "نسيج صيفي يجمع بين الخفة والانسدال الهادئ." },
  { label: "Eyebrow · 11px / tracking 0.18em", cls: "eyebrow", sample: "دار أقمشة رجالية سعودية" },
  { label: "Latin label · Cormorant Garamond 500", cls: "latin-label text-sm text-gold", sample: "ALSHUYUKH" },
];

const icons: IconName[] = ["search", "user", "heart", "bag", "menu", "close", "arrow", "plus", "minus", "star", "truck", "return", "exchange", "lock", "gift"];

const motion = [
  ["Fade in / Blur to sharp", "900ms · ease-silk · opacity + blur(6px→0) + 18px"],
  ["Stagger", "80ms بين العناصر عبر --stagger"],
  ["Image reveal", "clip-path 6%→0 + scale 1.03→1"],
  ["Hover zoom", "scale 1.03 · 1.2s"],
  ["Parallax", "data-parallax=0.04–0.25 · transform فقط"],
  ["Magnetic", "إزاحة ≤ 6px · مؤشر دقيق فقط"],
  ["Text reveal", "سطر بسطر · 1.1s · 120ms بين الأسطر"],
  ["Page transition", "600ms · blur 4px → 0"],
  ["Reduced motion", "كل الحركة تتوقف مع prefers-reduced-motion"],
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-line py-14 md:py-20">
      <h2 className="eyebrow mb-10">{title}</h2>
      {children}
    </section>
  );
}

export default async function DesignSystemPage() {
  const products = await catalog.listProducts({ limit: 3 });
  return (
    <div className="container-site pb-24 pt-32 md:pt-40">
      <header className="mb-16 max-w-3xl">
        <p className="latin-label text-xs text-gold">Design System · v1</p>
        <h1 className="mt-4 font-display text-display font-medium">نظام تصميم الشيوخ</h1>
        <p className="mt-6 text-lg leading-8 text-ivory/65">
          الفخامة هنا تأتي من المساحات والصور والخطوط والحركة الهادئة. الأسود هو القاعدة، والذهبي لمسة لا تتكرر في المشهد الواحد أكثر من مرة واضحة.
        </p>
      </header>

      <Block title="الشعار">
        <div className="flex flex-wrap items-center gap-16">
          <Logo />
          <Logo compact />
        </div>
      </Block>

      <Block title="الألوان">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {colors.map((c) => (
            <li key={c.token}>
              <div className="aspect-[4/5] border border-ink-line" style={{ background: c.hex }} />
              <p className="mt-3 text-sm text-ivory">{c.name}</p>
              <p className="tabular text-xs text-stone" dir="ltr">{c.hex} · {c.token}</p>
              <p className="mt-1 text-xs text-ivory/55">{c.use}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex h-3 w-full overflow-hidden" aria-label="نسبة استخدام الألوان">
          <span className="bg-ink-deep" style={{ flex: 46 }} />
          <span className="bg-ink-soft" style={{ flex: 30 }} />
          <span className="bg-ivory" style={{ flex: 20 }} />
          <span className="bg-gold" style={{ flex: 4 }} />
        </div>
        <p className="mt-3 text-xs text-stone">النسبة التقريبية في الصفحة: أسود 76% · عاجي 20% · ذهبي 4%</p>
      </Block>

      <Block title="الخطوط">
        <ul className="space-y-10">
          {type.map((t) => (
            <li key={t.label} className="grid gap-3 md:grid-cols-[16rem_1fr] md:items-baseline">
              <p className="text-xs text-stone" dir="ltr">{t.label}</p>
              <p className={t.cls}>{t.sample}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="الأزرار">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" data-magnetic>اكتشف الأقمشة</Button>
          <Button size="lg" variant="secondary">تسوق الآن</Button>
          <Button variant="ghost">إلغاء</Button>
          <Button variant="link">عرض التفاصيل</Button>
          <Button size="sm">أضف للسلة</Button>
          <Button disabled>غير متوفر</Button>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 bg-ivory p-8">
          <Button size="lg" variant="light">على الخلفية الفاتحة</Button>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-ivory/55">زر ذهبي واحد فقط لكل مشهد. أقل ارتفاع للمس 44px. حواف 2px فقط.</p>
      </Block>

      <Block title="السعر والتقييم">
        <div className="flex flex-wrap items-end gap-12">
          <Price amount={18900} compareAt={22900} unit="متر" size="lg" />
          <Price amount={34500} />
          <Rating value={4.9} count={214} />
        </div>
      </Block>

      <Block title="الحقول">
        <form className="grid max-w-2xl gap-8 md:grid-cols-2">
          <Field label="الاسم" name="ds-name" autoComplete="name" />
          <Field label="رقم الجوال" name="ds-phone" inputMode="tel" dir="ltr" placeholder="05x xxx xxxx" hint="سنرسل رمز التحقق إلى هذا الرقم" />
          <Field label="البريد الإلكتروني" name="ds-email" type="email" error="أدخل بريدًا إلكترونيًا صحيحًا" />
        </form>
      </Block>

      <Block title="الأيقونات">
        <ul className="flex flex-wrap gap-6 text-ivory/80">
          {icons.map((i) => (
            <li key={i} className="flex w-16 flex-col items-center gap-2">
              <Icon name={i} />
              <span className="text-[0.625rem] text-stone" dir="ltr">{i}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="بطاقة المنتج">
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6 lg:grid-cols-3">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </Block>

      <Block title="تجربة القماش (Zoom)">
        <FabricZoom src="/media/winter-charcoal-macro.webp" alt="نسيج صوف فحمي" width={1200} height={1200} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-square max-w-xl" />
      </Block>

      <Block title="الحركة">
        <ul className="grid gap-px border border-ink-line bg-ink-line md:grid-cols-3">
          {motion.map(([name, spec], i) => (
            <Reveal as="li" key={name} stagger={i} className="bg-ink p-6">
              <p className="text-ivory">{name}</p>
              <p className="mt-2 text-xs text-stone">{spec}</p>
            </Reveal>
          ))}
        </ul>
      </Block>

      <Block title="المسافات والشبكة">
        <ul className="space-y-3 text-sm text-ivory/70" dir="ltr">
          <li>Container: 88rem max · gutter clamp(1rem → 3rem)</li>
          <li>Section rhythm: clamp(4.5rem → 10rem)</li>
          <li>Grid: 12 columns desktop · 2 columns mobile for products</li>
          <li>Breakpoints: xs 400 · sm 640 · md 768 · lg 1024 · xl 1280</li>
        </ul>
      </Block>
    </div>
  );
}
