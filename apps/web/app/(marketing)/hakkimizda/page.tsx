import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortableTextRenderer } from '@/components/shared/PortableTextRenderer';
import { urlFor } from '@/lib/sanity/image';
import { sanityFetch } from '@/lib/sanity/live';
import { pageByIdQuery, pageIdBySlugQuery, siteSettingsQuery } from '@/lib/sanity/queries';
import { docTag, listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getTemplate } from '@/lib/template';

const SLUG = 'hakkimizda';

// OD-5 two-step: slug→_id (list-tagged, survives slug renames), then the
// full doc tagged with its own docTag + the dereferenced teamMember list.
async function getPage() {
  const id = await sanityFetch({
    query: pageIdBySlugQuery,
    params: { slug: SLUG },
    tags: [listTag('page')],
  });
  if (!id) return null;
  return sanityFetch({
    query: pageByIdQuery,
    params: { id },
    tags: [docTag('page', id), listTag('teamMember')],
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getPage(),
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
  ]);
  if (!page) return {};
  return buildPageMetadata({
    title: page.title,
    seo: page.seo,
    path: `/${SLUG}`,
    clinicName: settings?.clinicName,
  });
}

export default async function HakkimizdaPage() {
  const [{ TeamSection }, page] = await Promise.all([getTemplate(), getPage()]);
  if (!page) notFound();

  return (
    <>
      <section className="bg-ink-900">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white">{page.title}</h1>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {page.heroImage?.asset ? (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl shadow-md">
            <Image
              src={urlFor(page.heroImage).width(1600).height(900).url()}
              alt={page.heroImage.alt}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : null}
        <PortableTextRenderer value={page.body} />
        {page.ctaButtons?.length ? (
          <div className="mt-10 flex flex-wrap gap-3">
            {page.ctaButtons.map((cta) => (
              <Link
                key={cta._key}
                href={cta.href}
                {...(cta.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={
                  cta.variant === 'secondary' || cta.variant === 'ghost'
                    ? 'inline-flex rounded-lg border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50'
                    : 'inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700'
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
      </article>
      {page.featuredTeamMembers?.length ? <TeamSection members={page.featuredTeamMembers} /> : null}
    </>
  );
}
