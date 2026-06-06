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
 * then fetch the full document tagged `docTag('service', _id)` — plus
 * `listTag('faq')`, because this query dereferences relatedFAQs and FAQ
 * edits must bust the page too (see ./tags.ts rule 2).
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

/**
 * All blog posts, newest first, projected for cards. Fetch with
 * `listTag('blogPost')` + `listTag('teamMember')` — `author->` is
 * dereferenced, so teamMember edits must bust this list too (./tags.ts rule 2).
 */
export const blogPostsListQuery = defineQuery(`
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt,
    category,
    tags,
    author-> {
      _id,
      name,
      title
    }
  }
`);

/**
 * All team members in editor-defined order, projected for cards/sections.
 * Fetch with `listTag('teamMember')`.
 */
export const teamMembersListQuery = defineQuery(`
  *[_type == "teamMember"] | order(orderRank asc) {
    _id,
    name,
    title,
    "slug": slug.current,
    photo,
    specialties,
    shortBio
  }
`);

/**
 * Every public slug + its last update, for app/sitemap.ts. Fetch with the
 * three list tags (service/blogPost/page) so publishes refresh the sitemap.
 */
export const sitemapEntriesQuery = defineQuery(`{
  "services": *[_type == "service" && defined(slug.current)] { "slug": slug.current, _updatedAt },
  "posts": *[_type == "blogPost" && defined(slug.current)] { "slug": slug.current, _updatedAt },
  "pages": *[_type == "page" && defined(slug.current)] { "slug": slug.current, _updatedAt }
}`);
