import { ImageResponse } from 'next/og';

import { client } from '@/lib/sanity/client';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { siteNameFallback } from '@/lib/seo/metadata';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Per-tenant favicon without static assets: brand-colored disc + the
// clinic's initial. A real logo-based icon set can replace this per client
// at delivery if desired.
export default async function Icon() {
  const settings = await client.fetch(siteSettingsQuery, {}, { next: { tags: [siteSettingsTag] } });
  const letter =
    (settings?.clinicName ?? siteNameFallback).trim().charAt(0).toLocaleUpperCase('tr-TR') || 'V';
  const accent = settings?.brandColor?.hex ?? '#0f766e';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: accent,
        borderRadius: 8,
        color: '#ffffff',
        fontSize: 20,
      }}
    >
      {letter}
    </div>,
    { ...size },
  );
}
