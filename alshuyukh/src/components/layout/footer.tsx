import Link from "next/link";
import { mainNav, policyNav, site } from "@/config/site";
import { Icon, type IconName } from "@/components/ui/icon";

const assurances: { icon: IconName; title: string; text: string }[] = [
  { icon: "truck", title: "شحن لكل مدن المملكة", text: "توصيل خلال 1–4 أيام عمل" },
  { icon: "return", title: "استرجاع خلال 14 يومًا", text: "للقطع غير المفصّلة" },
  { icon: "exchange", title: "استبدال ميسّر", text: "بدون تعقيد أو أسئلة" },
  { icon: "lock", title: "دفع آمن", text: "مدى، Apple Pay، البطاقات، تمارا" },
];

const payments = ["Apple Pay", "mada", "VISA", "Mastercard", "Tamara"];

export function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink-deep">
      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-8 border-b border-ink-line py-10 md:grid-cols-4 md:py-14">
        {assurances.map((a) => (
          <div key={a.title} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <Icon name={a.icon} size={26} className="shrink-0 text-gold" />
            <div>
              <p className="text-sm font-medium text-ivory">{a.title}</p>
              <p className="mt-1 text-xs text-stone">{a.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container-site grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <p className="font-display text-3xl">{site.name}</p>
          <p className="latin-label mt-2 text-[0.625rem] text-gold">{site.nameLatin}</p>
          <p className="mt-6 max-w-xs text-sm leading-7 text-ivory/55">{site.tagline} دار أقمشة رجالية سعودية، نختار كل قماش كما لو كان لنا.</p>
        </div>
        <nav aria-label="الأقسام" className="md:col-span-3">
          <p className="eyebrow mb-5">الأقسام</p>
          <ul className="space-y-1 text-sm">
            {mainNav.slice(1).map((n) => <li key={n.href}><Link href={n.href} className="inline-flex h-9 items-center text-ivory/65 hover:text-ivory">{n.label}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="السياسات" className="md:col-span-3">
          <p className="eyebrow mb-5">خدمة العملاء</p>
          <ul className="space-y-1 text-sm">
            {policyNav.map((n) => <li key={n.href}><Link href={n.href} className="inline-flex h-9 items-center text-ivory/65 hover:text-ivory">{n.label}</Link></li>)}
            <li><a href={`https://wa.me/${site.contact.whatsapp}`} rel="noopener" className="inline-flex h-9 items-center text-ivory/65 hover:text-ivory">تواصل عبر واتساب</a></li>
          </ul>
        </nav>
        <div className="md:col-span-2">
          <p className="eyebrow mb-5">تابعنا</p>
          <ul className="space-y-1 text-sm">
            {Object.entries({ "إنستغرام": site.social.instagram, "إكس": site.social.x, "تيك توك": site.social.tiktok, "سناب شات": site.social.snapchat }).map(([k, v]) => (
              <li key={k}><a href={v} rel="noopener" target="_blank" className="inline-flex h-9 items-center text-ivory/65 hover:text-ivory">{k}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-site flex flex-col gap-6 border-t border-ink-line py-8 text-xs text-stone md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. جميع الحقوق محفوظة. السجل التجاري: 0000000000 · الرقم الضريبي: 300000000000003</p>
        <ul className="flex flex-wrap gap-2" aria-label="طرق الدفع المتاحة">
          {payments.map((p) => <li key={p} dir="ltr" className="flex h-7 items-center border border-ink-line px-2.5 font-sans text-[0.6875rem] tracking-wide text-ivory/60">{p}</li>)}
        </ul>
      </div>
    </footer>
  );
}
