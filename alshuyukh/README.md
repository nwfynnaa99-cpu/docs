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
| 3. Category pages | ✅ جاهزة ومختبرة (`/categories/[slug]`, `/offers`) |
| 4. Product page | ✅ جاهزة ومختبرة (`/products/[slug]`) |
| 5. Cart & Checkout | ✅ جاهزة ومختبرة (بوابة دفع تجريبية حتى اختيار البوابة) |
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
  components/category/ CategoryHeader, CategoryChips, CategoryBrowser (تصفية وترتيب)
  lib/catalog/         منطق التصفية والترتيب (دوال نقية + اختبارات)
  lib/checkout/        الشحن والإجماليات والتحقق (مشتركة بين المتصفح والخادم)
  server/checkout/     تسعير الطلب على الخادم والكوبونات
  server/orders/       الطلبات + توقيع روابط التأكيد
  server/payments/     واجهة بوابة الدفع + بوابة تجريبية
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

## صفحات الأقسام

- كل قسم صفحة ثابتة (SSG + ISR كل 5 دقائق). الأقسام الجديدة من الـ CMS تُبنى عند أول طلب.
- التصفية (الموسم، اللون، المنشأ، السعر، المتوفر) والترتيب تعمل فورًا في المتصفح:
  البطاقات تُرسم على الخادم، والعميل يغيّر الظهور والترتيب فقط (CSS `order`)،
  فلا يُعاد رسم أي بطاقة أو صورة.
- الحالة تُكتب في الرابط (`?season=شتوي&sort=price-asc`) للمشاركة والرجوع.
- Schema: `BreadcrumbList` و `CollectionPage` + `ItemList`.

## صفحة المنتج

- معرض صور: تكبير عالي الدقة بالمؤشر أو باللمس، وصورة مقرّبة للنسيج. سحب على الجوال.
- الأقمشة تُباع بالمتر، والكمية الافتراضية 4 أمتار (ثوب تقريبًا) مع الإجمالي المباشر ودليل الأمتار حسب الطول.
- «شراء الآن» يضيف للسلة وينتقل إلى `/checkout`. شريط شراء ثابت على الجوال بعد تجاوز الأزرار.
- «تفاصيل القماش»: النوع، الخامة، الملمس، الموسم، اللون، العرض، المنشأ.
- Schema: `Product` + `Offer` (السعر بالمتر `UnitPriceSpecification`) + `AggregateRating` + `Review`.

## إتمام الطلب والدفع

- صفحة واحدة بأقل الحقول: الاسم والجوال، المدينة والحي والشارع، العنوان الوطني المختصر (اختياري).
  البيانات تُحفظ في المتصفح لتعبئة الطلب التالي تلقائيًا.
- الشحن: عادي (مجاني من 500 ر.س، وإلا 25 ر.س) أو سريع 45 ر.س في الرياض وجدة والمنطقة الشرقية.
- الدفع: Apple Pay (يظهر على الأجهزة الداعمة فقط)، مدى، Visa/Mastercard، تمارا.
- **الخادم هو المرجع**: يعيد حساب الأسعار والخصم والشحن من الكتالوج، ويتحقق من المخزون، ولا يثق بأي سعر من المتصفح.
- **بيانات البطاقة لا تمر بخوادمنا**: الإدخال يتم في صفحة البوابة المستضافة.
  الطلب يصبح «مدفوعًا» فقط عبر إشعار البوابة الموقّع (`/api/payments/webhook`)، لا عبر رابط العودة.
- حماية: تحقق zod، فحص Origin ضد CSRF، rate limiting، مفتاح idempotency ضد الإرسال المزدوج،
  ورابط تأكيد الطلب موقّع بـ HMAC (لا يمكن استعراض الطلبات بتخمين أرقامها)، والجوال يظهر مقنّعًا.
- رموز خصم للتجربة: `WELCOME10` و `SHUYUKH50`.

### ربط بوابة دفع حقيقية

اكتب محولًا يطبّق `PaymentGateway` في `src/server/payments/` (مثل Moyasar أو Tap أو HyperPay، وتمارا للتقسيط):

1. `createSession(order)`: أنشئ عملية الدفع لدى البوابة وأعد رابط صفحتها.
2. `verifyWebhook(req)`: تحقق من توقيع البوابة وأعد حالة الطلب.
3. سجّله في `paymentGateway()` واضبط `PAYMENT_PROVIDER` ومفاتيح البوابة في متغيرات البيئة.

> البوابة التجريبية (`PAYMENT_PROVIDER=mock`) ترفض العمل في الإنتاج ما لم تُفعَّل صراحة، ولا يجوز استخدامها مع طلبات حقيقية.

### متطلبات الإنتاج

- `ORDER_TOKEN_SECRET`: سلسلة عشوائية 32 حرفًا أو أكثر (إلزامي).
- النشر خلف CDN أو proxy يضبط `cf-connecting-ip` أو `x-real-ip`، لأن rate limiting يعتمد عليها.
- مخزن الطلبات الحالي في الذاكرة (للتطوير). المرحلة 6 تستبدله بقاعدة بيانات وتضيف خصم المخزون عند الدفع.

## الاختبارات

```sh
npm test         # التصفية والترتيب، الإجماليات والضريبة، الشحن، أرقام الجوال، صيغ العدد العربية
npm run typecheck
```

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
