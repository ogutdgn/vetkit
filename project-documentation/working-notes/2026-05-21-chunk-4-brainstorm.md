# Chunk 4 — Sanity schema brainstorm snapshot (WIP)

> **⚠️ TEMPORARY FILE — DELETE WHEN CHUNK 4 SHIPS.**
>
> This file captures the in-progress brainstorm for the Sanity schema (Chunk 4) so the next session can resume cold. Once Chunk 4 is implemented and merged:
>
> 1. Promote the locked decisions to `CLAUDE.md` §12 (decision log).
> 2. The final schema design goes to `project-documentation/specs/2026-05-21-sanity-schema-design.md` (or whatever date it lands on).
> 3. **Delete this file** in the same commit that adds the final spec. Don't keep stale brainstorms in `working-notes/`.

---

## Where we are in the brainstorming flow

Per [`.claude/skills/`](../../.claude/skills/) the brainstorming skill expects: explore context → ask clarifying questions → propose approaches → present design → write spec → user reviews → invoke writing-plans.

**Status:**

- ✅ Context explored (CLAUDE.md §5, audit done)
- ✅ Clarifying questions answered (Sanity version, i18n, batch decisions)
- ✅ Approach proposed (Pattern B i18n + Sanity v4)
- ✅ Design overview presented in chat
- ⏸ **Paused here** — user wants to continue in next session
- ⏳ Next: convert overview into a full spec doc, self-review, user reviews, then `writing-plans` skill

---

## Locked decisions

These were confirmed in this session. **Do not re-litigate** without explicit reason — promote to CLAUDE.md §12 when Chunk 4 ships.

### Architecture-level

| Topic                             | Decision                                                                                                         | Reasoning                                                                                                                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sanity major version**          | **v4**                                                                                                           | v3 EOL approaching, v5 plugin ecosystem too young. v4 is the stable-bridge release with mature ecosystem and ~3 year lifetime. (Was OD-1.)                                                                                                                      |
| **i18n pattern**                  | **Field-level** (Pattern B) via custom `localeString` / `localeText` / `localeSlug` / `localePortableText` types | Multi-language is real requirement (TR + EN minimum). Pattern B = one doc, both languages visible, easier sync for small editorial teams. Pattern C (document-level via `@sanity/document-internationalization`) was rejected as over-engineered for our scale. |
| **Phase 1 locales**               | **TR + EN**                                                                                                      | Both new and existing clients in scope. Schema designed for these two; per-tenant `siteSettings.activeLocales` controls which are exposed to a given tenant's Studio + frontend.                                                                                |
| **Multi-tenant locale variation** | **Single unified schema, per-tenant `activeLocales` config**                                                     | One schema across all clients (CLAUDE.md §2.4 inviolable). Each tenant's Sanity project gets identical schema; `siteSettings.activeLocales` (e.g. `['tr']` or `['tr', 'en']`) drives what the editor sees + what the site renders.                              |
| **Editor locale filtering**       | `@sanity/language-filter` plugin                                                                                 | Reads `siteSettings.activeLocales` and hides inactive-locale fields. TR-only clinic doesn't see EN inputs.                                                                                                                                                      |
| **Freshness mechanism**           | On-demand revalidation via Sanity webhook → `/api/revalidate` → `revalidateTag(...)`                             | NOT time-based ISR (wasteful). NOT Sanity Live Content (overkill). On-demand webhook is canonical Next.js + Sanity pattern. Latency: ~1-3s after publish. (Belongs to Chunk 13 but strategy locked now.)                                                        |

### Schema-shape rules

| Topic                                      | Decision                                                                                                                                                                                                                                                                            |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Singleton enforcement** (`siteSettings`) | Custom desk structure in `apps/studio/structure/deskStructure.ts`. Document at fixed ID, `__experimental_actions` excludes create/delete from UI.                                                                                                                                   |
| **Slug strategy**                          | Per-locale `localeSlug` custom type. Auto-generate from `title[locale]` with Turkish→ASCII normalization (ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u, İ→i). Manual override allowed. Validation: kebab-case + unique within doc type per locale.                                                  |
| **Image alt text**                         | `alt: localeString` with `Rule.required()` on every image field. Editor can use empty string `""` for purely decorative images, but must consciously choose. A11y + KVKK/EU accessibility legal landscape.                                                                          |
| **Rich text policy** (per CLAUDE.md §5.5)  | Marks: `strong`, `em`, `link`. Block styles: `normal`, `h2`, `h3`, `blockquote`. **No h1** — page title is the h1. Implemented via `localePortableText` custom type.                                                                                                                |
| **Required vs optional**                   | Required only for "would break the site if empty": `title`, `slug`, `mainImage` (where applicable), `seo.metaTitle` (with title fallback), image `alt`. Everything else optional with sensible fallbacks (e.g. `seo.metaDescription` falls back to first 160 chars of description). |
| **Reference vs inline**                    | Case-by-case: `service.responsibleVets` → array of refs to `teamMember` (vet works multiple services). `blogPost.author` → ref to `teamMember`. `siteSettings.address` → inline (used once). `service.relatedFAQs` → array of refs to `faq` (FAQs reusable across services).        |

