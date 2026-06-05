# Sanity schema design — Phase 1 (Chunk 4)

> **Status:** Approved by project owner on 2026-05-26 for implementation. Replaces and supersedes the in-progress brainstorm at `project-documentation/working-notes/2026-05-21-chunk-4-brainstorm.md`; that brainstorm is deleted in the final docs commit of Chunk 4 (see §12), not here, so cross-references stay valid during the implementation commits.
>
> **Superseded in part (2026-06-05):** the field-level i18n design (locale primitives, `activeLocales`/`defaultLocale`, `@sanity/language-filter`) was removed per **OD-6** (CLAUDE.md §12); all fields are now plain single-language types. See [`../SCHEMA.md`](../SCHEMA.md) for the current schema.
>
> **Scope:** Implement the full Phase 1 Sanity schema in `apps/studio/schemas/` per CLAUDE.md §5 — all document types, all reusable objects, singleton enforcement, field-level i18n primitives, and a Turkish-friendly Studio structure.
>
> **Reading order:**
>
> 1. This file (the **what**).
> 2. `CLAUDE.md` §5 (the **why** — schema design principles).
> 3. The implementation plan (drafted next, will be linked here once written).

---

## 1. Locked architectural decisions

These were debated in the 2026-05-21 brainstorm and confirmed on 2026-05-26. They are also queued for promotion to `CLAUDE.md` §12 once Chunk 4 ships.

### 1.1 Sanity major version: **v5** (revised from v4)

The brainstorm originally locked v4 with the reasoning "v5 plugin ecosystem too young." A verification of the npm registry on 2026-05-26 invalidated that premise:

| Package                           | Latest version (2026-05-26) | Notes                                        |
| --------------------------------- | --------------------------- | -------------------------------------------- |
| `sanity`                          | 5.26.0                      | `latest` dist-tag                            |
| `@sanity/vision`                  | 5.x                         | tracks core                                  |
| `@sanity/language-filter`         | 5.0.2                       | `peerDep: ^5` — **does not support v4**      |
| `@sanity/orderable-document-list` | 1.5.1                       | `peerDep: ^3.77.0 \|\| ^4.0.0-0 \|\| ^5.0.0` |

`@sanity/language-filter` is a load-bearing dependency for our editor-side locale filtering. Its peerDep window is `^5` only — staying on v4 would require either pinning an older language-filter or forking it, both of which carry more cost than the v3→v5 jump itself. The schema authoring API (`defineType`, `defineField`, type definitions) is essentially unchanged across v3/v4/v5, so the actual migration cost is minimal.

**Decision:** Sanity v5. The 3 year lifetime argument from the brainstorm still applies, just to v5 instead.

### 1.2 i18n pattern: **field-level locale objects (Pattern B)**

Locale-aware fields use custom object types (`localeString`, `localeText`, `localeSlug`, `localePortableText`) that store both languages inline. One document, both locales visible to editors who have permission to see both.

Rejected: document-level i18n via `@sanity/document-internationalization` (one doc per locale). Reason: small editorial teams (1–3 people per clinic) keep translations in sync more reliably when both languages sit side-by-side.

### 1.3 Phase 1 locales: **`tr` and `en`**

`tr` is the primary locale; `en` is the secondary. The schema is uniform across all tenants; per-tenant exposure is controlled by `siteSettings.activeLocales` plus the `@sanity/language-filter` plugin in Studio. A TR-only clinic literally cannot see EN fields in their Studio.

### 1.4 Multi-tenant uniformity

One schema, all tenants. `siteSettings.activeLocales` drives the editor view (via `language-filter`) and the frontend's locale routing. `defaultLocale` (always `tr` in Phase 1, but typed as a locale enum for future flexibility) controls fallback rendering.

### 1.5 Freshness: on-demand revalidation

Sanity webhook → `/api/revalidate` (route added in Chunk 13) → `revalidateTag(...)` against locale + document-type tags. Not time-based ISR, not Sanity Live Content. Belongs to Chunk 13; mentioned here only because the schema must emit predictable tags via the GROQ queries written in Chunk 7.

