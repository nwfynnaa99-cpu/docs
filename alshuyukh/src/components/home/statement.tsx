import { Reveal } from "@/components/motion/reveal";

export function Statement() {
  return (
    <section aria-label="عن الدار" className="section bg-ink">
      <div className="container-site">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal className="hairline mx-auto mb-12 w-24" />
          <Reveal as="p" stagger={1} className="font-display text-display-sm font-normal leading-[1.5] text-ivory/90">
            نختار القماش كما يُختار العود؛
            <span className="text-gold-light"> بالخبرة، وعلى مهل.</span>
          </Reveal>
          <Reveal as="p" stagger={2} className="mx-auto mt-8 max-w-xl text-base leading-8 text-ivory/55 md:text-lg">
            كل قماش في الشيوخ يمرّ بأيدينا قبل أن يصل إليك: نلمسه، ونختبر انسداله، ونرى لونه في ضوء النهار.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
