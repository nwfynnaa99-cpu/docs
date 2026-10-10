import { catalog } from "@/server/catalog";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/hero";
import { SeasonStrip } from "@/components/home/season-strip";
import { Statement } from "@/components/home/statement";
import { Collections } from "@/components/home/collections";
import { BestSellers } from "@/components/home/best-sellers";
import { FabricDetail } from "@/components/home/fabric-detail";
import { LuxuryBoxes } from "@/components/home/luxury-boxes";
import { Offers } from "@/components/home/offers";
import { Testimonials } from "@/components/home/testimonials";

export const revalidate = 300;

export const metadata = buildMetadata({ path: "/" });

export default async function HomePage() {
  const [home, categories, collections, best, offers, reviews] = await Promise.all([
    catalog.getHomepage(),
    catalog.listCategories(),
    catalog.listCollections(),
    catalog.listProducts({ bestSeller: true, limit: 4 }),
    catalog.listOffers(),
    catalog.listReviews({ featured: true, limit: 4 }),
  ]);
  const fabricCategories = categories.filter((c) => c.parentId === "c-fabrics");

  return (
    <>
      <Hero hero={home.hero} />
      <SeasonStrip categories={fabricCategories} />
      <Statement />
      <Collections items={collections} />
      <BestSellers products={best} />
      <FabricDetail content={home.fabricDetail} />
      <LuxuryBoxes content={home.boxes} />
      <Offers offers={offers} />
      <Testimonials reviews={reviews} />
    </>
  );
}