---

## 2. Schema-shape rules

These derive from CLAUDE.md §5 and are non-negotiable for every schema file.

| Rule                                                                                                                                                                                                                                                                                                      | Enforcement                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One schema, all templates.** No template-specific fields.                                                                                                                                                                                                                                               | Code review; no `template === 'modern'` conditionals anywhere in `apps/studio/`.                                                                                                                                                                                                                                                                   |
| **Every public-URL document embeds `seo`.**                                                                                                                                                                                                                                                               | `service`, `blogPost`, `page` all carry a required `seo` object. `metaTitle` falls back to `title[locale]`; `metaDescription` falls back to first 160 chars of the document's `excerpt`/`shortDescription` if empty (fallback is a query-layer concern, not a schema concern — schema just leaves `seo.metaTitle`/`seo.metaDescription` optional). |
| **Every Turkish-facing field has a Turkish `description`.**                                                                                                                                                                                                                                               | Editors are not developers. `title.description = 'Sayfa başlığı (her iki dilde de zorunlu)'` style throughout.                                                                                                                                                                                                                                     |
| **Every image field has `hotspot: true`.**                                                                                                                                                                                                                                                                | Plus an `alt: localeString` that is `Rule.required()`. Editors can use empty string for purely decorative images but must consciously choose.                                                                                                                                                                                                      |
| **Portable Text restrictions.**                                                                                                                                                                                                                                                                           | Marks: `strong`, `em`, `link`. Block styles: `normal`, `h2`, `h3`, `blockquote`. **No h1.** No image-in-text in Phase 1 (keep PT to text; figure-with-caption can come later as a custom block if asked).                                                                                                                                          |
| **Slugs auto-generate from `title[locale]`** with a Turkish→ASCII normalization layer. Manual override allowed. Validation: kebab-case + unique within doc type per locale.                                                                                                                               |
| **Required-vs-optional rule of thumb:** required only if absence would break the site. Everything else optional with sensible fallbacks computed in the query/render layer.                                                                                                                               |
| **References:** `service.responsibleVets` is **dropped** per project owner's decision (YAGNI; old sites do not surface vet-per-service info). `blogPost.author` is a required ref to `teamMember`. `service.relatedFAQs` is an optional ref array to `faq`. `siteSettings.address` is inline (used once). |
| **Orderable lists:** `service`, `teamMember`, `faq`, `galleryImage`, `testimonial` all use `@sanity/orderable-document-list` for drag-and-drop ordering. No manual `order: number` UI shown to editors.                                                                                                   |

---

## 3. Folder layout

```
apps/studio/
├── schemas/
│   ├── objects/
│   │   ├── localeString.ts
│   │   ├── localeText.ts
│   │   ├── localeSlug.ts
│   │   ├── localePortableText.ts
│   │   ├── seo.ts
│   │   ├── address.ts
│   │   ├── openingHours.ts
│   │   ├── socialLinks.ts
│   │   ├── cta.ts
│   │   ├── contactInfo.ts
│   │   └── emergencyBanner.ts
│   ├── documents/
│   │   ├── service.ts
│   │   ├── blogPost.ts
│   │   ├── teamMember.ts
│   │   ├── faq.ts
│   │   ├── galleryImage.ts
│   │   ├── page.ts
│   │   └── testimonial.ts
│   ├── singletons/
│   │   └── siteSettings.ts
│   └── index.ts                  # exports `schemaTypes`
├── structure/
│   └── deskStructure.ts          # Turkish menu, singleton enforcement, orderable lists
├── lib/
│   └── localeNormalize.ts        # tr→ASCII helper used by localeSlug
├── sanity.config.ts
├── sanity.cli.ts
└── package.json
```

---

## 4. Reusable objects (11)

Every object below is a Sanity `object` type — registered in `schemas/index.ts` and referenced by name from documents.

### 4.1 `localeString`

