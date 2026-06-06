import type { Metadata } from 'next';

import { urlFor } from '@/lib/sanity/image';
import type { Seo, SiteSettingsQueryResult } from '@/types/sanity';

// Fail loudly in production builds: a missing site URL would silently ship
// localhost canonicals, og:urls, and sitemap entries for the tenant.
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!rawSiteUrl && process.env.NODE_ENV === 'production') {
  throw new Error(
    'Missing NEXT_PUBLIC_SITE_URL — set it in the Vercel project env (see apps/web/.env.example).',
  );
}
export const siteUrl = rawSiteUrl ?? 'http://localhost:3000';

/** Shared fallback when neither Sanity clinicName nor env site name is available. */
export const siteNameFallback = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Veteriner Kliniği';

// Single locale source (CLAUDE.md §8). Sites are Turkish-only (anti-pattern
// #12); these just keep html lang / og:locale / manifest lang in one place.
export const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'tr-TR';
export const htmlLang = defaultLocale.split('-')[0] ?? 'tr';
export const ogLocale = defaultLocale.replace('-', '_');

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
 * metadataBase, OG/Twitter defaults. Deliberately NO `alternates` and no
 * openGraph `url` here — both are inherited verbatim by child routes in
 * Next's metadata merge, which would canonicalize every page to the homepage.
 * Pages set their own via `buildPageMetadata`. When `defaultSeo.ogImage` is
 * unset, the file-convention `app/opengraph-image.tsx` is the OG-image
 * fallback.
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
    openGraph: {
      type: 'website',
      siteName: clinicName,
      locale: ogLocale,
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
  /** Clinic name for og:site_name — pass it when settings are in scope (see openGraph note below). */
  clinicName?: string;
}

/**
 * Per-page metadata: merges the document's embedded `seo` object over the
 * page-computed fallbacks. Two Next merge mechanics shape this function
 * (verified against next@16.2.4 resolve-metadata.js):
 *
 * - A key explicitly set to `undefined` still overrides the parent (set to
 *   null), so optional fields use conditional spread — never `key: maybe`.
 * - A child `openGraph` replaces the root one WHOLESALE (no deep merge), so
 *   this block is always complete (type/locale/url), not an images-only delta.
 */
export function buildPageMetadata({
  title,
  description,
  seo,
  path,
  clinicName,
}: PageMetadataInput): Metadata {
  const images = ogImageOf(seo?.ogImage);
  const resolvedDescription = seo?.metaDescription ?? description;

  return {
    // An editor-set metaTitle is the exact intended title — bypass the root
    // `%s | clinic` template (editors usually include the clinic themselves).
    title: seo?.metaTitle ? { absolute: seo.metaTitle } : title,
    ...(resolvedDescription ? { description: resolvedDescription } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: path,
      ...(clinicName ? { siteName: clinicName } : {}),
      // This block replaces the root openGraph WHOLESALE, which also disables
      // the file-convention fallback — so the dynamic brand OG image must be
      // named explicitly when the editor set none.
      images: images ?? [
        { url: '/opengraph-image', width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT },
      ],
    },
    ...(seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
