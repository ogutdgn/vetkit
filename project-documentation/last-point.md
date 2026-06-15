# Last point — vetkit

> **Snapshot of where the last session stopped.** Read this first when picking up work; refresh it before closing a chat or before any major operation.
>
> **Read with siblings:** [`execution-map.md`](./execution-map.md) (next chunk) · [`plan.md`](./plan.md) (full backlog). Skill `writing-last-point` codifies the protocol.

---

## Snapshot

**Date:** 2026-06-15 (work spans 06-14 → 06-15)
**Branch:** `feat/supabase-rebuild` — **pushed to `origin`** (through R2; R3-services commits land this session). **No `main` push** without owner approval; `main` is at `5302328`.
**State:** Sanity → Supabase pivot (CLAUDE.md §12). **R1 + R2 shipped + verified. R3 is IN PROGRESS** — `services` content CRUD (the template type) done; 8 more content types + the singleton/leads variants remain.
**Cloud project:** Supabase `alzwrhvuvqwwxoownnjf` (`vetkit-dev`). Seeded: tenants `gigi` + `ovapark`, super-admin `doganogut06@gmail.com` (temp password — owner should rotate). Public keys in `apps/web/.env.local` + `apps/admin/.env.local`.

## Done ✓

- **R1 — `@vetkit/db`:** schema live, RLS proven 9/9. [Review](./specs/2026-06-14-supabase-r1-review.md).
- **R2 — `apps/admin` auth shell:** Next 16 `proxy.ts` + `getClaims()` SSR auth, login, protected shell, tenant + super-admin resolution. Verified (build, live auth 5/5, runtime proxy).

## R3 — IN PROGRESS

**Done this session — Services CRUD + reusable content infra:**

- **Reusable layer:** `lib/tenant-db.ts` (`getTenantContext`), `lib/editor/extensions.ts` (Tiptap StarterKit v3, restricted ruleset: h2/h3/quote/lists/bold/italic/link, no h1, Link bundled — do NOT add `@tiptap/extension-link`), `components/editor/rich-text-field.tsx` (SSR-safe `immediatelyRender:false`, controlled JSON via `getJSON`), `components/media/media-picker.tsx` + `app/(app)/media/actions.ts` (`uploadMedia`: client measures dims via `createImageBitmap` → tenant-path Storage upload → `media` row), sidebar nav.
- **Services CRUD:** `app/(app)/services/{page,schema,actions,service-form,new,[id]}`. RHF + Zod 4 + `zodResolver`, Tiptap via `Controller`, draft/publish, `published_at` stamped-on-first-publish-then-preserved, slug auto-gen + override, RLS-scoped writes (`.eq('tenant_id')` + cookie client — NEVER service-role).
- **Verified:** typecheck + lint + `next build` clean (routes `/services`, `/services/new`, `/services/[id]`); **live CRUD 6/6** (super-admin insert→read→publish→anon-sees→delete on gigi). NOT browser-clicked (Tiptap/upload UI untested by hand).
- Deps added to `apps/admin`: `react-hook-form@7.79`, `zod@4.4.3`, `@hookform/resolvers@5.4`, `@tiptap/{react,pm,starter-kit}@3.26`.
- Brief: [`specs/2026-06-14-supabase-r3-research-brief.md`](./specs/2026-06-14-supabase-r3-research-brief.md) (the per-resource pattern to replicate).

**Professional UI — shadcn/ui pulled forward (R9), 2026-06-15:** `shadcn init` (base-nova style, neutral, Geist Sans/Mono, lucide) + 18 components. Rebuilt: collapsible **Sidebar** shell + header (tenant switcher, user menu), **dashboard** with stat Cards, shadcn **login**, services **list** (Table + Badge + DropdownMenu row actions + AlertDialog delete) and **form** (Card sections). Old `admin-shell`/`sidebar-nav` removed. base-nova uses **Base UI** (`render` prop, not `asChild`); RHF uses **`standardSchemaResolver`** (zod-4 via Standard Schema — `zodResolver` had a zod-4.4 type clash). Light default; dark tokens present. Build/lint/typecheck + runtime smoke clean. Remaining R9: branded `not-found.tsx`.

**Remaining R3 (replicate the services pattern):** blog_posts, team_members, faqs, gallery_images, pages, testimonials, hero_slides (each: schema + actions + form + list/new/[id]); `site_settings` singleton (one form, jsonb value-objects via the `@vetkit/db` Zod schemas); `submissions` (leads — list + status triage, no authoring). Ordering (`sort_order` reorder action) still to add. Per the brief §7, extract shared form-field components after 2–3 types.

## Open decisions (R3/R4)

- **Supabase plan:** Pro enables Storage image transforms; on Free use `next/image` + `focal_x/y` CSS. Owner call before finalizing image UX.
- **Media bucket is PUBLIC** → unpublished images are URL-guessable. Accepted for now (marketing imagery); revisit if private assets appear.
- Public render (R4): `@tiptap/static-renderer` `renderToHTMLString` (recommended) vs `renderToReactElement`.

## Heads-up

- **Port 3000 = owner's other Vite app.** Run admin dev elsewhere: `pnpm --filter @vetkit/admin exec next dev -p 3100`. Log in at `/login`.
- **Sanity code still on disk** → removed in R4 (public swap), not piecemeal. No Docker here (pgTAP = R10 CI gate).
- **Don't "fix" back:** Next 16 `proxy.ts` (not middleware); `getClaims()`; `immediatelyRender:false`; store Tiptap JSON not HTML; no `@tiptap/extension-link`; `service_role` grants required; admin writes use the cookie client (RLS), never service-role.
- Husky pre-commit active; ONE bundled docs commit per session wrap.