```ts
defineType({
  name: 'localeString',
  type: 'object',
  title: 'Çok dilli kısa metin',
  fields: [
    defineField({ name: 'tr', type: 'string', title: 'Türkçe' }),
    defineField({ name: 'en', type: 'string', title: 'English' }),
  ],
});
```

Used wherever a single-line string needs translation. Required-ness is enforced at the consuming field, not on the locale object itself — we use a custom `Rule.custom((value, ctx) => requireLocale(value, ctx, ['tr']))` helper that checks the **active** locales rather than always-both.

### 4.2 `localeText`

Same shape as `localeString` but `type: 'text'` per locale. Used for long-form plain text (e.g. `excerpt`, `shortDescription`).

### 4.3 `localeSlug`

```ts
defineType({
  name: 'localeSlug',
  type: 'object',
  title: 'Çok dilli URL kimliği',
  fields: [
    defineField({
      name: 'tr',
      type: 'slug',
      title: 'Türkçe slug',
      options: {
        source: (doc) => doc.title?.tr ?? '',
        slugify: turkishSlugify,
        maxLength: 96,
      },
    }),
    defineField({
      name: 'en',
      type: 'slug',
      title: 'English slug',
      options: {
        source: (doc) => doc.title?.en ?? '',
        slugify: defaultSlugify,
        maxLength: 96,
      },
    }),
  ],
});
```

`turkishSlugify` (in `lib/localeNormalize.ts`) does: lowercase → `ç→c, ğ→g, ı→i, İ→i, ö→o, ş→s, ü→u` → strip non-alphanumeric → collapse hyphens → trim. Unique-per-type validation is added at the consuming document.

### 4.4 `localePortableText`

```ts
defineType({
  name: 'localePortableText',
  type: 'object',
  title: 'Çok dilli zengin metin',
  fields: [
    defineField({ name: 'tr', type: 'array', of: [{ type: 'block', ... }] }),
    defineField({ name: 'en', type: 'array', of: [{ type: 'block', ... }] }),
  ],
});
```

The `block` definition restricts marks (`strong`, `em`, `link`) and styles (`normal`, `h2`, `h3`, `blockquote`) per CLAUDE.md §5. Annotations: `link` only, with `href` (url) and optional `newTab` (bool).

### 4.5 `seo`

```ts
{
  metaTitle?: localeString;          // falls back to doc.title at render time
  metaDescription?: localeText;      // falls back to doc.excerpt/shortDescription
  ogImage?: image;                   // alt: localeString required, hotspot true
  noIndex?: boolean;                 // default false
}
```

### 4.6 `address`

```ts
{
  street: localeString;              // required — neighborhoods named in TR
  district: string;                  // 'Çankaya', 'Keçiören' — proper noun, single string
  city: string;                      // 'Ankara' — proper noun
  postalCode?: string;
  country: string;                   // default 'TR' (ISO code), shown in Studio as 'Türkiye' via list options
  googleMapsUrl?: url;
  coordinates?: { lat: number; lng: number };
}
```

### 4.7 `openingHours`

```ts
{
  isAlwaysOpen: boolean;             // shortcut: '7/24 Acil' clinics
  monday..sunday: {
    closed: boolean;                 // default false
    openTime?: string;               // 'HH:mm', validated
    closeTime?: string;              // 'HH:mm', validated
  };
  emergencyNote?: localeString;      // e.g. 'Hafta sonu acil için telefon: ...'
}
```

When `isAlwaysOpen` is true, per-day fields are hidden in Studio (via `hidden` callback) and the frontend renders 'TÜM GÜN' / '24/7 Open'.

### 4.8 `socialLinks`

```ts
{
  instagram?: url;
  facebook?: url;
  x?: url;
  youtube?: url;
  tiktok?: url;
  whatsapp?: string;                 // E.164 phone, opens wa.me link
}
```

All optional. Frontend renders only the ones present.

### 4.9 `cta`

```ts
{
  label: localeString;               // required
  href: string;                      // internal path or external URL; validated to start with '/' or 'http(s)://'
  variant?: 'primary' | 'secondary' | 'ghost';
  newTab?: boolean;
}
```

