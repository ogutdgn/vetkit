import { sanityFetch } from '@/lib/sanity/live';
import { servicesListQuery, siteSettingsQuery } from '@/lib/sanity/queries';
import { listTag, siteSettingsTag } from '@/lib/sanity/tags';

// Placeholder home page proving the Sanity chain end-to-end (Chunk 7 smoke
// test): env → client → typed query → tagged fetch → render. The real
// marketing pages land in Chunk 11.
export default async function HomePage() {
  const [settings, services] = await Promise.all([
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
    sanityFetch({ query: servicesListQuery, tags: [listTag('service')] }),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-8 py-16">
      <h1 className="mb-2 text-3xl font-semibold text-brand-600">
        {settings?.clinicName ?? 'vetkit'}
      </h1>
      <p className="leading-relaxed text-ink-700">
        {settings?.tagline ??
          'Sanity round-trip is wired; the dataset has no siteSettings document yet.'}
      </p>
      <p className="mt-4 text-ink-700">
        Tenant:{' '}
        <strong className="text-ink-900">{process.env.NEXT_PUBLIC_SITE_NAME ?? '(unset)'}</strong> ·
        Template: <strong className="text-ink-900">{process.env.TEMPLATE ?? 'modern'}</strong> ·
        Services in Sanity: <strong className="text-ink-900">{services.length}</strong>
      </p>
      <p className="mt-8 text-sm text-ink-500">
        Next.js 16.2.4 · React 19.2 · App Router · Turbopack
      </p>
    </main>
  );
}
