# Last point — vetkit

> **Snapshot of where the last session stopped.** Read this first when picking up work; refresh it before closing a chat or before any major operation.
>
> **Read with siblings:**
>
> - [`execution-map.md`](./execution-map.md) — what to work on next.
> - [`plan.md`](./plan.md) — the full plan and backlog.
>
> **Maintenance:** Refresh before chat closes, before any big operation (multi-file refactor, deploy, schema migration), or whenever the working tree is about to shift significantly. Skill `writing-last-point` at `.claude/skills/writing-last-point/SKILL.md` codifies the protocol. The last commit referenced below is the last _meaningful_ commit before this snapshot was written; the snapshot itself ships in a `docs(last-point): ...` commit immediately after.

---

## Snapshot

**Date:** 2026-05-30
**Last commit on `main`:** `093c922 docs(project): lock next-sanity in chunk 7, flag od-5, refresh last-point`. No code commits since 2026-05-26; this session's wrap ships a docs trio (`docs(claude): …`, `docs(plan): …`, `docs(execution-map): …`) plus this `docs(last-point): …`.
**Working tree:** apart from this session's doc edits (`last-point.md`, `execution-map.md`, `plan.md`, `CLAUDE.md`) and an untracked `.claude/settings.json`, clean.
**Remote:** `origin → https://github.com/ogutdgn/vetkit.git`. Owner is pushing this wrap.

## What's running

Carries over from 2026-05-28 — no code touched this session:

- Monorepo (pnpm + Turborepo), Tailwind v4, ESLint flat-config, Husky pre-commit, Sanity v5 Studio with the full Phase 1 schema, custom desk structure with orderable lists, `@sanity/language-filter` (tr/en), `@sanity/locale-tr-tr` for Studio chrome.
- `@vetkit/sanity-types` workspace package with 43 generated schema types; `apps/web` consumes via `apps/web/types/sanity.ts`.
- `pnpm typecheck` / `lint` / `build` clean across all packages.
- **No Sanity project provisioned and no `.env.local` anywhere** — only `.env.example` placeholders. `apps/web/lib/` does not exist yet; `next-sanity` + `@sanity/image-url` are not installed.

## What was done in this (2026-05-30) session

Planning and decisions only — no code:

1. **OD-5 resolved → cache-tag convention `sanity:<type>:<id>`** (namespaced, `_id`-based; `sanity:<type>:list` for collections, `sanity:siteSettings` for the singleton). `_id`-based survives slug renames; per-doc + per-list granularity lets the Chunk 13 webhook revalidate only affected pages. Logged in CLAUDE.md §12; removed from plan.md §3.
2. **Dev sandbox Sanity project decided** — create a throwaway `vetkit-dev` tenant (public `production` dataset) so the Chunk 7 smoke test is a real round-trip, not a build-only check. Owner creates it via sanity.io/manage after OD-6 settles; projectId → gitignored `apps/web/.env.local` (+ a Viewer `SANITY_API_READ_TOKEN` for draft mode) and `apps/studio/.env.local` (`SANITY_STUDIO_PROJECT_ID`).
3. **New OD-6 raised — blocks Chunk 7: i18n field shape.** Keep field-level `{ tr, en }` (the 2026-05-26 decision) or simplify to plain single-language fields (Option 1 — owner leaning, my recommendation). Plain fields are simpler for editors + queries and align with CLAUDE.md §3 / anti-pattern #12 (Turkish-only, no premature i18n), but reverse a logged decision and rework the Chunk 4 schema. Cost is ~zero now (no project, no content). Logged in plan.md §3.
4. **Locale-projection approach (the old #3) parked behind OD-6** — if Option 1, queries are plain projections; if Option 2, queries use `coalesce(field[$locale], field[$defaultLocale])` with `$locale` from `siteSettings.defaultLocale`.

Grounding: ran a two-agent map of `apps/web` + `apps/studio` to confirm current state (captured above and in execution-map §1).

## What is NOT yet set up

Standing inventory — cross off as items ship.

- ~~Tailwind CSS v4~~ ✓ 2026-05-20.
- ~~ESLint flat config~~ ✓ 2026-05-20.
- ~~Husky / lint-staged~~ ✓ 2026-05-20.
- ~~Sanity schema (Chunk 4)~~ ✓ 2026-05-26.
- ~~Studio Turkish localization + custom desk (Chunk 5)~~ ✓ 2026-05-26.
- ~~Sanity type generation (Chunk 6)~~ ✓ 2026-05-26.
- **Shared Sanity infra in `apps/web/lib/sanity/` (Chunk 7)** — active, but **BLOCKED on OD-6**.
- **Dev sandbox Sanity project (`vetkit-dev`)** — not yet created (owner action).
- SEO helpers (Chunk 8).
- Template contract + `templates/modern/` (Chunks 9-10).
- Marketing pages (Chunk 11).
- Contact form + Resend (Chunk 12).
- Revalidation route + Sanity webhook (Chunk 13).
- shadcn/ui init (Chunk 14).
- GitHub Actions CI (OD-3 open — recommendation: minimal workflow before Chunk 15).
- Vercel deployment (Chunk 15).

## Open decisions still pending

See [`plan.md`](./plan.md) §3.

- **OD-1** (Sanity major version) — resolved 2026-05-26 → **v5**.
- **OD-3** (CI timing) — open. Recommendation: before Chunk 15.
- **OD-4** (Studio hostname pattern) — resolved 2026-05-28 → **CNAME `studio.<client-domain>.com`**.
- **OD-5** (cache-tag naming convention) — resolved 2026-05-30 → **`sanity:<type>:<id>`**.
- **OD-6** (i18n field shape) — **NEW, open. Hard blocker for Chunk 7.** Owner leaning **Option 1** (plain single-language fields).

## Heads-up for the next session

- **First action: settle OD-6.** Owner was leaning Option 1 (plain single-language fields). Decide explicitly before writing any Chunk 7 code.
- **If Option 1 (plain fields):** run a **Chunk 4 schema-simplification pass first** — swap `localeString` / `localeText` / `localeSlug` / `localePortableText` for plain `string` / `text` / `slug` / portable-text array, drop the `@sanity/language-filter` plugin, simplify `siteSettings` (drop `activeLocales`), regen types (`pnpm --filter @vetkit/studio typegen`), and supersede the 2026-05-26 i18n decision in CLAUDE.md §12. Chunk 7 queries then become plain projections.
- **If Option 2 (keep `{ tr, en }`):** Chunk 7 queries use `coalesce(field[$locale], field[$defaultLocale])`, `$locale` from `siteSettings.defaultLocale`.
- **Then Chunk 7** per [`execution-map.md`](./execution-map.md) §1: install `next-sanity` + `@sanity/image-url`; build `client.ts` (CDN public + draft-aware via `SANITY_API_READ_TOKEN`), `image.ts` (`urlFor`), `live.ts` (`await draftMode()` — Next 16 async), `queries.ts` (`siteSettingsQuery`, `servicesListQuery`, `serviceBySlugQuery` via `defineQuery`) with OD-5 cache tags; regen types; smoke-test `app/page.tsx`.
- **Dev project:** owner creates `vetkit-dev`; the two gitignored `.env.local` files get the projectId. Create those files at scaffold time and confirm `.env.local` is gitignored before committing.
- Husky pre-commit is active — every commit auto-runs lint+format.
