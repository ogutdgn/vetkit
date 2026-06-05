import { ImageResponse } from 'next/og';

// OG images only ever show published content, so this fetches with the plain
// client instead of the draft-aware sanityFetch (draftMode() is a
// request-scoped API; metadata routes build statically).
import { client } from '@/lib/sanity/client';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/lib/seo/metadata';

export const alt = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Veteriner Kliniği';
export const size = { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
export const contentType = 'image/png';

// Fallback OG image for every route without an explicit seo.ogImage. Brand
// styling proper (logo, template tokens) lands with Chunk 10; this keeps the
// card presentable until then.
export default async function OpenGraphImage() {
  const settings = await client.fetch(siteSettingsQuery, {}, { next: { tags: [siteSettingsTag] } });

  const clinicName =
    settings?.clinicName ?? process.env.NEXT_PUBLIC_SITE_NAME ?? 'Veteriner Kliniği';
  const tagline = settings?.tagline;
  const accent = settings?.brandColor?.hex ?? '#0f766e';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: 80,
      }}
    >
      <div
        style={{
          width: 120,
          height: 12,
          backgroundColor: accent,
          borderRadius: 6,
          marginBottom: 48,
        }}
      />
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#111827',
          textAlign: 'center',
          lineHeight: 1.15,
        }}
      >
        {clinicName}
      </div>
      {tagline ? (
        <div
          style={{
            fontSize: 32,
            color: '#4b5563',
            marginTop: 24,
            textAlign: 'center',
          }}
        >
          {tagline}
        </div>
      ) : null}
    </div>,
    { ...size },
  );
}
