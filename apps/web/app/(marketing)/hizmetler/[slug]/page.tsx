import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { PortableTextRenderer } from '@/components/shared/PortableTextRenderer';
import { client } from '@/lib/sanity/client';
import { urlFor } from '@/lib/sanity/image';
import { sanityFetch } from '@/lib/sanity/live';
import {
  serviceByIdQuery,
  serviceIdBySlugQuery,
  serviceSlugsQuery,
  siteSettingsQuery,
} from '@/lib/sanity/queries';
import { docTag, listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata } from '@/lib/seo/metadata';

const PET_LABELS: Record<string, string> = {
  dog: 'Köpek',
  cat: 'Kedi',
  bird: 'Kuş',
  rabbit: 'Tavşan',
  exotic: 'Egzotik',
};

const LOCATION_LABELS: Record<string, string> = {
  'in-clinic': 'Klinikte',
  'home-call': 'Evde',
  both: 'Klinikte ve evde',
};

interface Params {
  params: Promise<{ slug: string }>;
}

// OD-5 two-step: slug→_id (list-tagged), then the doc tagged with its docTag
// + the dereferenced FAQ list.
async function getService(slug: string) {
  const id = await sanityFetch({
    query: serviceIdBySlugQuery,
    params: { slug },
    tags: [listTag('service')],
  });
  if (!id) return null;
  return sanityFetch({
    query: serviceByIdQuery,
    params: { id },
    tags: [docTag('service', id), listTag('faq')],
  });
}

export async function generateStaticParams() {
  // Plain client: generateStaticParams runs at build time without a request,
  // so the draft-aware sanityFetch (await draftMode()) is not allowed here.
  const slugs = await client.fetch(serviceSlugsQuery, {}, { next: { tags: [listTag('service')] } });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    getService(slug),
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
  ]);
  if (!service) return {};
  return buildPageMetadata({
    title: service.title,
    description: service.shortDescription,
    seo: service.seo,
    path: `/hizmetler/${slug}`,
    clinicName: settings?.clinicName,
  });
}

export default async function HizmetDetayPage({ params }: Params) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    getService(slug),
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
  ]);
  if (!service) notFound();

  return (
    <>
      <section className="bg-ink-900">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">{service.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-300">{service.shortDescription}</p>
            <ul aria-label="Hizmet özellikleri" className="mt-6 flex flex-wrap gap-2">
              {service.emergencyAvailable ? (
                <li className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  7/24 Acil
                </li>
              ) : null}
              <li className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-700 shadow-sm">
                {LOCATION_LABELS[service.serviceLocation] ?? service.serviceLocation}
              </li>
              {service.petTypes?.map((pet) => (
                <li
                  key={pet}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800"
                >
                  {PET_LABELS[pet] ?? pet}
                </li>
              ))}
            </ul>
            {service.pricing ? (
              <p className="mt-4 text-sm font-semibold text-brand-400">{service.pricing}</p>
            ) : null}
            {settings ? (
              <a
                href={`tel:${settings.contact.primaryPhone}`}
                className="mt-8 inline-flex rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Randevu için arayın
              </a>
            ) : null}
          </div>
          {service.mainImage.asset ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={urlFor(service.mainImage).width(1200).height(900).url()}
                alt={service.mainImage.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <PortableTextRenderer value={service.description} />
      </article>
      {service.relatedFAQs?.length ? (
        <section aria-labelledby="faq-heading" className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-ink-900">
              Sıkça Sorulan Sorular
            </h2>
            <div className="mt-6 space-y-3">
              {service.relatedFAQs.map((faq) => (
                <details
                  key={faq._id}
                  className="group rounded-lg border border-ink-200 bg-ink-50 px-5 py-4"
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
        </section>
      ) : null}
    </>
  );
}
