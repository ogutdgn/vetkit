import type { Metadata } from 'next';

import { urlFor } from '@/lib/sanity/image';
import type { Seo, SiteSettingsQueryResult } from '@/types/sanity';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const siteNameFallback = process.env.NEXT_PUBLIC_SITE_NAME ?? 'vetkit';

// schema.org/OG standard dimensions; opengraph-image.tsx uses the same.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** A Sanity seo.ogImage rendered into Next's Metadata image shape, or undefined when no asset is set. */
function ogImageOf(ogImage: Seo['ogImage']): NonNullable<Metadata['openGraph']>['images'] {
  if (!ogImage?.asset) return undefined;
  return [
    {
      url: urlFor(ogImage).width(OG_IMAGE_WIDTH).height(OG_IMAGE_HEIGHT).url(),
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: ogImage.alt,
    },
  ];
}

/**
 * Sitewide metadata for the root layout: title template (`%s | <clinic>`),
 * canonical base, OG/Twitter defaults. Per-page values override via
 * `buildPageMetadata`. When `defaultSeo.ogImage` is unset, the file-convention
 * `app/opengraph-image.tsx` is the OG-image fallback.
 */
export function buildRootMetadata(settings: SiteSettingsQueryResult): Metadata {
  const clinicName = settings?.clinicName ?? siteNameFallback;
  const defaultSeo = settings?.defaultSeo;
  const description =
    defaultSeo?.metaDescription ?? settings?.tagline ?? `${clinicName} — veteriner kliniği`;
  const images = ogImageOf(defaultSeo?.ogImage);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultSeo?.metaTitle ?? clinicName,
      template: `%s | ${clinicName}`,
    },
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: clinicName,
      locale: 'tr_TR',
      url: siteUrl,
      ...(images ? { images } : {}),
    },
    twitter: { card: 'summary_large_image' },
  };
}

interface PageMetadataInput {
  /** Page-computed fallback title (e.g. the service title). `seo.metaTitle` overrides it. */
  title: string;
  /** Page-computed fallback description (e.g. shortDescription). `seo.metaDescription` overrides it. */
  description?: string;
  /** The document's embedded seo object, when it has one. */
  seo?: Seo | null;
  /** Canonical path for this page, e.g. `/hizmetler/kedi-asilamasi`. */
  path: string;
}

/**
 * Per-page metadata: merges the document's embedded `seo` object over the
 * page-computed fallbacks. Root-layout defaults (template, OG site fields)
 * apply automatically via Next's metadata merging.
 */
export function buildPageMetadata({ title, description, seo, path }: PageMetadataInput): Metadata {
  const images = ogImageOf(seo?.ogImage);

  return {
    title: seo?.metaTitle ?? title,
    description: seo?.metaDescription ?? description,
    alternates: { canonical: path },
    ...(images ? { openGraph: { images } } : {}),
    ...(seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
