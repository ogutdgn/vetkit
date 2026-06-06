import type { MetadataRoute } from 'next';

// Manifests only ever show published content, so this fetches with the plain
// client (metadata routes build statically; no draft concern).
import { client } from '@/lib/sanity/client';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { htmlLang, siteNameFallback } from '@/lib/seo/metadata';

// Icons require per-tenant icon assets — they land with the Chunk 11 polish
// pass alongside favicons.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await client.fetch(siteSettingsQuery, {}, { next: { tags: [siteSettingsTag] } });
  const name = settings?.clinicName ?? siteNameFallback;

  return {
    name,
    short_name: name,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: settings?.brandColor?.hex ?? '#ffffff',
    lang: htmlLang,
  };
}
