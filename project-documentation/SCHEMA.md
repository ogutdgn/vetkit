# Schema — Phase 1

> **Source of truth:** [`apps/studio/schemas/`](../apps/studio/schemas/). This file is a fast-onboarding summary; the schema files themselves are authoritative.
>
> **Design rationale:** [`specs/2026-05-26-sanity-schema-design.md`](./specs/2026-05-26-sanity-schema-design.md). The field-level i18n described there was removed per **OD-6** (2026-06-05, CLAUDE.md §12): all fields are plain single-language (Turkish) types.

## Rich text (`blockContent`)

The single shared portable-text type, defined in [`apps/studio/schemas/objects/blockContent.ts`](../apps/studio/schemas/objects/blockContent.ts). Marks limited to `strong`/`em`/`link`, block styles limited to `normal`/`h2`/`h3`/`blockquote`, list styles `bullet`/`number`. No `h1` (page title already provides it). Every rich-text field in the schema is `type: 'blockContent'`.

## Slugs

Slug fields auto-generate from `title` via the Turkish→ASCII helper in [`apps/studio/lib/slug.ts`](../apps/studio/lib/slug.ts) (`turkishSlugify`: ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u, then kebab-case, max 96 chars).

## Reusable objects

Defined in `apps/studio/schemas/objects/*.ts`.

| Object            | Required fields                                                 | Optional fields                                                                                            |
| ----------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `seo`             | — (all optional; defaults computed at query/render time)        | `metaTitle` (string), `metaDescription` (text), `ogImage` (image, alt required), `noIndex` (default false) |
| `address`         | `street` (string), `district`, `city`, `country` (default `TR`) | `postalCode`, `googleMapsUrl`, `coordinates` (lat/lng)                                                     |
| `openingHours`    | `isAlwaysOpen` (default false)                                  | per-day `closed`/`openTime`/`closeTime` (hidden when `isAlwaysOpen`), `emergencyNote` (string)             |
| `socialLinks`     | — (all platforms optional)                                      | `instagram`, `facebook`, `x`, `youtube`, `tiktok` (URLs), `whatsapp` (E.164 phone)                         |
| `cta`             | `label` (string), `href`                                        | `variant` (primary/secondary/ghost, default primary), `newTab` (default false)                             |
| `contactInfo`     | `primaryPhone` (E.164), `email`                                 | `emergencyPhone`, `whatsapp`, `secondaryEmails[]`                                                          |
| `emergencyBanner` | `enabled` (default false)                                       | `text` (string), `phone` (E.164; required when enabled), `variant` (top/sticky, default top)               |

## Documents

Defined in `apps/studio/schemas/documents/*.ts` and `apps/studio/schemas/singletons/siteSettings.ts`.

| Type           | Public URL                  | Singleton? | Orderable list?         | Notes                                                                                                                                                                                       |
| -------------- | --------------------------- | ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteSettings` | —                           | ✓          | —                       | Pinned at `_id: 'siteSettings'` via custom desk structure. Holds identity, contact, address, hours, social, emergency banner, footer, SEO defaults, feature flags.                          |
| `service`      | `/hizmetler/[slug]`         | —          | ✓                       | Title, slug, mainImage (alt required), short description, rich-text detail, petTypes, serviceLocation (in-clinic/home-call/both), emergencyAvailable, relatedFAQs, pricing, embedded `seo`. |
| `blogPost`     | `/blog/[slug]`              | —          | sorted by `publishedAt` | Title, slug, excerpt, body, cover (alt required), required author ref → `teamMember`, publishedAt, category enum, tags, related services/posts, embedded `seo`.                             |
| `teamMember`   | `/ekip/[slug]` (optional)   | —          | ✓                       | Name (proper noun), title, optional slug, photo (alt required), credentials, specialties enum, short/full bio, contact, social links.                                                       |
| `faq`          | aggregated on `/sss`        | —          | ✓ (per category)        | Question + rich-text answer + optional category enum.                                                                                                                                       |
| `galleryImage` | aggregated on `/galeri`     | —          | ✓                       | Image (alt required), optional caption, category enum.                                                                                                                                      |
| `page`         | `/[slug]`                   | —          | —                       | Generic flexible content type (Hakkımızda, KVKK, etc.). Title, slug, optional heroImage, rich-text body, optional featuredTeamMembers + ctaButtons, embedded `seo`.                         |
| `testimonial`  | aggregated on home/iletisim | —          | ✓                       | Author name, optional photo, rich-text content, optional 1-5 rating, source enum (manual/google/trustmary) + optional sourceUrl, featured flag.                                             |

### Required `seo` object on

`service`, `blogPost`, `page` — every public-URL document.

### Required image `alt`

Every image field that carries an asset must have a `string` `alt`. For optional images (heroImage on `page`, authorPhoto on `testimonial`), alt is required only when the asset slot is filled — enforced via `Rule.custom` reading `ctx.parent.asset`.

### Validation rules

- **Slugs**: kebab-case, unique per `_type` (Sanity's default slug validation handles uniqueness within type).
- **Phones**: E.164 (`/^\+[1-9]\d{6,14}$/`) wherever a phone field exists.
- **Email**: RFC 5322 via Sanity's `Rule.email()`.
- **URLs**: `Rule.uri({ scheme: ['http', 'https'] })` (the portable-text link annotation also allows `mailto:` and `tel:`).
- **Hex color** on `siteSettings.brandColor.hex`: `/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/`.
- **Time format** on opening hours: `HH:mm`.

## Studio configuration

`apps/studio/sanity.config.ts` registers:

- `structureTool({ structure: deskStructure })` — the Turkish desk pinning `siteSettings` and exposing the document-type lists.
- `visionTool()` — GROQ playground.
- `trTRLocale()` — Turkish translation bundle for the Studio chrome (menus, validation messages, empty states). Sanity v5 has no `defineConfig`-level "force locale" hook, so editors pick Turkish once via the language switcher in the top bar; the choice persists per browser. For single-tenant Studios (one per clinic) this is fine.

`apps/studio/sanity.cli.js` (renamed from `.ts` to sidestep Sanity v5's strict jiti tsconfig resolution in monorepos) carries projectId/dataset from env plus the `typegen` config block (path/schema/generates).

## Out of scope (Phase 1)

Mirrored from the design spec §10 — captured here so it does not creep in:

- ❌ **Any content i18n** — field-level `{ tr, en }` removed per OD-6 (2026-06-05); document-level i18n (`@sanity/document-internationalization`) rejected earlier. Sites are Turkish-only; revisit when a real bilingual client appears (CLAUDE.md anti-pattern #12).
- ❌ Google Reviews automated ingest (frontend feature for a later phase; the `testimonial.source` enum already accepts `'google'` for editorially-curated copy/paste).
- ❌ `product`/`vaccinationSchedule`/multi-location doc types.
- ❌ `service.responsibleVets` — dropped per owner's 2026-05-26 decision.
- ❌ `presentationTool` / live preview.

## Where to update

- Add or remove fields → edit the schema file in `apps/studio/schemas/`. Run `pnpm --filter @vetkit/studio typecheck && pnpm --filter @vetkit/studio build` to validate.
- Add or remove doc types → wire them into `apps/studio/schemas/index.ts` (the `schemaTypes` export) and `apps/studio/structure/deskStructure.ts` (the desk listing).
- Change validation rules → edit the schema field and update this file.
- After any schema change → `pnpm --filter @vetkit/studio typegen` to regenerate `packages/sanity-types/`.
