import type { Metadata } from 'next';

import { sanityFetch } from '@/lib/sanity/live';
import { servicesListQuery, siteSettingsQuery } from '@/lib/sanity/queries';
import { listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getTemplate } from '@/lib/template';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  return buildPageMetadata({
    title: 'Hizmetlerimiz',
    description: `${settings?.clinicName ?? 'Kliniğimizin'} sunduğu veteriner hizmetleri: muayene, aşılama, cerrahi ve daha fazlası.`,
    path: '/hizmetler',
    clinicName: settings?.clinicName,
  });
}

export default async function HizmetlerPage() {
  const [{ ServiceCard }, services] = await Promise.all([
    getTemplate(),
    sanityFetch({ query: servicesListQuery, tags: [listTag('service')] }),
  ]);

  return (
    <>
      <section className="bg-ink-900">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white">Hizmetlerimiz</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-300">
            Dostlarınızın sağlığı için sunduğumuz tüm hizmetler.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="sr-only">Tüm hizmetler</h2>
        {services.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <p className="text-ink-700">Henüz hizmet eklenmemiş.</p>
        )}
      </section>
    </>
  );
}
