import type { Metadata } from 'next';

import { PortableTextRenderer } from '@/components/shared/PortableTextRenderer';
import { sanityFetch } from '@/lib/sanity/live';
import { faqsListQuery, siteSettingsQuery } from '@/lib/sanity/queries';
import { listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata } from '@/lib/seo/metadata';

const CATEGORY_LABELS: Record<string, string> = {
  genel: 'Genel',
  asilama: 'Aşılama',
  cerrahi: 'Cerrahi',
  beslenme: 'Beslenme',
  acil: 'Acil',
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  return buildPageMetadata({
    title: 'Sıkça Sorulan Sorular',
    description: 'Aşılama, ameliyat, acil durumlar ve daha fazlası hakkında merak edilenler.',
    path: '/sss',
    clinicName: settings?.clinicName,
  });
}

export default async function SssPage() {
  const faqs = await sanityFetch({ query: faqsListQuery, tags: [listTag('faq')] });

  // Group by category, preserving editor order inside each group.
  const groups = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const cat = faq.category ?? 'genel';
    const list = groups.get(cat) ?? [];
    list.push(faq);
    groups.set(cat, list);
  }

  return (
    <>
      <section className="bg-ink-900">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white">Sıkça Sorulan Sorular</h1>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {faqs.length === 0 ? <p className="text-ink-700">Henüz soru eklenmemiş.</p> : null}
        {[...groups.entries()].map(([category, items]) => (
          <div key={category} className="mt-10 first:mt-0">
            <h2 className="text-xl font-bold tracking-tight text-ink-900">
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <div className="mt-4 space-y-3">
              {items.map((faq) => (
                <details
                  key={faq._id}
                  className="group rounded-lg border border-ink-200 bg-white px-5 py-4"
                >
                  <summary className="cursor-pointer text-base font-medium text-ink-900 group-open:text-brand-700">
                    {faq.question}
                  </summary>
                  <div className="mt-2 text-sm">
                    <PortableTextRenderer value={faq.answer} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
