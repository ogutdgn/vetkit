# R4 — apps/web: swap Sanity → Supabase (public site read layer)

> **Status:** plan (2026-06-15). Consolidates four area maps into one ordered migration.
> **Scope:** `apps/web` only — repoint every read from Sanity (GROQ + `next-sanity` +
> `urlFor` + Portable Text) onto Supabase (`@vetkit/db` anon client + RLS published-only +
> Storage URLs + Tiptap-JSON renderer). The data model (R1, shipped) and admin (R2/R3) are
> upstream of this; the contact form (Resend) is a later chunk.
> **Source of truth for tables/columns:** `packages/db/supabase/migrations/20260614120200_content_tables.sql`
> and the narrowed Row types in `packages/db/src/database.types.ts`. The data-model spec is
> [`2026-06-14-supabase-data-model.md`](2026-06-14-supabase-data-model.md).
>
> **Guiding rule:** keep the build green at every step. The Sanity layer (`lib/sanity/*`,
> `types/sanity.ts`, `@vetkit/sanity-types`, `next-sanity`) stays installed until the swap
> compiles and runs end-to-end; only then does Section 7's removal run.

---

## 0. Ground truth (verified against the repo)

- **DB tables exist** (R1): `site_settings`, `hero_slides`, `services`, `faqs`, `blog_posts`,
  `team_members`, `gallery_images`, `pages`, `testimonials`, `submissions`, `media`, plus the
  four junctions (`service_related_faqs`, `blog_post_related_services`,
  `blog_post_related_posts`, `page_featured_team_members`).
- **Clients exist** (`packages/db/src/client.ts`): `createAnonClient()` (publishable key, RLS) and
  `createServiceRoleClient()` (server-only). `@vetkit/db` exports `Tables<T>`, `Enums<T>`, `Json`,
  the Zod value-object schemas, and the narrowed `Database`.
- **jsonb is already narrowed** (`database.types.ts`): `site_settings.contact/address/opening_hours/
social_links/emergency_banner/footer_links/default_seo`, `hero_slides.cta`, `*.description/body/
answer/content` (`TiptapDoc`), `pages.cta_buttons`, `team_members.bio/social_links`. **No runtime
  Zod validation needed at the read boundary** — the compile-time narrowing is the contract. (Add
  defensive `safeParse` only if a field proves dirty in practice; not in R4 scope.)
- **Tiptap extensions already shared-ish** (`apps/admin/lib/editor/extensions.ts`): a single
  `editorExtensions` const (StarterKit, heading [2,3], link config, no code/codeBlock/hr/strike).
  The header comment already says "(later, R4) the public renderer" imports it — but it lives in
  `apps/admin`, which `apps/web` must not import from. **Section 2 moves it into `@vetkit/db`.**
- **SEO reality differs from the area maps.** The DB has **no `seo` jsonb object** on content rows.
  `services`/`blog_posts`/`pages` carry **flat** columns `meta_title`, `meta_description`,
  `og_image_id` (FK→media), `no_index`. `site_settings.default_seo` IS jsonb (`Seo`), and the Zod
  `Seo` schema has **only** `metaTitle/metaDescription/noIndex` — **no `ogImage`**. So the current
  `metadata.ts` `ogImageOf(seo.ogImage)` path has no DB equivalent for `default_seo`; the OG image
  for a page comes from its own `og_image_id`, and the sitewide fallback is the dynamic
  `app/opengraph-image.tsx`. **This is a real behavior change to encode, not a 1:1 swap.**
- **Sanity import sites to convert (25 files):** all 11 `(marketing)` files (10 pages + layout),
  6 metadata routes (`sitemap`, `manifest`, `opengraph-image`, `icon`, `apple-icon`; `robots` is
  Sanity-free), `lib/seo/metadata.ts`, `lib/seo/schema.ts`, both `components/shared/*`, all
  Sanity-typed `templates/modern/*`, `types/template.ts`, `types/sanity.ts`, and `lib/sanity/*`.
- **`.env.example` already has** `TENANT_SLUG`, `TENANT_ID`, the Supabase vars, and Sanity vars
  commented out as LEGACY. Section 8 finishes that.

---

## 1. New `apps/web/lib/db/*` read layer

### 1.1 `lib/db/client.ts` — tenant-scoped anon client + `tenantTable`

- Re-export `createAnonClient` from `@vetkit/db`, OR create a thin module that builds one anon
  client and exposes `tenantTable(name)`.
