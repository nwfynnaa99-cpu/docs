import type { Metadata } from "next";
import { site } from "@/config/site";

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;

type PageMeta = { title?: string; description?: string; path: string; image?: string; noindex?: boolean };

/** Builds consistent metadata (canonical, Open Graph, Twitter) for any route. */
export function buildMetadata({ title, description, path, image, noindex }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  const desc = description ?? site.description;
  const images = [{ url: absoluteUrl(image ?? "/og.jpg"), width: 1200, height: 630, alt: site.name }];
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: url, languages: { "ar-SA": url } },
    openGraph: {
      type: "website",
      url,
      siteName: `${site.name} | ${site.nameLatin}`,
      title: title ?? `${site.name} | ${site.tagline}`,
      description: desc,
      locale: site.locale,
      images,
    },
    twitter: { card: "summary_large_image", title: title ?? site.name, description: desc, images },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  alternateName: site.nameLatin,
  url: site.url,
  logo: absoluteUrl("/icon.svg"),
  slogan: site.tagline,
  contactPoint: [
    { "@type": "ContactPoint", telephone: site.contact.phone, contactType: "customer service", areaServed: "SA", availableLanguage: ["ar", "en"] },
  ],
  sameAs: Object.values(site.social),
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  inLanguage: "ar-SA",
  potentialAction: {
    "@type": "SearchAction",
    target: `${site.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});
