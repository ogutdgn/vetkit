# Schema — Phase 1

> **Source of truth:** [`apps/studio/schemas/`](../apps/studio/schemas/). This file is a fast-onboarding summary; the schema files themselves are authoritative.
>
> **Design rationale:** [`specs/2026-05-26-sanity-schema-design.md`](./specs/2026-05-26-sanity-schema-design.md).

## Locale primitives

Custom object types that wrap a value in a per-locale shape `{ tr, en }`. Defined in `apps/studio/schemas/objects/locale*.ts`.

- `localeString` — short single-line text per locale.
- `localeText` — multi-line plain text per locale.
- `localeSlug` — URL slug per locale; auto-generates from `title[locale]` via the Turkish→ASCII helper in [`apps/studio/lib/locale.ts`](../apps/studio/lib/locale.ts).
- `localePortableText` — rich text per locale; marks limited to `strong`/`em`/`link`, block styles limited to `normal`/`h2`/`h3`/`blockquote`, list styles `bullet`/`number`. No `h1` (page title already provides it).

Editor-side locale filtering is provided by `@sanity/language-filter` in `apps/studio/sanity.config.ts`. The filter detects locale-aware objects by **name prefix** (`localeString`, `localeText`, `localeSlug`, `localePortableText`) and hides children whose key is not in the editor's currently selected language. Sanity v5's strict `ObjectOptions` rejects custom keys like `options.localized`, so the name-prefix approach replaces it.

## Reusable objects

Defined in `apps/studio/schemas/objects/*.ts`.

| Object            | Required fields                                                       | Optional fields                                                                                                        |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `seo`             | — (all optional; defaults computed at query/render time)              | `metaTitle` (localeString), `metaDescription` (localeText), `ogImage` (image, alt required), `noIndex` (default false) |
| `address`         | `street` (localeString), `district`, `city`, `country` (default `TR`) | `postalCode`, `googleMapsUrl`, `coordinates` (lat/lng)                                                                 |
| `openingHours`    | `isAlwaysOpen` (default false)                                        | per-day `closed`/`openTime`/`closeTime` (hidden when `isAlwaysOpen`), `emergencyNote` (localeString)                   |
| `socialLinks`     | — (all platforms optional)                                            | `instagram`, `facebook`, `x`, `youtube`, `tiktok` (URLs), `whatsapp` (E.164 phone)                                     |
| `cta`             | `label` (localeString), `href`                                        | `variant` (primary/secondary/ghost, default primary), `newTab` (default false)                                         |
| `contactInfo`     | `primaryPhone` (E.164), `email`                                       | `emergencyPhone`, `whatsapp`, `secondaryEmails[]`                                                                      |
| `emergencyBanner` | `enabled` (default false)                                             | `text` (localeString), `phone` (E.164; required when enabled), `variant` (top/sticky, default top)                     |

## Documents

Defined in `apps/studio/schemas/documents/*.ts` and `apps/studio/schemas/singletons/siteSettings.ts`.

| Type           | Public URL                  | Singleton? | Orderable list?         | Notes                                                                                                                                                                                           |
| -------------- | --------------------------- | ---------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteSettings` | —                           | ✓          | —                       | Pinned at `_id: 'siteSettings'` via custom desk structure. Holds identity, locales, contact, address, hours, social, emergency banner, footer, SEO defaults, feature flags.                     |
| `service`      | `/hizmetler/[slug]`         | —          | ✓                       | Title, slug, mainImage (alt required), short description, portable-text detail, petTypes, serviceLocation (in-clinic/home-call/both), emergencyAvailable, relatedFAQs, pricing, embedded `seo`. |
| `blogPost`     | `/blog/[slug]`              | —          | sorted by `publishedAt` | Title, slug, excerpt, body, cover (alt required), required author ref → `teamMember`, publishedAt, category enum, tags, related services/posts, embedded `seo`.                                 |
| `teamMember`   | `/ekip/[slug]` (optional)   | —          | ✓                       | Non-localized name (proper noun), localized title, optional slug, photo (alt required), credentials, specialties enum, short/full bio, contact, social links.                                   |
| `faq`          | aggregated on `/sss`        | —          | ✓ (per category)        | Localized question + portable-text answer + optional category enum.                                                                                                                             |
| `galleryImage` | aggregated on `/galeri`     | —          | ✓                       | Image (alt required), optional localized caption, category enum.                                                                                                                                |
| `page`         | `/[slug]`                   | —          | —                       | Generic flexible content type (Hakkımızda, KVKK, etc.). Title, slug, optional heroImage, portable-text body, optional featuredTeamMembers + ctaButtons, embedded `seo`.                         |
| `testimonial`  | aggregated on home/iletisim | —          | ✓                       | Non-localized author name, optional photo, localized content, optional 1-5 rating, source enum (manual/google/trustmary) + optional sourceUrl, featured flag.                                   |

### Required `seo` object on

`service`, `blogPost`, `page` — every public-URL document.

### Required image `alt`

Every image field that carries an asset must have a `localeString` `alt`. For optional images (heroImage on `page`, authorPhoto on `testimonial`), alt is required only when the asset slot is filled — enforced via `Rule.custom` reading `ctx.parent.asset`.

### Validation rules

- **Slugs**: kebab-case, unique per `_type` per locale (Sanity's default slug validation handles uniqueness within type).
- **Phones**: E.164 (`/^\+[1-9]\d{6,14}$/`) wherever a phone field exists.
- **Email**: RFC 5322 via Sanity's `Rule.email()`.
- **URLs**: `Rule.uri({ scheme: ['http', 'https'] })` (the portable-text link annotation also allows `mailto:` and `tel:`).
- **Hex color** on `siteSettings.brandColor.hex`: `/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/`.
- **Time format** on opening hours: `HH:mm`.
- **Localization invariant**: `siteSettings.defaultLocale` must be one of `siteSettings.activeLocales`.

## Studio configuration

`apps/studio/sanity.config.ts` registers:

- `structureTool({ structure: deskStructure })` — the Turkish desk pinning `siteSettings` and exposing the document-type lists.
- `visionTool()` — GROQ playground.
- `languageFilter({ supportedLanguages: [tr, en], defaultLanguages: ['tr'], documentTypes: [all 8] })` — editor-side locale filter using the name-prefix detector for locale objects.

`apps/studio/sanity.cli.js` (renamed from `.ts` to sidestep Sanity v5's strict jiti tsconfig resolution in monorepos) carries projectId/dataset from env.

## Out of scope (Phase 1)

Mirrored from the design spec §10 — captured here so it does not creep in:

- ❌ Google Reviews automated ingest (frontend feature for a later phase; the `testimonial.source` enum already accepts `'google'` for editorially-curated copy/paste).
- ❌ Document-level i18n (`@sanity/document-internationalization`).
- ❌ `product`/`vaccinationSchedule`/multi-location doc types.
- ❌ `service.responsibleVets` — dropped per owner's 2026-05-26 decision.
- ❌ `presentationTool` / live preview.

## Where to update

- Add or remove fields → edit the schema file in `apps/studio/schemas/`. Run `pnpm --filter @vetkit/studio typecheck && pnpm --filter @vetkit/studio build` to validate.
- Add or remove doc types → wire them into `apps/studio/schemas/index.ts` (the `schemaTypes` export) and `apps/studio/structure/deskStructure.ts` (the desk listing). Add them to `languageFilter.documentTypes` in `sanity.config.ts` if locale-aware.
- Change validation rules → edit the schema field and update this file.
