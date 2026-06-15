# Spec — Supabase data model + multi-tenant RLS (the Sanity → Supabase rebuild)

> **Status:** DRAFT for owner review — no migrations written until this is approved.
> **Date:** 2026-06-14
> **Supersedes:** the Sanity CMS architecture (CLAUDE.md §2.2, §2.3, §3, §5; anti-patterns #2). A decision-log entry + section rewrites land in CLAUDE.md once this spec is approved.
> **Owner decisions already locked (2026-06-14 chat):** Supabase replaces Sanity; one shared project + RLS by `tenant_id`; new `apps/admin` for clinic users (invite-only) + a super-admin; draft/publish workflow; contact submissions persist to DB **and** email via Resend; full rebuild; query layer = `supabase-js` + generated types (not Drizzle — it bypasses RLS).

---

## 1. Goals & non-goals

**Goals**

- One Postgres schema that is a **faithful superset** of the current Sanity content model — the public site renders without losing a single field.
- Hard-ish tenant isolation via **deny-by-default RLS**, proven by an automated cross-tenant leak test.
- A model that **extends** into operational tables later (appointments, patients, leads) without reshaping the content core.
- The shipped templates and legacy design render unchanged — only the data layer beneath them is swapped.

**Non-goals (YAGNI, this round)**

- Appointments / patients / scheduling tables — future, not now.
- Content version history / audit trail beyond `updated_at` (draft/publish is a single status flag, not revisions).
- Document-level i18n — sites stay Turkish-only (old §3 holds).

---

## 2. Tenancy & auth model

```
auth.users (Supabase Auth)
   │
   ├── profiles            (1:1, display name for admin UI)
   ├── memberships         (user ↔ tenant ↔ role)  → clinic users, scoped to ONE clinic's data
   └── platform_admins     (user ∈ set)             → super-admin, sees ALL tenants
                                                       ↑ tenant switcher in apps/admin

tenants (slug, name, primary_domain)
   └── owns every content row via tenant_id (NOT NULL FK)
```

- **Clinic users** are invite-only (super-admin provisions a `memberships` row; no public signup). `role ∈ {owner, staff}` — both can edit content; `owner` reserved for future destructive actions (delete clinic, manage other users).
- **Super-admin** = row in `platform_admins`. RLS helpers grant it cross-tenant access. The admin UI gives it a tenant switcher.
- **Public site** (`apps/web`) carries no user session. Tenant is fixed at build time by env (`TENANT_SLUG` / `TENANT_ID`); it reads **published** rows only (see §6 read path).

---

## 3. Conventions applied to every table

- PK `id uuid default gen_random_uuid()`. Timestamps `created_at`, `updated_at timestamptz default now()` (an `updated_at` trigger).
- **Tenant column:** `tenant_id uuid not null references tenants(id) on delete cascade` on every content/leads/media row.
- **Draft/publish:** `status text not null default 'draft' check (status in ('draft','published'))` + `published_at timestamptz`. Public reads filter `status = 'published'`.
- **Ordering:** `sort_order int not null default 0` (replaces Sanity `orderRank`). Drag-reorder renumbers within a tenant — cheap at our content volume.
- **Slugs:** `slug text` **unique per tenant** → `unique (tenant_id, slug)`. Turkish-safe slugify lives in the admin (port `apps/studio/lib/slug.ts`).
- **Enums:** modeled as `text` + `check (... in (...))`, not Postgres `enum` types — adding a value is a cheap migration, no `ALTER TYPE` dance. Values mirror the Sanity option lists exactly (e.g. `service_location in ('in-clinic','home-call','both')`).
- **SEO:** public-facing tables get flat columns `meta_title`, `meta_description`, `og_image_id` (FK → media), `no_index bool default false` — flat (not jsonb) so `og_image` can be a real FK.
- **Rich text** (Sanity `blockContent`) → `jsonb` holding **Tiptap JSON**. Tiptap is configured to the exact §5 ruleset: blocks `normal/h2/h3/blockquote`, lists `bullet/number`, marks `strong/em/link(newTab)` — **no h1** (page title is the h1).
- **Cohesive value-objects** (contact, address, opening hours, social links, CTA) → `jsonb`, with **hand-authored TS types + Zod** validated at the admin write boundary (generated types render these `Json`; Zod restores the shape and guards input). Scalar/queryable fields stay real columns.

---

## 4. Tables

### Platform / identity

| Table             | Key columns                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `tenants`         | `slug` unique, `name`, `primary_domain`, timestamps                                                       |
| `profiles`        | `id` → `auth.users` (PK/FK, cascade), `full_name`                                                         |
| `memberships`     | `user_id`→auth.users, `tenant_id`→tenants, `role check in ('owner','staff')`, `unique(user_id,tenant_id)` |
| `platform_admins` | `user_id` → auth.users (PK)                                                                               |

### Media (replaces Sanity assets + hotspot)

| `media` | `tenant_id`, `bucket_path` (Storage), `alt`, `width`, `height`, `mime`, `focal_x real`, `focal_y real`, `created_at` |

Images become `*_media_id uuid references media(id)`. Crop/resize via Supabase Storage **image transformations** (URL params); `focal_x/y` replaces Sanity's hotspot for `object-position`. One public-read Storage bucket per environment, paths namespaced by `tenant_id`.

### Content (all carry the §3 conventions: tenant_id, status, published_at, sort_order, timestamps)

| Table            | Notable columns (beyond conventions)                                                                                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `site_settings`  | `unique(tenant_id)` — **singleton per tenant, always-live** (no draft). `clinic_name`, `tagline`, `logo_media_id`, `brand_color_hex`, `brand_color_name`, `contact jsonb`, `address jsonb`, `opening_hours jsonb`, `social_links jsonb`, `emergency_banner jsonb`, `footer_text`, `footer_links jsonb`, `default_seo jsonb`, `vercel_analytics_enabled bool` |
| `hero_slides`    | child of a tenant, **always-live config**: `media_id`, `heading`, `subheading`, `cta jsonb`, `sort_order`                                                                                                                                                                                                                                                    |
| `services`       | `title`, `slug`, `main_image_media_id`, `icon_media_id`, `short_description`, `description jsonb`(tiptap), `pet_types text[]`, `service_location text check`, `emergency_available bool`, `pricing`, + SEO                                                                                                                                                   |
| `blog_posts`     | `title`, `slug`, `excerpt`, `body jsonb`, `cover_image_media_id`, `author_id`→team_members, `published_at` (doubles as display date), `category text check`, `tags text[]`, + SEO                                                                                                                                                                            |
| `team_members`   | `name`, `title`, `slug?`, `photo_media_id`, `credentials text[]`, `specialties text[]`, `short_bio`, `bio jsonb`, `email`, `phone`, `social_links jsonb` (no SEO — no public detail route today)                                                                                                                                                             |
| `faqs`           | `question`, `answer jsonb`, `category text check`                                                                                                                                                                                                                                                                                                            |
| `gallery_images` | `media_id`, `caption`, `category text check`                                                                                                                                                                                                                                                                                                                 |
| `pages`          | `title`, `slug`, `hero_image_media_id`, `body jsonb`, `cta_buttons jsonb`, + SEO                                                                                                                                                                                                                                                                             |
| `testimonials`   | `author_name`, `author_photo_media_id`, `content jsonb`, `rating int check 1..5`, `source text check ('manual','google','trustmary')`, `source_url`, `published_at`, `featured bool` (schema-present, not yet rendered on public — preserved)                                                                                                                |

### Ordered relationships (junction tables — FK + cascade + `position`, preserve order & integrity)

`service_related_faqs` · `blog_post_related_services` · `blog_post_related_posts` · `page_featured_team_members`
(Sanity arrays-of-references → junctions so an editor deleting a referenced row can't leave a dangling pointer.)

### Leads

| `submissions` | `tenant_id`, `name`, `phone`, `email`, `message`, `pet_type?`, `source default 'contact_form'`, `status check in ('new','read','archived') default 'new'`, `meta jsonb`, `created_at` |

---

## 5. RLS strategy (the load-bearing part)

`alter table ... enable row level security` on **every** table. No policy ⇒ no access (deny by default).

Two `security definer` helpers:

- `auth_tenant_ids()` → `setof uuid` = `select tenant_id from memberships where user_id = auth.uid()`
- `is_platform_admin()` → `bool` = `exists(select 1 from platform_admins where user_id = auth.uid())`

Policy shape per content table:

- **authenticated** (admin): `USING (tenant_id in (select auth_tenant_ids()) or is_platform_admin())` for SELECT/UPDATE/DELETE, same as `WITH CHECK` for INSERT/UPDATE → a clinic user touches **only** their tenant; super-admin touches all.
- **anon** (public site): `SELECT USING (status = 'published')` only. Drafts are never anon-readable. Tenant correctness on the public path is enforced in the data layer (§6), not anon RLS.
- `media`: anon `SELECT` allowed (public marketing images; bucket is public-read). Admin writes scoped by tenant.
- `submissions`: anon `INSERT WITH CHECK (tenant_id is not null)`; **no** anon SELECT. Admin SELECT/UPDATE scoped by tenant.
- `tenants` / `memberships` / `platform_admins`: SELECT for self/members + platform admin; writes platform-admin-only (clinics don't create tenants or grant access).

**Leak test (ships with R1, gating):** seed two tenants + one clinic user in tenant A; assert (a) user A can read/write A's rows, (b) user A gets **zero rows** and a denied write on B's rows, (c) anon sees only `published`, never drafts, (d) super-admin sees both. Runs in CI.

---

## 6. Public read path (security posture — one call to confirm)

**Recommended:** `apps/web` server components use the **anon key** + the anon RLS policy (published-only). All reads go through a single helper `tenantTable(name)` that injects `.eq('tenant_id', TENANT_ID)` from env so a query **cannot forget** tenant scoping. Result: no secrets shipped, drafts impossible to leak (RLS), tenant correctness centralized.

- _Residual:_ a crafted anon API call could read another tenant's **published** (already-public) content. Severity low — it's all public marketing copy — but it isn't strict isolation.
- _Alternative if you want strict isolation even for published content:_ server-only reads with the **service-role key**, same `tenantTable` helper enforcing `tenant_id`. Slightly more care (service role bypasses RLS, so the helper is the only guard).

I'll default to the anon-key path unless you want strict isolation.

---

## 7. What's preserved vs rebuilt

**Preserved unchanged:** all `templates/` + the legacy design, Tailwind tokens, route tree, SEO helper _structure_, Resend, and the _shape_ of every content type (this spec is a 1:1 superset).

**Rebuilt / removed:** `apps/studio` (deleted) · `apps/web/lib/sanity/*` → `lib/db/*` · GROQ + `sanity typegen` + Sanity cache-tags → supabase-js + `supabase gen types` + revalidate-on-publish · `packages/sanity-types` → `packages/db` · template prop types re-typed against DB types · Portable Text renderer → Tiptap-JSON renderer · `urlFor` → Storage transform URLs.

**Cache/revalidation:** the OD-5 tag _concept_ survives. On publish, the admin calls the public site's revalidate route (or a Supabase DB webhook does) → `revalidateTag`/`revalidatePath`. Replaces the Sanity webhook (old Chunk 13).

---

## 8. Modeling calls I made (veto any)

1. **`media` as a table** (not jsonb-per-field) — enables a future admin media library, centralizes alt/dimensions, clean `og_image` FK. _(Alt: embed jsonb per image — simpler, no reuse.)_ → went with table.
2. **`site_settings` + `hero_slides` are always-live config**, not draft/publish — they're site chrome, not articles. _(Alt: give them status too.)_ → went always-live.
3. **Value objects as jsonb + Zod** (contact/address/hours/social/cta) vs flattened columns — chose jsonb for cohesion; type safety via Zod at the write boundary.
4. **Public read path** — §6, the one I actually want your call on (anon+RLS vs service-role).

---

## 9. Open items deferred to implementation (R1+)

- Verify current `@supabase/ssr`, `supabase gen types`, Storage-transform, and Tiptap APIs against live docs **before writing code** (training data is stale).
- Exact `updated_at` trigger + slug-uniqueness + `published_at` auto-set-on-publish logic.
- Seed/migration of real Ovapark + gigi content (R8).
