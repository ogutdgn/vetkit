import { defineQuery } from 'next-sanity';

// All queries are `defineQuery(...)` so `pnpm --filter @vetkit/studio typegen`
// emits result types for them (the typegen `path` glob covers apps/web/lib/).
// Fetch through `sanityFetch` (./live.ts) and pass the matching tags from
// ./tags.ts — never call client.fetch directly from pages.

/** The siteSettings singleton — clinic identity, contact, hours, branding. */
export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]`);

/** All services in editor-defined order, projected for cards and lists. */
export const servicesListQuery = defineQuery(`
  *[_type == "service"] | order(orderRank asc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    mainImage,
    icon,
    petTypes,
    serviceLocation,
    emergencyAvailable,
    pricing
  }
`);

/**
 * A single service by slug, related FAQs resolved.
 *
 * Tagging note (OD-5): the per-doc tag `sanity:service:<id>` needs the `_id`,
 * which a by-slug fetch only knows afterwards. The detail pages (Chunk 11)
 * resolve this with a cheap slug→_id lookup tagged `sanity:service:list`,
 * then fetch the full document tagged `docTag('service', _id)`.
 */
export const serviceBySlugQuery = defineQuery(`
  *[_type == "service" && slug.current == $slug][0] {
    ...,
    relatedFAQs[]-> {
      _id,
      question,
      answer,
      category
    }
  }
`);