- `TENANT_ID` comes from `process.env.TENANT_ID` (uuid, build-time per Vercel project). Fail loudly
  in production if missing (mirror `metadata.ts`'s `NEXT_PUBLIC_SITE_URL` guard). `TENANT_SLUG` is
  informational/onboarding only — the **queries scope by `TENANT_ID`**.
- `tenantTable(name)` is the non-negotiable security helper (spec §6): every read goes through it so
  no query can forget `.eq('tenant_id', TENANT_ID)`:
  ```ts
  export function tenantTable<T extends keyof Database['public']['Tables']>(name: T) {
    return createAnonClient().from(name).eq('tenant_id', requireTenantId());
  }
  ```
  (Confirm chaining `.from(...).eq(...)` returns a builder the query functions can extend — verify
  against the installed `@supabase/supabase-js` `2.108.x`; adjust to a closure if the fluent shape
  fights the generated types.)
- **Owner decision — fetch-per-request vs cache:** Next dedupes identical `fetch`-based calls within
  one render, but supabase-js uses its own transport, so dedup is NOT automatic. `site_settings` is
  read by `layout.tsx` (`generateMetadata` + `generateViewport` + the component) AND
  `(marketing)/layout.tsx` AND several pages. Options: (a) wrap `getSiteSettings()` in React
  `cache()` so it runs once per request; (b) accept N round-trips. **Recommend (a)** — small change,
  removes 3–5 redundant queries per render. Flagged as a decision because it adds a `cache()` import
  pattern across the layer.

### 1.2 `lib/db/queries.ts` — typed projections, one function per template need

Each function returns a typed projection (not a raw row dump) mirroring the old GROQ projections so
template props barely change. Naming mirrors the maps' `fetch*`/`get*`. All filter
`status='published'` except the always-live config tables (`site_settings`, `hero_slides`). All
list queries `.order('sort_order', { ascending: true })` (was `orderRank`); blog lists order
`published_at` desc.

| Function                  | Table + select (abbrev.)                                                                                                                                                                                                                                                    | Notes                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| `getSiteSettings()`       | `site_settings.select('*')` `.maybeSingle()`                                                                                                                                                                                                                                | singleton; no status filter. Wrap in `cache()`. Returns `Tables<'site_settings'>                                  | null`. |
| `getHeroSlides()`         | `hero_slides.select('*, media:media(*)')` order `sort_order`                                                                                                                                                                                                                | always-live; **join media** so `media_id`→URL.                                                                    |
| `getServicesList()`       | `services.select('id,title,slug,short_description,main_image:media(*),icon:media(*),pet_types,service_location,emergency_available,pricing')`                                                                                                                               | cards.                                                                                                            |
| `getServiceBySlug(slug)`  | step 1 `select('id').eq('slug',slug).maybeSingle()`; step 2 `select('*, main_image:media(*), icon:media(*), related_faqs:service_related_faqs(position, faq:faqs(id,question,answer,category)) order(position)')`                                                           | OD-5 two-step preserved (keeps `id`-based revalidation stable across slug renames). `description` is `TiptapDoc`. |
| `getServiceSlugs()`       | `services.select('slug')`                                                                                                                                                                                                                                                   | `generateStaticParams`.                                                                                           |
| `getBlogPostsList()`      | `blog_posts.select('...cover_image:media(*), author:team_members(id,name,title)')` order `published_at` desc                                                                                                                                                                | author via FK join.                                                                                               |
| `getHomeBlogPosts()`      | same as list + `.limit(4)`                                                                                                                                                                                                                                                  | GROQ `[0...4]` → `.limit(4)`.                                                                                     |
| `getBlogPostBySlug(slug)` | step 1 id; step 2 `select('*, cover_image:media(*), author:team_members(id,name,title), related_services:blog_post_related_services(position, service:services(id,title,slug)) , related_posts:blog_post_related_posts(position, related_post:blog_posts(id,title,slug))')` | `body` is `TiptapDoc`. Flatten junctions post-fetch.                                                              |
| `getBlogPostSlugs()`      | `blog_posts.select('slug')`                                                                                                                                                                                                                                                 | static params.                                                                                                    |
| `getTeamMembersList()`    | `team_members.select('id,name,title,slug,photo:media(*),specialties,short_bio')`                                                                                                                                                                                            | **no status filter present in old query** (`*[_type=="teamMember"]`). Decision below.                             |
| `getFaqsList()`           | `faqs.select('id,question,answer,category')` order `sort_order`                                                                                                                                                                                                             | `answer` is `TiptapDoc`.                                                                                          |
| `getGalleryImages()`      | `gallery_images.select('id, caption, category, media:media(id,bucket_path,alt,width,height,focal_x,focal_y)')` order `sort_order`                                                                                                                                           | **must join media** (component needs the row).                                                                    |
| `getPageBySlug(slug)`     | step 1 id; step 2 `select('*, hero_image:media(*), featured_team_members:page_featured_team_members(position, team_member:team_members(id,name,title,slug,photo:media(*),specialties,short_bio)) order(position)')`                                                         | `body` is `TiptapDoc`, `cta_buttons` is `Cta[]`.                                                                  |
| `getSitemapEntries()`     | three parallel `Promise.all` selects of `slug, updated_at` from `services`/`blog_posts`/`pages`                                                                                                                                                                             | combine into `{ services, posts, pages }`.                                                                        |

- **Junction flattening:** Supabase nested selects come back as `{ position, faq: {...} }[]`; expose a
  helper or map in the query function so pages receive `relatedFaqs: Faq[]` already flattened and
  position-sorted, matching the old GROQ-array shape the components expect.
- **Type exports:** export a result type alias per function (e.g. `export type ServiceCard =
Awaited<ReturnType<typeof getServicesList>>[number]`) so `types/template.ts` (Section 4) imports
  these instead of `@vetkit/sanity-types` query-result types.
- **Owner decision — `team_members` status:** the legacy GROQ fetched ALL team members (no
  `defined(slug)`, no status), but the DB has a `status` column. **Recommend** filtering
  `status='published'` for consistency (anon RLS enforces it anyway), but confirm so unpublished
  staff don't surprise the owner by appearing.
- **No `lib/db/live.ts` and no draft mode.** The public site is anon + published-only; `draftMode()`
  disappears entirely (draft preview belongs to admin, R2/R3). Query functions return
  `Promise<T>` directly — no fetch wrapper, no `tags` param. Revalidation moves to a publish webhook
  (Section 1.3) and is **out of R4 read scope**.

### 1.3 Revalidation (note, not built in R4)

The OD-5 tag concept survives but its plumbing changes: on publish, admin (R2/R3) calls a public
`/api/revalidate` route or a Supabase DB webhook fires → `revalidateTag`/`revalidatePath`. **R4 does
not implement the webhook.** To keep pages fresh during R4, rely on time-based revalidation or
`dynamic`/`revalidate` route segment config. A `lib/db/tags.ts` (`db:<table>:<id>` /
`db:<table>:list`) can be stubbed for the future webhook but is not load-bearing for the read swap.
**Flag:** decide R4-interim freshness strategy (ISR `revalidate` seconds vs fully dynamic) with the
owner.

---

## 2. Shared Tiptap extensions + server-side renderer

### 2.1 One source of truth — move extensions into `@vetkit/db`

- **Problem:** `editorExtensions` lives in `apps/admin/lib/editor/extensions.ts`. `apps/web` cannot
  import across apps.
- **Recommendation:** move it to **`packages/db/src/editor-extensions.ts`** and export from the
  package index (`@vetkit/db` already houses `TiptapDoc` and the Zod schemas, so the rich-text
  contract belongs there — no new package needed). `apps/admin` re-imports from `@vetkit/db`
  (its `extensions.ts` becomes a one-line re-export, or its import path updates). `apps/web`
  imports the same const for rendering. This guarantees the editor and renderer use one ruleset so
  stored JSON round-trips identically.
- **Dependency move:** `@tiptap/starter-kit` (and `@tiptap/pm`, `@tiptap/core` as needed by the
  renderer) currently sit in `apps/admin`. Add the runtime-needed Tiptap packages to
  `packages/db` `dependencies` (the extensions const needs `@tiptap/starter-kit`). Verify peer-dep
  alignment with the admin's `^3.26.1`.
- **Alternative (heavier, rejected for now):** a dedicated `packages/editor`. Overkill at this scale;
  `@vetkit/db` is already the shared content contract.

### 2.2 Server-side Tiptap JSON → HTML renderer

- **New module:** `packages/db/src/tiptap-renderer.ts` exporting
  `renderTiptapToHtml(doc: TiptapDoc | null): string` (returns `''` for null).
- **Library:** the area maps flag `@tiptap/static-renderer` as the likely package but **unverified**.
  **Action before coding:** verify the live package + API (renderer entry point and signature) at
  npm/Tiptap docs against the installed Tiptap 3.x. Candidates to confirm: `@tiptap/static-renderer`
  (`renderToHTMLString` from `@tiptap/static-renderer/pm/html-string`) vs `generateHTML` from
  `@tiptap/html`. Pick the one that runs in a Node/RSC server context with **no DOM**.
- **Styling parity:** the old `PortableTextRenderer` applied Tailwind classes per block
  (`mt-4 leading-relaxed text-ink-700` for `p`, `mt-10 text-2xl font-bold ... text-ink-900` for h2,
  `border-l-4 border-brand-300` for blockquote, list classes, link `text-brand-700 underline`).
  Two options to reproduce:
  1. Configure `HTMLAttributes: { class: '...' }` on each extension in the shared config so the
     emitted HTML already carries the classes. **Risk:** the same classes would then also appear in
     the admin editor UI — may be fine or undesirable. **Flag for decision.**
  2. Render plain semantic HTML, wrap output in a `.prose`-style scoped stylesheet
     (`globals.css`) that maps `.tiptap-content h2 { ... }` etc. This keeps editor styling separate
     from public styling. **Recommended** — cleaner separation, no token classes baked into stored
     config; but it introduces one scoped CSS block (allowed: it's a token-driven content style, not
     a custom per-component CSS file).
- **Renderer component:** `packages/db/src/tiptap-renderer.tsx` exporting
  `<TiptapRenderer value={doc} />` that returns `null` for empty docs and otherwise
  `<div className="tiptap-content" dangerouslySetInnerHTML={{ __html: renderTiptapToHtml(value) }} />`.
  HTML + `dangerouslySetInnerHTML` is acceptable here (content is admin-authored, trusted). Walking
  the node tree to emit `next/link` etc. is out of scope (links use the StarterKit `target`/`rel`).
- **Delete** `apps/web/components/shared/PortableTextRenderer.tsx` only after every consumer
  (service detail `description`, blog `body`, FAQ `answer`, page `body`) imports `TiptapRenderer`.

---

## 3. Supabase Storage image helper (replaces `urlFor`)

### 3.1 `lib/db/image.ts`

- **New helper:** `getImageUrl(media, opts?)` where `media` is the joined media row
  (`{ bucket_path, focal_x, focal_y, ... }`) and `opts` is `{ width?, height?, quality?, format? }`.
  ```ts
  export function getImageUrl(
    media: Pick<Tables<'media'>, 'bucket_path'>,
    opts?: { width?: number; height?: number; quality?: number; format?: 'origin' | 'webp' },
  ): string;
  ```
  Implementation: `createAnonClient().storage.from(BUCKET).getPublicUrl(bucket_path, { transform: { width, height, quality, ... } })` → `data.publicUrl`. **Verify** the exact `getPublicUrl`
  transform options against the installed `@supabase/supabase-js`/`storage-js` (the maps offer two
  conflicting URL formats — query-string `?width=..` vs `?transform=resize,..`; the supabase-js
  `transform` option object is the supported path — confirm before coding).
- **Bucket name:** the migration created a single bucket literally named **`media`** (public). The
  area maps speculate `media-{env}` (per-environment buckets) — that does **not** match the shipped
  migration. Use `'media'` unless R1 is amended. **Flag:** confirm bucket-per-env is not happening,
  or thread an env var.
- **Focal point → CSS:** export `focalObjectPosition(media)` →
  `` `${(media.focal_x ?? 0.5) * 100}% ${(media.focal_y ?? 0.5) * 100}%` `` for use as
  `style={{ objectPosition }}` on `next/image` with `object-cover`. (Storage transforms are
  resize-only — no art-directed crop — so the hotspot equivalent is purely CSS.)
- **`alt` source of truth:** the `media` row carries `alt`. Components read `media.alt ?? ''`.
  (Per-doc alt override is a future admin concern, not R4.)

### 3.2 `next/image` `remotePatterns`

- `next.config.ts` currently whitelists `cdn.sanity.io`. **Replace** with the Supabase Storage host:
  `{ protocol: 'https', hostname: '<project-ref>.supabase.co', pathname: '/storage/v1/object/public/**' }`.
  The host varies per environment but the project ref is stable per Supabase project; derive it from
  `NEXT_PUBLIC_SUPABASE_URL`'s hostname (can't read env in the static config object directly — either
  hardcode the project-ref host or compute via a small `new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname`
  in `next.config.ts`, which runs in Node at build).