### 4.10 `contactInfo`

```ts
{
  primaryPhone: string;              // E.164, required
  emergencyPhone?: string;           // optional alternate
  whatsapp?: string;                 // E.164
  email: string;                     // RFC 5322, required
  secondaryEmails?: string[];        // each validated
}
```

### 4.11 `emergencyBanner`

```ts
{
  enabled: boolean;                  // master switch
  text: localeString;                // e.g. '7/24 Acil Servis'
  phone: string;                     // E.164
  variant?: 'top' | 'sticky';
}
```

Per the project owner's confirmation, this lives inside `siteSettings` (one banner site-wide). Not a separate document type.

---

## 5. Document types (8)

### 5.1 `siteSettings` (singleton)

```ts
{
  // Identity
  clinicName: localeString;          // required
  tagline?: localeString;
  logo: image;                       // required, alt required
  brandColor: { hex: string; name?: string };  // required

  // Localization
  activeLocales: ('tr' | 'en')[];    // required, min 1
  defaultLocale: 'tr' | 'en';        // required

  // Contact & address
  contact: contactInfo;              // required
  address: address;                  // required
  openingHours: openingHours;        // required

  // Branding extras
  socialLinks: socialLinks;          // all sub-fields optional
  emergencyBanner: emergencyBanner;  // disabled by default
  footerText?: localeText;
  footerLinks?: cta[];

  // SEO defaults
  defaultSeo: seo;                   // used as fallback for documents missing seo fields

  // Feature flags
  vercelAnalyticsEnabled?: boolean;  // default false; opt-in per CLAUDE.md §3
}
```

Singleton enforcement via custom desk structure (see §6).

### 5.2 `service`

```ts
{
  title: localeString;                            // required
  slug: localeSlug;                                // required, unique
  mainImage: image;                                // required, alt required, hotspot
  icon?: image;                                    // optional small SVG/PNG for cards
  shortDescription: localeText;                    // required, for cards
  description: localePortableText;                 // required, for detail page
  petTypes?: ('dog' | 'cat' | 'bird' | 'rabbit' | 'exotic')[];
  serviceLocation: 'in-clinic' | 'home-call' | 'both';  // required
  emergencyAvailable: boolean;                     // default false
  relatedFAQs?: reference[];                       // → faq[]
  pricing?: localeString;                          // optional — 'X TL den başlayan' style
  seo: seo;                                        // embedded
}
```

Ordering via `orderable-document-list` (no `order` field exposed in Studio).

### 5.3 `blogPost`

```ts
{
  title: localeString;                             // required
  slug: localeSlug;                                // required, unique
  excerpt: localeText;                             // required
  body: localePortableText;                        // required
  coverImage: image;                               // required, alt required
  author: reference;                               // → teamMember, required
  publishedAt: datetime;                           // required, defaults to now()
  category?: 'genel' | 'beslenme' | 'asilama' | 'davranis' | 'acil';  // editor-friendly enum
  tags?: string[];
  relatedServices?: reference[];                   // → service[]
  relatedPosts?: reference[];                      // → blogPost[]
  seo: seo;
}
```

### 5.4 `teamMember`

```ts
{
  name: string;                                    // required, NOT localized (proper noun)
  title: localeString;                             // required, e.g. 'Veteriner Hekim' / 'Veterinarian'
  slug?: slug;                                     // optional — only present if /ekip/<slug> route used
  photo: image;                                    // required, alt required
  credentials?: localeString[];                    // e.g. 'Ankara Üniversitesi Veteriner Fakültesi'
  specialties?: ('cerrahi' | 'dahiliye' | 'jinekoloji' | 'cildiye' | 'davranis' | 'acil')[];
  shortBio?: localeText;
  bio?: localePortableText;
  email?: string;
  phone?: string;
  socialLinks?: socialLinks;
}
```

Ordering via `orderable-document-list`.

### 5.5 `faq`

```ts
{
  question: localeString;                          // required
  answer: localePortableText;                      // required
  category?: 'genel' | 'asilama' | 'cerrahi' | 'beslenme' | 'acil';
}
```

