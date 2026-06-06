import type { ReactNode } from 'react';

import { NAV_ITEMS } from '@/lib/navigation';
import { sanityFetch } from '@/lib/sanity/live';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { getTemplate } from '@/lib/template';

// Shared chrome for every marketing page: template Header + Footer around the
// skip-link target. Pages render only their main content.
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const [{ Header, Footer }, settings] = await Promise.all([
    getTemplate(),
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
  ]);

  if (!settings) {
    return (
      <main id="icerik" className="mx-auto max-w-2xl px-8 py-16">
        <h1 className="text-2xl font-semibold text-ink-900">Kurulum eksik</h1>
        <p className="mt-2 text-ink-700">
          Sanity Studio&apos;da &quot;Klinik Bilgileri&quot; henüz doldurulmamış.
        </p>
      </main>
    );
  }

  return (
    <>
      <Header settings={settings} navItems={NAV_ITEMS} />
      <main id="icerik">{children}</main>
      <Footer settings={settings} navItems={NAV_ITEMS} />
    </>
  );
}