- **Owner decision — image optimization:** Supabase Storage already does its own resize transforms.
  Running them through Next's `/_next/image` optimizer too means **double processing** + Vercel image
  optimization cost. Options: (a) keep `next/image` and add `remotePatterns` (optimizer re-encodes
  the already-transformed image); (b) keep `next/image` but pass `unoptimized` for Storage images and
  rely on Storage transforms (the maps lean here); (c) use plain `<img>` for Storage. **Recommend
  (b)** to avoid double cost while keeping the `next/image` ergonomics (sizes, lazy). Flagged because
  it changes how every `<Image>` is configured.

---

## 4. Re-typed template contract (`types/template.ts`) + modern component changes

### 4.1 `types/template.ts`

- Replace `@/types/sanity` imports with `@vetkit/db` `Tables<...>` and the query-result aliases from
  `lib/db/queries.ts`.
- `SiteSettings` → `Tables<'site_settings'>` (already non-null-shaped; pages still null-check before
  render).
- `ServiceCardData` → the `getServicesList()` element type (image fields are joined `media` rows).
- `BlogCardData` → `getBlogPostsList()` element type (`author` is the joined `team_members` subset).
- `TeamMemberData` → `getTeamMembersList()` element type.
- `HeroSlideData` → the `getHeroSlides()` element type (`{ ..., media: Tables<'media'> | null, cta:
Cta | null }`). **The `_key` field is gone** (Supabase rows have `id`). See 4.2.
- **Drop `SanityImageWithAlt`.** Introduce a small `MediaImage = Tables<'media'>` (or the joined
  subset) used wherever a component needs to render an image. `HeroProps.media?` becomes
  `MediaImage | null` and `cta?` stays `{ label; href }` (or reuse `Cta`).
