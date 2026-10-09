# الشيوخ | ALSHUYUKH — المتجر

متجر دار أقمشة رجالية سعودية فاخرة. Next.js 15 (App Router) + React 19 +
Tailwind CSS v4، عربي RTL أولًا ومجهّز للإنجليزية لاحقًا.

> هذا المشروع مستقل تمامًا عن موقع التوثيق في جذر المستودع. لا يشارك معه أي ملف أو أداة.

## التشغيل

```sh
cd alshuyukh
npm ci
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run build && npm start
```

صفحة نظام التصميم: `/design-system` (مستبعدة من الفهرسة).

## حالة المراحل

| المرحلة | الحالة |
|---|---|
| 1. Design System | ✅ جاهزة ومختبرة |
| 2. Homepage | ✅ جاهزة ومختبرة |
| 3. Category pages | ⏳ التالية — روابط `/categories/*` تعرض صفحة 404 مؤقتة |
| 4. Product page | ⏳ — روابط `/products/*` تعرض صفحة 404 مؤقتة |
| 5. Cart & Checkout | 🟡 السلة الجانبية جاهزة؛ صفحة الدفع لم تُبنَ بعد |
| 6. CMS / Admin | ⏳ |

## البنية

```
src/
  app/                 المسارات (App Router)، SEO: sitemap.ts, robots.ts
    api/search/        بحث سريع مع rate limiting وتحقق zod
  components/
    ui/                مكونات النظام: Button, Price, Rating, Field, Drawer, Icon, Logo
    motion/            Reveal (يُعرض على الخادم) + MotionRuntime (مراقب واحد لكل الحركة)
    layout/            Header, Footer, MobileMenu, Overlays (تحميل كسول)
    product/           ProductCard, FabricZoom, أزرار السلة والمفضلة
    home/              أقسام الصفحة الرئيسية
    cart/ search/ seo/
  server/catalog/      طبقة البيانات: types + واجهة CatalogRepository + تنفيذ seed
  lib/
    analytics/         أحداث مكتوبة الأنواع → dataLayer (GTM/GA4) + Meta + TikTok
    store/             سلة ومفضلة وحالة الواجهة (بدون مكتبات خارجية، محفوظة محليًا)
    seo.ts arabic.ts format.ts rate-limit.ts
  config/site.ts       الهوية، القوائم، السياسات
```

**المنتجات ليست مكتوبة داخل الواجهات.** كل الواجهات تقرأ من
`catalog: CatalogRepository`. التنفيذ الحالي (`seed-repository.ts`) للتطوير
فقط؛ مرحلة الـ CMS تضيف تنفيذًا بقاعدة بيانات خلف الواجهة نفسها دون تعديل
أي مكون.

الأسعار مخزّنة بالهللة (أعداد صحيحة). أسعار السلة للعرض فقط، والخادم يعيد
حساب كل سعر عند إتمام الطلب.

## نظام التصميم

- الألوان في `src/app/globals.css` (`@theme`): `ink`, `ink-deep`, `gold`, `gold-light`, `ivory`, `paper`.
  الذهبي لمسة فقط: خطوط رفيعة، تسميات، وزر رئيسي واحد لكل مشهد.
- الخطوط: Noto Kufi Arabic للعناوين (نسخة ثابتة بوزن 500، مستضافة ذاتيًا — انظر `public/fonts/README.md`)،
  IBM Plex Sans Arabic للنصوص، Cormorant Garamond للشعار اللاتيني، Inter محجوز للنسخة الإنجليزية.
- الحواف 2–3px فقط. أقل حجم لمس 44px.
- الحركة: `data-reveal` (fade / blur-to-sharp / image reveal + stagger)، `data-parallax`، `data-magnetic`.
  كلها transform/opacity فقط وتتوقف بالكامل مع `prefers-reduced-motion`.

## الصور

الصور الحالية قوامات قماش مولّدة إجرائيًا (`npm run textures` →
`scripts/generate-textures.mjs`) لأن الصور الحقيقية غير متوفرة بعد. استبدلها
بتصوير احترافي من الـ CMS قبل الإطلاق. `next/image` يخدم AVIF/WebP بأحجام
متجاوبة تلقائيًا.

## التحليلات

`track(event, payload)` في `src/lib/analytics/track.ts`. الأحداث:
`view_item, add_to_cart, remove_from_cart, begin_checkout, add_payment_info,
purchase, search, view_category, select_product, wishlist_add`.
تفعيل المزودين عبر متغيرات البيئة في `.env.example`.

## الأداء (قياس محلي)

Lighthouse على `next start` محليًا:

- Desktop: Performance 98، Accessibility 100، Best Practices 96، SEO 100.
- Mobile (محاكاة 4G بطيء): Performance بين 81 و93 حسب التشغيل
  (بيئة القياس مشتركة وغير مستقرة). Accessibility 100، SEO 100.

Best Practices = 96 بسبب طلبات prefetch لصفحات الأقسام والمنتجات التي لم
تُبنَ بعد (404). تختفي عند إكمال المرحلتين 3 و4. القياس الحاسم يكون على
النسخة المنشورة خلف CDN عبر PageSpeed Insights.

## الأمان

- ترويسات أمان عامة في `next.config.ts` (HSTS, X-Frame-Options, nosniff, Referrer/Permissions-Policy).
- واجهات API: تحقق مدخلات بـ zod و rate limiting (في الذاكرة الآن؛ يُستبدل بـ Redis عند تعدد النسخ).
- JSON-LD يهرّب `<` لمنع حقن السكربت من محتوى الـ CMS.
- لا تُخزَّن بيانات البطاقات إطلاقًا؛ الدفع عبر بوابة خارجية (مرحلة 5).