---

## Old-sites audit findings (summary)

Full audit performed by Explore agent on `old-sites/gigi-veteriner/` and `old-sites/ovapark-veteriner/`. Key inputs to schema:

**Common services (both sites, 6 entries):**

- 7/24 Acil (Emergency)
- Dahiliye, Cerrahi, Doğum ve Jinekoloji (Internal Medicine, Surgery, Obstetrics, Gynecology)
- Laboratuvar Hizmetleri (Lab Services)
- Röntgen ve Ultrasonografi
- Mama ve Pet Malzeme Satışı (Feed & Pet Supply Sales)
- Eve Aşı, Tedavi ve Mama Hizmetleri (Home Service)

**Ovapark-only:** Pansiyon Hizmeti (Boarding).

**Contact patterns:**

- Both: Turkish district address (Çankaya/Keçiören Ankara), +90 mobile, Gmail email, "TÜM GÜN" 24/7 working hours format
- Gigi: 2-3 socials (IG + Twitter placeholder), no embedded Maps
- Ovapark: 1 social (IG only), embedded Google Maps iframe

**Both sites prominently feature** "7/24 Acil" banner with click-to-call phone. → Drives `emergencyBanner` reusable object.

**Templated/placeholder content found** (these signal "the template authors expected these to exist" → schema should support them even though sparse in current sites):

- Team page disabled but template hooks exist
- Gallery page exists with placeholder items
- FAQ accordion structure ready
- Blog with author/date metadata

**Critical gaps in old sites that the schema should address** (forward-looking, validated as common needs):

- Vet bios (template was there, content missing) → `teamMember` doc type
- Granular hours (sites just say "TÜM GÜN") → `openingHours` with day-by-day + `isAlwaysOpen` flag
- Online appointment CTA (not present, common ask)
- Pricing visibility toggle (optional field)
- Multiple emergency phone numbers (sometimes different from main)

**Explicitly deferred (YAGNI for Phase 1):**

- `testimonial` doc type — Trustmary widget handles external reviews
- `product` doc type — feed/supply catalog overkill at 1-2 clients
- `vaccinationSchedule` — speculative
- Multi-location support — both sites single-location
- Before/after gallery — niche

---

## Design overview (compact)

### Folder layout

```
apps/studio/schemas/
├── objects/
│   ├── localeString.ts          # { tr, en } string
│   ├── localeText.ts            # { tr, en } long-form
│   ├── localeSlug.ts            # { tr: slug, en: slug }
│   ├── localePortableText.ts    # { tr: [...], en: [...] }
│   ├── seo.ts
│   ├── address.ts
│   ├── openingHours.ts
│   ├── socialLinks.ts
│   ├── cta.ts
│   ├── contactInfo.ts
│   └── emergencyBanner.ts
├── documents/
│   ├── service.ts
│   ├── blogPost.ts
│   ├── teamMember.ts
│   ├── faq.ts
│   ├── galleryImage.ts
│   └── page.ts
├── singletons/
│   └── siteSettings.ts
└── index.ts
apps/studio/structure/
└── deskStructure.ts             # Turkish menu + siteSettings singleton + orderable lists
apps/studio/sanity.config.ts     # structureTool + languageFilter + plugins
```

### 7 document types

