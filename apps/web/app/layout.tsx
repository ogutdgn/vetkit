import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { sanityFetch } from '@/lib/sanity/live';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { buildRootMetadata } from '@/lib/seo/metadata';
import { buildVeterinaryCareJsonLd, serializeJsonLd } from '@/lib/seo/schema';

import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  return buildRootMetadata(settings);
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Same query as generateMetadata — Next memoizes identical fetches within
  // one render, so this does not hit Sanity twice.
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  const jsonLd = buildVeterinaryCareJsonLd(settings);

  return (
    <html lang="tr" className={inter.variable}>
      <body>
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