Ordering via `orderable-document-list` (per category).

### 5.6 `galleryImage`

```ts
{
  image: image;                                    // required, alt required, hotspot
  caption?: localeString;
  category?: 'klinik-ici' | 'tedavi' | 'ekip' | 'hastalar';
}
```

Ordering via `orderable-document-list`.

### 5.7 `page` (generic flexible page)

Used for "Hakkımızda", "KVKK", "Çerez Politikası", etc. — anything not covered by a dedicated doc type.

```ts
{
  title: localeString;                             // required
  slug: localeSlug;                                // required, unique
  heroImage?: image;                               // optional hero, alt required if present
  body: localePortableText;                        // required — the main content
  featuredTeamMembers?: reference[];               // → teamMember[], for About-style pages
  ctaButtons?: cta[];                              // for landing-style pages
  seo: seo;
}
```

Per the project owner's decision: keep `page` generic and customizable rather than carving out a dedicated `aboutPage` singleton. The optional `featuredTeamMembers` + `ctaButtons` give "About" pages enough opinionated structure without locking other generic pages into the same shape.

### 5.8 `testimonial`

```ts
{
  authorName: string;                              // required, NOT localized (proper noun)
  authorPhoto?: image;                             // optional, alt required if present
  content: localePortableText;                     // required
  rating?: 1 | 2 | 3 | 4 | 5;
  source: 'manual' | 'google' | 'trustmary';       // required, default 'manual'
  sourceUrl?: url;                                 // for 'google'/'trustmary' attribution
  publishedAt?: datetime;
  featured?: boolean;                              // surfaced on homepage if true
}
```

Per the project owner's decision: include from Phase 1 to provide a native testimonial pipeline. Google Reviews automated ingest is **explicitly out of scope** for Phase 1 — `source: 'google'` is for editorially-curated copy/paste of selected Google reviews with attribution. Automated Google Places API integration is deferred to a later phase. Trustmary widget embedding remains a frontend concern and can coexist with native testimonials.

Ordering via `orderable-document-list`.

---

## 6. Singleton enforcement (`siteSettings`)

In `apps/studio/structure/deskStructure.ts`:

```ts
import type { StructureResolver } from 'sanity/structure';

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('İçerik')
    .items([
      S.listItem()
        .title('Klinik Bilgileri')
        .id('siteSettings')
        .child(S.editor().id('siteSettings').schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('service').title('Hizmetler'),
      S.documentTypeListItem('blogPost').title('Blog Yazıları'),
      S.documentTypeListItem('teamMember').title('Ekip'),
      S.documentTypeListItem('faq').title('Sıkça Sorulan Sorular'),
      S.documentTypeListItem('galleryImage').title('Galeri'),
      S.documentTypeListItem('testimonial').title('Görüşler'),
      S.documentTypeListItem('page').title('Sayfalar'),
    ]);
```

Plus, in the schema file:

```ts
defineType({
  name: 'siteSettings',
  type: 'document',
  title: 'Klinik Bilgileri',
  // Hide from "Create new" menu; only the desk-structure entry can open it.
  __experimental_actions: ['update', 'publish'],
  // ...
});
```

The desk structure pins the document at `_id: 'siteSettings'`. Combined with the action filter, this guarantees exactly one settings document per project — the canonical Sanity v5 pattern.

The orderable doc-type lists (`service`, `teamMember`, `faq`, `galleryImage`, `testimonial`) will use the `orderable-document-list` plugin's `S.orderableDocumentListDeskItem(...)` helper rather than the plain `documentTypeListItem` shown above. Plan-stage detail.

---

## 7. Studio configuration

`apps/studio/sanity.config.ts`:

```ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { languageFilter } from '@sanity/language-filter';
import { schemaTypes } from './schemas';
import { deskStructure } from './structure/deskStructure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineConfig({
  name: 'vetkit',
  title: process.env.SANITY_STUDIO_TITLE ?? 'vetkit Studio',
  projectId,
  dataset,
  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
    languageFilter({
      supportedLanguages: [
        { id: 'tr', title: 'Türkçe' },
        { id: 'en', title: 'English' },
      ],
      defaultLanguages: ['tr'],
      documentTypes: [
        'siteSettings',
        'service',
        'blogPost',
        'teamMember',
        'faq',
        'galleryImage',
        'page',
        'testimonial',
      ],
      // Filter applies to fields whose `localized` option is true. We mark
      // localeString/localeText/localeSlug/localePortableText as localized via
      // the `options.localized` field on the underlying type registrations.
      filterField: (enclosingType, member, selectedLanguageIds) =>
        !enclosingType.options?.localized || selectedLanguageIds.includes(member.name),
    }),
  ],
  schema: { types: schemaTypes },
});
```

The `filterField` predicate runs once per field render. The locale primitives (`localeString` etc.) are registered with `options: { localized: true }` so the filter knows to inspect their children's `name` (the language code) against the editor's selected languages.

A future iteration may read `activeLocales` from the live `siteSettings` document and pass it as `defaultLanguages` — that requires a Studio-side fetch and is deferred to a follow-up if editor UX demands it.

---

## 8. Packages to install

Add to `apps/studio/package.json`:

```jsonc
{
  "dependencies": {
    "sanity": "^5.26.0",
    "@sanity/language-filter": "^5.0.2",
    "@sanity/orderable-document-list": "^1.5.1",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "styled-components": "^6.1.15",
  },
  "devDependencies": {
    "@sanity/vision": "^5.26.0",
    // ...existing devDependencies kept
  },
}
```

`pnpm install` reruns at the workspace root. Verify Node 24 LTS still satisfies Sanity v5's `engines` constraint (`>=20.19 <22 || >=22.12`) — Node 24 is fine.

---

## 9. Validation rules (summary)

Per-field rules expressed in TypeScript:

- **Required locale strings:** A custom `requireLocales` helper that takes the locales the field must be filled for. In Phase 1 every required `localeString`/`localeText` field requires `['tr']` (since EN may be off for TR-only clinics); render layer must handle missing EN with graceful fallback to TR.
- **Slugs:** kebab-case (`/^[a-z0-9]+(-[a-z0-9]+)*$/`), unique per `_type` per locale.
- **Phone:** E.164 (`/^\+[1-9]\d{6,14}$/`). Surfaced via a shared `phoneRule(field)` helper.
- **Email:** RFC 5322 via Sanity's built-in `Rule.email()`.
- **URLs:** Sanity's `Rule.uri({ scheme: ['http', 'https'] })`.
- **Image alt:** `Rule.required().error('Alt metni a11y için zorunlu; sırf süs için ise boş bırakabilirsiniz.')` — wording forces a conscious choice.
- **Active locales / default locale:** `defaultLocale` must be one of `activeLocales` — `Rule.custom(...)`.

---

## 10. Out of scope (Phase 1)

These are NOT implemented in Chunk 4. Captured here so they do not creep in:

- ❌ Google Places API ingest for testimonials (frontend integration in a later phase).
- ❌ Document-level i18n (rejected in §1.2).
- ❌ `product` doc type (feed catalog — overkill at 1–2 clients).
- ❌ `vaccinationSchedule` doc type (speculative).
- ❌ Multi-location (`branch` / `location` doc) — both clients are single-location.
- ❌ Before/after gallery — niche.
- ❌ `service.responsibleVets` — dropped per owner's decision.
- ❌ Live preview / `presentationTool` — not needed for Studio MVP, can be added in Chunk 7+ if useful.
- ❌ Custom Studio components beyond the desk structure (e.g. fancy input components) — defer until a real editor friction is reported.

---

## 11. Verification (Done-when criteria)

The chunk is complete when, with `SANITY_STUDIO_PROJECT_ID` pointed at a scratch dataset:

