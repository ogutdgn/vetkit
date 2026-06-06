import type { Metadata } from 'next';

import { ImageGallery } from '@/components/shared/ImageGallery';
import { sanityFetch } from '@/lib/sanity/live';
import { galleryImagesQuery, siteSettingsQuery } from '@/lib/sanity/queries';
import { listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  return buildPageMetadata({
    title: 'Galeri',
    description: 'Kliniğimizden ve mutlu hastalarımızdan kareler.',
    path: '/galeri',
    clinicName: settings?.clinicName,
  });
}

export default async function GaleriPage() {
  const images = await sanityFetch({
    query: galleryImagesQuery,
    tags: [listTag('galleryImage')],
  });

  return (
    <>
      <section className="bg-linear-to-b from-brand-50 to-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-ink-900">Galeri</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-700">
            Kliniğimizden ve mutlu hastalarımızdan kareler.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {images.length > 0 ? (
          <ImageGallery images={images} />
        ) : (
          <p className="text-ink-700">Henüz fotoğraf eklenmemiş.</p>
        )}
      </section>
    </>
  );
}
