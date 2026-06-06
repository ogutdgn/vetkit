import type { MetadataRoute } from 'next';

// Manifests only ever show published content, so this fetches with the plain
// client (metadata routes build statically; no draft concern).
import { client } from '@/lib/sanity/client';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { htmlLang, siteNameFallback } from '@/lib/seo/metadata';

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
    // The dynamic brand icons from app/icon.tsx and app/apple-icon.tsx.
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
