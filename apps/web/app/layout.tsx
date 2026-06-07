import type { Metadata, Viewport } from 'next';
import { Changa, Karla } from 'next/font/google';
import type { ReactNode } from 'react';

import { brandStyleVars } from '@/lib/branding';
import { sanityFetch } from '@/lib/sanity/live';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { buildRootMetadata, htmlLang } from '@/lib/seo/metadata';
import { buildVeterinaryCareJsonLd, serializeJsonLd } from '@/lib/seo/schema';

import './globals.css';

const karla = Karla({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-karla',
  display: 'swap',
});

const changa = Changa({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-changa',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  return buildRootMetadata(settings);
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  return {
    themeColor: settings?.brandColor?.hex ?? '#ffffff',
    width: 'device-width',
    initialScale: 1,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Same query as generateMetadata — Next memoizes identical fetches within
  // one render, so this does not hit Sanity twice.
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  const jsonLd = buildVeterinaryCareJsonLd(settings);
  // §2.5 brand pipeline: siteSettings.brandColor overrides the template's
  // default --color-brand-* scale; Tailwind utilities pick the vars up live.
  const brandVars = brandStyleVars(settings?.brandColor?.hex);

  return (
    <html lang={htmlLang} className={`${karla.variable} ${changa.variable}`} style={brandVars}>
      <body>
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-700 focus:shadow-lg"
        >
          İçeriğe atla
        </a>
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
