// JSON-LD structured-data builders for local SEO (CLAUDE.md §1.3). Built from
// the siteSettings singleton; pages embed the result via `serializeJsonLd` in
// a `<script type="application/ld+json">`.

import { urlFor } from '@/lib/sanity/image';
import { siteUrl } from '@/lib/seo/metadata';
import type { OpeningHours, SiteSettingsQueryResult } from '@/types/sanity';

const DAYS = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
] as const;

function openingHoursSpecification(hours: OpeningHours): Record<string, unknown>[] {
  if (hours.isAlwaysOpen) {
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAYS.map(([, schemaDay]) => schemaDay),
        opens: '00:00',
        closes: '23:59',
      },
    ];
  }
  return DAYS.flatMap(([field, schemaDay]) => {
    const day = hours[field];
    if (!day) return [];
    if (day.closed) {
      // Google's documented pattern for "closed all day": opens == closes == 00:00.
      return [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: schemaDay,
          opens: '00:00',
          closes: '00:00',
        },
      ];
    }
    if (!day.openTime || !day.closeTime) return [];
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: schemaDay,
        opens: day.openTime,
        closes: day.closeTime,
      },
    ];
  });
}

/**
 * schema.org `VeterinaryCare` (a `LocalBusiness` subtype) for the clinic.
 * Returns null until the siteSettings document exists.
 */
export function buildVeterinaryCareJsonLd(
  settings: SiteSettingsQueryResult,
): Record<string, unknown> | null {
  if (!settings) return null;

  const { address, contact, openingHours, socialLinks } = settings;
  const sameAs = [
    socialLinks?.instagram,
    socialLinks?.facebook,
    socialLinks?.x,
    socialLinks?.youtube,
    socialLinks?.tiktok,
  ].filter((url): url is string => Boolean(url));

  return {
    '@context': 'https://schema.org',
    '@type': 'VeterinaryCare',
    '@id': `${siteUrl}#clinic`,
    name: settings.clinicName,
    url: siteUrl,
    telephone: contact.primaryPhone,
    email: contact.email,
    ...(settings.logo.asset ? { image: urlFor(settings.logo).width(512).url() } : {}),
    ...(settings.tagline ? { description: settings.tagline } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.district,
      addressRegion: address.city,
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      addressCountry: address.country ?? 'TR',
    },
    ...(address.coordinates?.lat != null && address.coordinates.lng != null
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: address.coordinates.lat,
            longitude: address.coordinates.lng,
          },
        }
      : {}),
    openingHoursSpecification: openingHoursSpecification(openingHours),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(address.googleMapsUrl ? { hasMap: address.googleMapsUrl } : {}),
  };
}

/**
 * JSON-LD string safe to inline via dangerouslySetInnerHTML: `<` is escaped
 * so content can never close the script tag.
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
