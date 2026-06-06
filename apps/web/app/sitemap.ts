import type { MetadataRoute } from 'next';

// Sitemaps only ever list published content, so this fetches with the plain
// client instead of the draft-aware sanityFetch (draftMode() is a
// request-scoped API; metadata routes build statically).
import { client } from '@/lib/sanity/client';
import { sitemapEntriesQuery } from '@/lib/sanity/queries';
import { listTag } from '@/lib/sanity/tags';
import { siteUrl } from '@/lib/seo/metadata';

// Keep in sync with app/(marketing)/ and lib/navigation.ts.
const STATIC_ROUTES = ['', '/hakkimizda', '/hizmetler', '/blog', '/galeri', '/sss', '/iletisim'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await client.fetch(
    sitemapEntriesQuery,
    {},
    { next: { tags: [listTag('service'), listTag('blogPost'), listTag('page')] } },
  );

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  const serviceEntries: MetadataRoute.Sitemap = entries.services.map((s) => ({
    url: `${siteUrl}/hizmetler/${s.slug}`,
    lastModified: s._updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = entries.posts.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p._updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Only page docs with a real route — there is no generic /[slug] route yet,
  // so an arbitrary page slug would emit a URL that 404s. Extend (or replace
  // with the generic route) when more fixed pages ship.
  const ROUTED_PAGE_SLUGS = new Set(['hakkimizda']);
  const pageEntries: MetadataRoute.Sitemap = entries.pages
    .filter((p) => ROUTED_PAGE_SLUGS.has(p.slug))
    .map((p) => ({
      url: `${siteUrl}/${p.slug}`,
      lastModified: p._updatedAt,
      changeFrequency: 'yearly',
      priority: 0.5,
    }));

  // Dedupe by URL — a page doc whose slug matches a static route (e.g. the
  // "Hakkımızda" page doc at /hakkimizda) would otherwise appear twice. Doc
  // entries come last so they win and keep their real lastModified.
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...staticEntries, ...serviceEntries, ...postEntries, ...pageEntries]) {
    byUrl.set(entry.url, entry);
  }
  return [...byUrl.values()];
}
