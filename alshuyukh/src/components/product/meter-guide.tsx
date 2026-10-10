const guide = [
  { height: "أقل من 165 سم", meters: "3 أمتار" },
  { height: "165 – 175 سم", meters: "3.5 متر" },
  { height: "175 – 185 سم", meters: "4 أمتار" },
  { height: "أكثر من 185 سم", meters: "4.5 متر" },
];

/** Approximate meters for one thobe on 140–155 cm wide fabric. Native <details>: no JS. */
export function MeterGuide() {
  return (
    <details className="group border-y border-ink-line">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-sm text-ivory/85 [&::-webkit-details-marker]:hidden">
        كم مترًا أحتاج لثوب واحد؟
        <span aria-hidden="true" className="text-gold transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="pb-5">
        <table className="w-full text-sm">
          <caption className="sr-only">الأمتار التقريبية لثوب واحد حسب الطول</caption>
          <thead>
            <tr className="text-start text-xs text-stone">
              <th scope="col" className="pb-2 text-start font-normal">الطول</th>
              <th scope="col" className="pb-2 text-start font-normal">الكمية التقريبية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {guide.map((g) => (
              <tr key={g.height}>
                <td className="py-2.5 text-ivory/75">{g.height}</td>
                <td className="tabular py-2.5 text-ivory">{g.meters}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs leading-6 text-stone">تقدير لقماش بعرض 140–155 سم. يختلف حسب القصّة والأكمام، والأفضل تأكيده مع خيّاطك.</p>
      </div>
    </details>
  );
}