1. `pnpm install` at root finishes cleanly; `sanity@^5` resolves to a 5.x version.
2. `pnpm --filter @vetkit/studio typecheck` passes (TS strict + `noUncheckedIndexedAccess`).
3. `pnpm --filter @vetkit/studio lint` passes.
4. `pnpm --filter @vetkit/studio build` succeeds (Studio builds for production).
5. `pnpm --filter @vetkit/studio dev` opens Studio. The Turkish "İçerik" menu shows: Klinik Bilgileri (singleton), Hizmetler, Blog Yazıları, Ekip, Sıkça Sorulan Sorular, Galeri, Görüşler, Sayfalar.
6. Each of the 8 doc types can be opened in "Create" mode and saved with the minimum required fields. Required-field validation fires for missing values.
7. The language-filter dropdown is present; switching it hides EN fields when only `tr` is selected.
8. A `siteSettings` document at `_id: 'siteSettings'` can be opened and edited; "Create new Klinik Bilgileri" is not possible from the UI.
9. `service`/`teamMember`/`faq`/`galleryImage`/`testimonial` lists support drag-to-reorder.

A separate Studio QA pass (creating one document of each type with realistic content) happens after merge but before Chunk 5.

---

## 12. Commit split (target)

Per `.claude/skills/writing-commits/SKILL.md`:

1. `chore(studio): upgrade sanity to v5 and add language-filter + orderable-document-list`
2. `feat(studio): add locale primitives (localeString/Text/Slug/PortableText) and helpers`
3. `feat(studio): add reusable objects (seo, address, openingHours, socialLinks, cta, contactInfo, emergencyBanner)`
4. `feat(studio): add siteSettings singleton with desk-structure enforcement`
5. `feat(studio): add service and blogPost document types with SEO`
6. `feat(studio): add teamMember, faq, galleryImage, page, testimonial document types`
7. `docs(schema): document the Phase 1 schema in project-documentation/SCHEMA.md`
8. `docs(project): mark Chunk 4 done, log OD-1 resolution, set Chunk 5 active` (plan.md + CLAUDE.md §12 + execution-map.md + last-point.md, and delete the working-notes brainstorm)

---

## 13. Decision-log entries queued for `CLAUDE.md` §12

To be appended in the docs commit:

| Date       | Decision                                                                                                                                                                                                    | Rationale                                                                                                                                                                                                                        | Section |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 2026-05-26 | **Sanity v5** (revises the 2026-05-21 brainstorm pick of v4)                                                                                                                                                | `@sanity/language-filter@5` is `peerDep: ^5` only; the "v5 plugin ecosystem too young" concern is invalidated as of npm state on 2026-05-26. v5 is current stable with ~3 year lifetime.                                         | 3       |
| 2026-05-26 | **Field-level i18n** via custom `localeString` / `localeText` / `localeSlug` / `localePortableText`; locales `tr` + `en`; per-tenant exposure via `siteSettings.activeLocales` + `@sanity/language-filter`. | One-document-two-locales is simpler for small editorial teams; document-level i18n via `@sanity/document-internationalization` was rejected as over-engineered for our scale.                                                    | 5       |
| 2026-05-26 | **`page` doc stays generic** (no dedicated `aboutPage` singleton); `featuredTeamMembers?` + `ctaButtons?` added to give About-style pages structure without locking other generic pages.                    | Owner preference for maximum customization; Portable Text + a small set of opinionated optional fields gives more flexibility than a fixed singleton without crossing into anti-pattern page-builder territory (CLAUDE.md §2.4). | 5       |
| 2026-05-26 | **`testimonial` doc type included in Phase 1** with `source: 'manual'\|'google'\|'trustmary'` enum and `sourceUrl?`.                                                                                        | Native pipeline for editorial control; Google Reviews automated ingest remains out of scope.                                                                                                                                     | 5       |
| 2026-05-26 | **`service.responsibleVets` dropped.**                                                                                                                                                                      | Old sites do not surface vet-per-service; reference complexity not justified. Easy to add later (non-breaking).                                                                                                                  | 5       |
| 2026-05-26 | Resolves **OD-1**.                                                                                                                                                                                          | —                                                                                                                                                                                                                                | 12      |