- `ThemeComponents`, `HeaderProps`, `FooterProps`, `ServiceCardProps`, `BlogCardProps`,
  `TeamSectionProps`, `NavItem` keep their names/shapes (contract stability) — only the underlying
  data types change.

### 4.2 Per-component changes (`templates/modern/*`)

| Component          | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Header.tsx`       | `settings.clinicName`→`clinic_name`; `settings.logo` (image) → `settings.logo_media_id` + a joined logo media row (pass the logo media row into the component, or have the page resolve `getImageUrl(logoMedia)`); `settings.contact.primaryPhone`→`settings.contact.primaryPhone` (jsonb Zod `Contact` — unchanged key casing, it's a JS object); `settings.emergencyBanner`→`settings.emergency_banner`. Replace `urlFor(logo)` with `getImageUrl(...)`. |
| `Hero.tsx`         | `media` prop → `MediaImage`; `slides` → `getHeroSlides()` rows. Replace `urlFor`.                                                                                                                                                                                                                                                                                                                                                                          |
| `HeroCarousel.tsx` | **`slide._key` → `slide.id`** (two `key={}` sites + the dots map). `slide.image.asset ?` guard → `slide.media ?`. `urlFor(slide.image).width(1920).height(1080).url()` → `getImageUrl(slide.media, { width: 1920, height: 1080 })`. `slide.image.alt` → `slide.media?.alt ?? ''`. `slide.heading/subheading/cta` are columns (unchanged).                                                                                                                  |
| `ServiceCard.tsx`  | `service.title`/`slug` unchanged; `service.mainImage`→`service.main_image` (joined media); `service.shortDescription`→`service.short_description`; `service.petTypes`→`service.pet_types`; `service.emergencyAvailable`→`service.emergency_available`; `service.pricing` unchanged. Replace `urlFor`. `PET_LABELS` mapping logic unchanged.                                                                                                                |
| `BlogCard.tsx`     | `post.coverImage`→`post.cover_image` (joined media); `post.publishedAt`→`post.published_at`; `post.author?.name` (joined `team_members`) unchanged shape; `post.category`/`tags` unchanged. Replace `urlFor`. Date formatting unchanged (`published_at` is ISO timestamptz).                                                                                                                                                                               |
| `TeamSection.tsx`  | `member.photo`→`member.photo` (joined media via alias) or `photo_media_id`; `member.shortBio`→`member.short_bio`; `specialties` unchanged. Replace `urlFor`.                                                                                                                                                                                                                                                                                               |
| `Footer.tsx`       | `settings.clinicName`→`clinic_name`; `logo`→`logo_media_id`/joined media; `footerText`→`footer_text`; `footerLinks`→`footer_links` (`Cta[]`); `socialLinks`→`social_links`; `address`/`contact`/`openingHours`→`address`/`contact`/`opening_hours` (jsonb objects — inner keys keep camelCase per Zod schemas: `primaryPhone`, `googleMapsUrl`, `isAlwaysOpen`, etc.). Replace `urlFor`.                                                                   |
| `MobileNav.tsx`    | **No change** — consumes hardcoded `navItems` only.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `index.ts`         | No change (re-exports the six components).                                                                                                                                                                                                                                                                                                                                                                                                                 |

> **Casing gotcha to enforce everywhere:** top-level DB **columns are snake_case**
> (`clinic_name`, `short_description`, `published_at`, `cover_image`), but **jsonb value-object
> inner keys stay camelCase** because they're typed by the Zod schemas (`contact.primaryPhone`,
> `address.googleMapsUrl`, `openingHours.isAlwaysOpen`, `cta.newTab`). Do not snake-case the jsonb
> innards.

---

## 5. Per-page swap list

All pages: `createAnonClient()` via the `lib/db/queries.ts` functions; null-check the singleton and
detail rows; `getTemplate()` (`lib/template.ts`) is **unchanged**; `lib/navigation.ts` is
**unchanged** (hardcoded).

| File                                        | Swap                                                                                                                                                                                                                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`                            | `siteSettingsQuery`→`getSiteSettings()`. `buildRootMetadata(settings)`, `brandStyleVars(settings.brand_color_hex)`, viewport theme color, JSON-LD all read snake_case columns. Wrap settings fetch in `cache()` (1.1 decision).                                                          |
| `app/(marketing)/layout.tsx`                | `getSiteSettings()` → pass to `Header`/`Footer`. Resolve logo media URL here or pass the media row.                                                                                                                                                                                      |
| `app/(marketing)/page.tsx` (home)           | `Promise.all([getSiteSettings(), getServicesList(), getHomeBlogPosts(), getTeamMembersList(), getGalleryImages()])`. Hero slides via `getHeroSlides()` (or include in the settings/home bundle). All image renders via `getImageUrl`. Quick-info/map/why-us read settings jsonb objects. |
| `app/(marketing)/hakkimizda/page.tsx`       | `getPageBySlug('hakkimizda')` (OD-5 two-step folded into the function). `body` via `TiptapRenderer`. `cta_buttons` (`Cta[]`). `featured_team_members` flattened. `generateMetadata` from page row's flat `meta_*`/`og_image_id`/`no_index`.                                              |
| `app/(marketing)/hizmetler/page.tsx`        | `getServicesList()`. `generateMetadata` from settings.                                                                                                                                                                                                                                   |
| `app/(marketing)/hizmetler/[slug]/page.tsx` | `getServiceBySlug(slug)`; `generateStaticParams` → `getServiceSlugs()`. `description` via `TiptapRenderer`; `related_faqs` flattened (each `answer` via `TiptapRenderer`). `generateMetadata` from flat `meta_*`/`og_image_id`.                                                          |
| `app/(marketing)/blog/page.tsx`             | `getBlogPostsList()`.                                                                                                                                                                                                                                                                    |
| `app/(marketing)/blog/[slug]/page.tsx`      | `getBlogPostBySlug(slug)`; `generateStaticParams`→`getBlogPostSlugs()`. `body` via `TiptapRenderer`; related services/posts flattened. `generateMetadata` from flat fields.                                                                                                              |
| `app/(marketing)/sss/page.tsx`              | `getFaqsList()`; group by `category` in JS (unchanged); each `answer` via `TiptapRenderer`.                                                                                                                                                                                              |
| `app/(marketing)/galeri/page.tsx`           | `getGalleryImages()` (media joined) → `ImageGallery`.                                                                                                                                                                                                                                    |
| `app/(marketing)/iletisim/page.tsx`         | `getSiteSettings()`; read `contact`/`address`/`opening_hours` jsonb. (Contact-form POST is a later chunk — leave any form stub as-is.)                                                                                                                                                   |

