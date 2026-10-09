import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { site } from "@/config/site";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { AnalyticsProviders } from "@/lib/analytics/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Overlays } from "@/components/layout/overlays";
import { MotionRuntime } from "@/components/motion/runtime";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500"], variable: "--font-plex-arabic", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], variable: "--font-cormorant", display: "swap" });
// Reserved for the English locale; not preloaded so Arabic pages don't pay for it.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  applicationName: site.name,
  ...buildMetadata({ path: "/" }),
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The self-hosted heading font (public/fonts/README.md) is deliberately not
  // preloaded: Chrome treats font preloads as render-blocking, which delayed
  // first paint by ~1s in Lighthouse. font-display: swap paints immediately.
  return (
    <html lang="ar" dir="rtl" className={`no-js ${plex.variable} ${cormorant.variable} ${inter.variable}`}>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Overlays />
        <MotionRuntime />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <AnalyticsProviders />
      </body>
    </html>
  );
}
