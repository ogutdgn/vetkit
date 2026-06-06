import { ImageResponse } from 'next/og';

import { client } from '@/lib/sanity/client';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { siteNameFallback } from '@/lib/seo/metadata';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Apple touch icon — same brand disc as app/icon.tsx at home-screen size.
export default async function AppleIcon() {
  const settings = await client.fetch(siteSettingsQuery, {}, { next: { tags: [siteSettingsTag] } });
  const letter = (settings?.clinicName ?? siteNameFallback).trim().charAt(0).toUpperCase() || 'V';
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
        color: '#ffffff',
        fontSize: 110,
      }}
    >
      {letter}
    </div>,
    { ...size },
  );
}