**SEO / metadata helpers + file routes:**

| File                      | Swap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `lib/seo/metadata.ts`     | Drop `urlFor` import. `buildRootMetadata(settings)` reads `settings.clinic_name`, `settings.tagline`, `settings.default_seo` (`Seo`: `metaTitle/metaDescription/noIndex` — **no ogImage**, so root OG falls back to the dynamic `app/opengraph-image.tsx`). Rework `ogImageOf` to take a **media row** (from a page's `og_image_id`) → `getImageUrl(media, { width: 1200, height: 630 })`, used by `buildPageMetadata`. Page input type changes from Sanity `Seo` to flat `{ metaTitle?, metaDescription?, ogImage?: MediaImage | null, noIndex? }`. |
| `lib/seo/schema.ts`       | Drop `urlFor`. `buildVeterinaryCareJsonLd(settings)` reads `clinic_name`, `tagline`, `address`/`contact`/`opening_hours`/`social_links` jsonb (inner camelCase keys unchanged), and the logo via a resolved media URL (`getImageUrl(logoMedia, { width: 512 })`) — pass logo media in or resolve inside. Opening-hours spec logic unchanged.                                                                                                                                                                                    |
| `app/sitemap.ts`          | `sitemapEntriesQuery`→`getSitemapEntries()` (3 parallel queries). `_updatedAt`→`updated_at` (already ISO). Static routes + dedup logic unchanged.                                                                                                                                                                                                                                                                                                                                                                               |
| `app/manifest.ts`         | `getSiteSettings()` → `clinic_name`, `brand_color_hex`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `app/opengraph-image.tsx` | `getSiteSettings()` → `clinic_name`, `tagline`, `brand_color_hex`.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `app/icon.tsx`            | `getSiteSettings()` → `clinic_name`, `brand_color_hex`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `app/apple-icon.tsx`      | `getSiteSettings()` → `clinic_name`, `brand_color_hex`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `app/robots.ts`           | **No change** (env-only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

**Shared components:**

| File                                         | Swap                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/shared/ImageGallery.tsx`         | Props `Tables<'gallery_images'>[]` with joined `media`. `item.image.asset` guard → `item.media`; `urlFor(item.image).width(800).height(600).url()`→`getImageUrl(item.media, {width:800,height:600})`; `item.image.alt`→`item.media?.alt ?? ''`; `item.caption`/`category` unchanged. Optionally add `style={{ objectPosition: focalObjectPosition(item.media) }}`. `CATEGORY_LABELS` unchanged. |
| `components/shared/PortableTextRenderer.tsx` | **Delete** after all consumers use `TiptapRenderer` (Section 2.2).                                                                                                                                                                                                                                                                                                                              |

---

## 6. `branding.ts` re-point

- **Logic unchanged** — `brandStyleVars(hex)` / `hexToOklch` stay byte-for-byte.
- **Only the input source changes:** callers pass `settings.brand_color_hex` instead of
  `settings.brandColor.hex`. `brand_color_hex` is nullable; `brandStyleVars(undefined)` already
  returns `{}` (template `tokens.css` defaults apply). One-line change at each call site
  (`app/layout.tsx`). No edit to `lib/branding.ts` itself.

---

## 7. Sanity REMOVAL list + safe order

**Remove only after the swap builds green and the dev server renders every route** (Step 12 below).

Files / dirs to delete:

- `apps/web/lib/sanity/` (`client.ts`, `image.ts`, `live.ts`, `queries.ts`, `tags.ts`).
- `apps/web/types/sanity.ts`.
- `apps/web/components/shared/PortableTextRenderer.tsx`.
- `apps/studio/` (entire app — Studio is dead under Supabase).
- `packages/sanity-types/` (entire package).

Dependencies to drop:

- `apps/web/package.json`: `next-sanity`, `@sanity/image-url`, `@vetkit/sanity-types`.
  **Add:** `@vetkit/db` (`workspace:*`); add the Tiptap renderer deps if the renderer lives in
  `@vetkit/db` they come transitively, else add to web.
- Root: any `sanity` / `@sanity/*` workspace deps, the `typegen` script(s)
  (`pnpm --filter @vetkit/studio typegen`), and Sanity entries in `turbo.json` / CI.
- `apps/studio` removal also drops `sanity`, `@sanity/*`, `styled-components`, etc.

GROQ / typegen artifacts:

- Delete `packages/sanity-types/generated.ts`, `schema.json`, and the typegen pipeline.
- Remove `defineQuery`/GROQ strings (gone with `lib/sanity/queries.ts`).

Env (see Section 8) — remove the commented Sanity block last.

**Safe order:** (a) confirm zero remaining imports of `@/lib/sanity`, `@/types/sanity`,
`next-sanity`, `@sanity/image-url`, `@vetkit/sanity-types`, `PortableTextRenderer`
(`grep -rn` over `apps/web`); (b) delete the `apps/web` Sanity files + `types/sanity.ts` +
`PortableTextRenderer`; (c) drop the `apps/web` deps and `pnpm install`; (d) typecheck + build web;
(e) remove `apps/studio` + `packages/sanity-types` + root Sanity deps/scripts; (f) `pnpm install`,
full `turbo build`; (g) strip the LEGACY Sanity env block.

---

## 8. Env changes

`.env.example` already has the Supabase block and `TENANT_SLUG`/`TENANT_ID` (uncomment-ready) and a
commented LEGACY Sanity block. Final state:

- **Keep / rely on:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon read
  path), `TENANT_ID` (data-layer scoping — **load-bearing**, fail loudly if missing in prod),
  `TENANT_SLUG` (onboarding/informational), site-identity vars, `TEMPLATE`, Resend vars (future
  chunk). `SUPABASE_SERVICE_ROLE_KEY` is **not** used by the public read path (admin/seed only) —
  document that it is not required for `apps/web` runtime.
- **Remove (after Section 7):** the four commented Sanity vars
  (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`,
  `SANITY_REVALIDATE_SECRET`) and the "Sanity (LEGACY…)" comment block.
- Update CLAUDE.md §8 env list once removed (decision-log discipline).

---

## 9. Ordered, build-green steps

Each step compiles where possible; Sanity stays installed until Step 11.

1. **Foundation, no consumers (green):** add `editor-extensions.ts` + `tiptap-renderer.{ts,tsx}` to
   `packages/db` (after verifying the Tiptap render API live); add the Tiptap dep to `@vetkit/db`;
   point `apps/admin` at the moved const. Add `@vetkit/db` to `apps/web` deps; `pnpm install`.
   Typecheck `@vetkit/db` + `apps/admin`.
2. **`lib/db/client.ts`** — `tenantTable` + `requireTenantId` + (decision) `getSiteSettings` `cache()`
   wrapper scaffold. Unused yet → green.
3. **`lib/db/image.ts`** — `getImageUrl` + `focalObjectPosition` (verify Storage transform API live).
   Unused → green.
4. **`lib/db/queries.ts`** — all query functions + exported result-type aliases. Unused → green.
5. **`next.config.ts`** — swap `remotePatterns` to the Supabase Storage host (image-optimization
   decision applied). Green.
6. **`types/template.ts`** — re-type against `@vetkit/db` + `lib/db` result types. **This breaks
   `templates/modern/*` and any consumer** → do Step 7 in the same change to restore green.
7. **`templates/modern/*` + `components/shared/ImageGallery.tsx`** — apply Section 4.2 field renames,
   `urlFor`→`getImageUrl`, `_key`→`id`. Typecheck the templates barrel.
8. **`lib/seo/metadata.ts` + `lib/seo/schema.ts`** — re-point to settings columns + media-row OG
   helper; drop `urlFor`.
9. **Pages + metadata routes (Section 5)** — convert all `(marketing)` pages, `layout.tsx`s,
   `sitemap`/`manifest`/`opengraph-image`/`icon`/`apple-icon`. Swap `PortableTextRenderer`→
   `TiptapRenderer` at the four rich-text consumers. After this step nothing imports `lib/sanity`.
10. **`branding.ts` call sites** — pass `brand_color_hex` (logic file untouched).
11. **Verify green:** `pnpm --filter @vetkit/web typecheck` + `build`; run dev server against a
    seeded tenant; click every route (home, hizmetler + detail, blog + detail, hakkimizda, sss,
    galeri, iletisim) + check OG/icon/sitemap/manifest. Confirm `grep` shows zero Sanity imports in
    `apps/web`.
12. **Removal (Section 7) + env cleanup (Section 8)** — delete Sanity files/apps/packages/deps in the
    safe order; `pnpm install`; full `turbo build`; strip LEGACY env. Update CLAUDE.md §8 +
    decision log + plan.md (R4 done).

---

## 10. Decisions needed from the owner

1. **Public read path:** anon key + RLS published-only (spec §6 recommended, residual: cross-tenant
   _published_ read possible) vs service-role + `tenantTable` strict isolation. Plan assumes anon.
2. **`next/image` for Storage:** double-optimize via Next vs `unoptimized` + Storage transforms vs
   plain `<img>`. Plan recommends `unoptimized` + Storage transforms.
3. **`site_settings` fetched once per request:** wrap `getSiteSettings()` in React `cache()`
   (recommended) vs accept N supabase-js round-trips.
4. **Tiptap renderer styling:** classes baked into shared extension `HTMLAttributes` (leaks into
   admin editor UI) vs a scoped `.tiptap-content` stylesheet (recommended).
5. **`team_members` status filter:** publish-only (recommended, consistent) vs all rows (legacy
   behavior).
6. **R4-interim freshness** (until the publish webhook lands): ISR `revalidate` seconds vs fully
   dynamic pages.
7. **Storage bucket name:** single `media` bucket (matches shipped migration) vs the maps' speculated
   `media-{env}` per-environment buckets (would require an R1 amendment).
8. **Tiptap render library:** confirm `@tiptap/static-renderer` vs `@tiptap/html` after live-doc
   verification (blocks Step 1).

## 11. Key risks

- **Stale-API risk (high):** Tiptap server renderer entry/signature and Supabase Storage
  `getPublicUrl` transform options must be verified against installed versions before coding
  (Steps 1, 3). Training data is stale; the maps disagree on exact forms.
- **Casing bugs:** snake_case columns vs camelCase jsonb innards is the most likely source of silent
  `undefined`s across templates and SEO.
- **OG-image behavior change:** `default_seo` has no `ogImage` in the DB/Zod model, so the sitewide
  OG path differs from Sanity — encode the dynamic-fallback intent deliberately, don't paper over it.
- **Cross-app extension move:** moving `editorExtensions` into `@vetkit/db` must not break the admin
  editor; verify admin typecheck in Step 1.
- **Image double-cost / focal point:** `object-cover` ignores focal unless `objectPosition` is set;
  Next optimization on top of Storage transforms doubles processing/cost if not addressed (decision 2).
- **Hero `_key`→`id`:** three `key=` sites in `HeroCarousel`; a miss is a React key/runtime issue.
