import type { MetadataRoute } from 'next';

// Sitemaps only ever list published content, so this fetches with the plain
// client instead of the draft-aware sanityFetch (draftMode() is a
// request-scoped API; metadata routes build statically).
import { client } from '@/lib/sanity/client';
import { sitemapEntriesQuery } from '@/lib/sanity/queries';
import { listTag } from '@/lib/sanity/tags';
import { siteUrl } from '@/lib/seo/metadata';

// Routes land in Chunk 11; listed here so the sitemap is complete at deploy
// time (Chunk 15). Keep in sync with app/(marketing)/ once it exists.
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

  const pageEntries: MetadataRoute.Sitemap = entries.pages.map((p) => ({
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
