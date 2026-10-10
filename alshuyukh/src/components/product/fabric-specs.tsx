import type { FabricSpec } from "@/server/catalog";

const rows: { key: keyof FabricSpec; label: string }[] = [
  { key: "type", label: "نوع القماش" },
  { key: "material", label: "الخامة" },
  { key: "texture", label: "الملمس" },
  { key: "season", label: "الموسم" },
  { key: "color", label: "اللون" },
  { key: "width", label: "العرض" },
  { key: "origin", label: "المنشأ" },
];

export function FabricSpecs({ fabric }: { fabric: FabricSpec }) {
  return (
    <dl className="grid border-t border-ink-line sm:grid-cols-2 lg:grid-cols-3">
      {rows
        .filter((r) => fabric[r.key])
        .map((r) => (
          <div key={r.key} className="border-b border-ink-line py-5 sm:odd:pe-8 lg:pe-8">
            <dt className="eyebrow">{r.label}</dt>
            <dd className="mt-2 font-display text-lg text-ivory">{fabric[r.key]}</dd>
          </div>
        ))}
    </dl>
  );
}
