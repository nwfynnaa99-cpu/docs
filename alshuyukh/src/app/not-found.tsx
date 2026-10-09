import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[80dvh] flex-col items-center justify-center pt-24 text-center">
      <p className="latin-label text-xs text-gold">404</p>
      <h1 className="mt-6 font-display text-display-sm">هذه الصفحة قيد التجهيز</h1>
      <p className="mt-4 max-w-md text-ivory/60">نعمل على إكمال هذا القسم من الدار. يمكنك العودة إلى الرئيسية واكتشاف الأقمشة.</p>
      <ButtonLink href="/" className="mt-10">العودة للرئيسية</ButtonLink>
    </section>
  );
}