| Type           | Plural (TR)      | Singleton? | Important fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------- | ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteSettings` | Klinik Bilgileri | ✓          | `clinicName` (localeString), `tagline?` (localeString), `logo` (image), `brandColor` (hex + name), `activeLocales` (['tr','en']), `defaultLocale`, `contact` (contactInfo), `address` (address), `openingHours`, `emergencyBanner`, `socialLinks`, `footerText?`, `footerLinks?` (cta[]), `defaultSeo` (seo), `vercelAnalyticsEnabled?` (bool)                                                                                                                                               |
| `service`      | Hizmetler        | ✗          | `title` (localeString, req), `slug` (localeSlug, req), `mainImage` (image, req, alt req), `icon?` (image), `shortDescription` (localeText, req), `description` (localePortableText, req), `petTypes?` (string enum array: dog/cat/bird/rabbit/exotic), `serviceLocation` (enum: in-clinic/home-call/both), `emergencyAvailable` (bool), `responsibleVets?` (ref[] → teamMember), `relatedFAQs?` (ref[] → faq), `pricing?` (localeString), `order` (number via orderable plugin), `seo` (seo) |
| `blogPost`     | Blog Yazıları    | ✗          | `title` (localeString, req), `slug` (localeSlug, req), `excerpt` (localeText, req), `body` (localePortableText, req), `coverImage` (image, req, alt req), `author` (ref → teamMember, req), `publishedAt` (datetime, req), `category?` (string enum), `tags?` (string[]), `relatedServices?` (ref[] → service), `relatedPosts?` (ref[] → blogPost), `seo` (seo)                                                                                                                              |
| `teamMember`   | Ekip             | ✗          | `name` (string, req, **not localized** — proper names), `title` (localeString, req, e.g. "Veteriner Hekim"), `slug` (slug, optional — for `/ekip/<name>` route if used), `photo` (image, alt req), `credentials?` (localeString[]), `specialties?` (string enum[]), `shortBio?` (localeText), `bio?` (localePortableText), `email?`, `phone?`, `socialLinks?`, `order` (number via orderable plugin)                                                                                         |
| `faq`          | SSS              | ✗          | `question` (localeString, req), `answer` (localePortableText, req), `category?` (string enum: genel/asilama/cerrahi/etc), `order` (number)                                                                                                                                                                                                                                                                                                                                                   |
| `galleryImage` | Galeri           | ✗          | `image` (image, req, alt req, hotspot), `caption?` (localeString), `category?` (string enum: klinik-ici/tedavi/ekip/hastalar), `order` (number)                                                                                                                                                                                                                                                                                                                                              |
| `page`         | Sayfalar         | ✗          | `title` (localeString, req), `slug` (localeSlug, req), `heroImage?` (image), `body` (localePortableText, req), `seo` (seo) — generic flexible (Hakkımızda, KVKK, etc.)                                                                                                                                                                                                                                                                                                                       |

### 11 reusable objects (key fields)

- `localeString` — `{ tr: string, en: string }`
- `localeText` — `{ tr: text, en: text }`
- `localeSlug` — `{ tr: slug, en: slug }` with auto-source from `title[locale]` + Turkish normalization
- `localePortableText` — `{ tr: blockContent, en: blockContent }` with restricted marks/blocks
- `seo` — `metaTitle?: localeString`, `metaDescription?: localeText`, `ogImage?: image+alt`, `noIndex?: bool`
- `address` — `street: localeString`, `district: string`, `city: string`, `postalCode?: string`, `country: string default 'TR'`, `googleMapsUrl?: url`, `coordinates?: { lat, lng }`
- `openingHours` — `isAlwaysOpen: bool`, `monday..sunday: { closed: bool, openTime?: time, closeTime?: time }`, `emergencyNote?: localeString`
- `socialLinks` — `instagram?: url`, `facebook?: url`, `x?: url`, `youtube?: url`, `tiktok?: url`, `whatsapp?: string (phone)`
- `cta` — `label: localeString`, `href: string`, `variant?: 'primary'|'secondary'|'ghost'`, `newTab?: bool`
- `contactInfo` — `primaryPhone: string`, `emergencyPhone?: string`, `whatsapp?: string`, `email: email`, `secondaryEmails?: email[]`
- `emergencyBanner` — `enabled: bool`, `text: localeString`, `phone: string`, `variant?: 'top'|'sticky'`

### Studio config snippet

```ts
// apps/studio/sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { languageFilter } from '@sanity/language-filter';
import { schemaTypes } from './schemas';
import { deskStructure } from './structure/deskStructure';

export default defineConfig({
  name: 'vetkit',
  title: process.env.SANITY_STUDIO_TITLE ?? 'vetkit Studio',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [
    structureTool({ structure: deskStructure }),
    languageFilter({
      supportedLanguages: [
        { id: 'tr', title: 'Türkçe' },
        { id: 'en', title: 'English' },
      ],
      defaultLanguages: ['tr'],
      documentTypes: ['service', 'blogPost', 'teamMember', 'faq', 'galleryImage', 'page'],
    }),
    // orderable-document-list to be added for service/teamMember/faq/galleryImage
  ],
  schema: { types: schemaTypes },
});
```

---

## Still-open discussion points

The user paused before fully approving the design. These are the items that may need a quick redirect when resuming:

1. **`service.pricing`** — field is in schema as optional `localeString`. Does the editor show this on cards or detail pages in Phase 1? (Frontend question, doesn't block schema.)
2. **`page` vs dedicated singletons** — `page` is intentionally generic. Should "Hakkımızda" be a dedicated singleton instead, with richer fields (mission, team intro, history)? Or stay as a `page` document?
3. **`teamMember.name` non-localized** — proper names usually aren't translated, but some clinics may want "Dr. X" / "Vet. X" prefix differ per locale. Current decision: name is plain string, `title` field handles localized prefix. Confirm.
4. **`emergencyBanner` location** — currently inside `siteSettings`. Should it be a separate doc to allow per-page override (e.g. blog post emergency ad)? Probably overkill — confirm staying in `siteSettings`.
5. **`testimonial` Phase 1 inclusion** — currently excluded (Trustmary handles externally). Confirm exclusion, or add as Phase 1 anticipating future migration off Trustmary.
6. **`service.responsibleVets` necessity** — adds reference complexity. Does the frontend actually show "this service performed by Dr. X"? If not, remove and simplify.

---

## Next session resume protocol

When picking up:

1. Read this file in full.
2. Decide on the 6 open points above (quick yes/no for each).
3. Promote design overview into a final spec at `project-documentation/specs/2026-05-21-sanity-schema-design.md` (or current date).
4. Self-review the spec (placeholders, contradictions, scope, ambiguity).
5. Wait for user review.
6. On approval: invoke `superpowers:writing-plans` skill to draft the implementation plan.
7. Implementation begins per Chunk 4 commit split in [`execution-map.md`](../execution-map.md) §1.
8. **When Chunk 4 ships**: delete this brainstorm file (this is the cleanup step).
