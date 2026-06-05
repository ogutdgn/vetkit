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

**Date:** 2026-06-05 (second wrap this date — Chunk 6b shipped earlier the same day)
**Last commit on `main`:** `48f9f0d docs(schema): add icon to service field summary`. This wrap ships `docs(plan): ...`, `docs(execution-map): ...`, then this `docs(last-point): ...`.
**Working tree:** apart from this wrap's doc edits (`plan.md`, `execution-map.md`) and untracked `.claude/` local files, clean.
**Remote:** `origin → https://github.com/ogutdgn/vetkit.git`. Pushed through `93ce3ca` (the 6b wrap); the 14 Chunk 7 commits (`f4a8cbd`–`48f9f0d` + this wrap's docs) are **not pushed yet**.

## What's running

- Monorepo (pnpm + Turborepo), Tailwind v4, ESLint flat-config, Husky pre-commit, Sanity v5 Studio (**sanity 5.30**) with the plain-field Phase 1 schema + orderRank-backed orderable lists.
- **`vetkit-dev` Sanity project is live** (projectId `v682t332`, public `production` dataset, empty). Gitignored `apps/web/.env.local` (projectId + Viewer `SANITY_API_READ_TOKEN`) and `apps/studio/.env.local` exist locally. Round-trip verified by curl and by the build.
- **Chunk 7 data layer shipped:** `apps/web/lib/sanity/` — `client.ts` (origin-only published client + drafts client), `live.ts` (`sanityFetch` with async `draftMode()`), `queries.ts` (3 `defineQuery` queries), `tags.ts` (OD-5 builders), `image.ts` (`urlFor`). Home page is the smoke test: static prerender (○) with live data from `vetkit-dev`.
- `@vetkit/sanity-types`: 40 schema types + 3 query result types + `SanityQueries` augmentation (hence its `@sanity/client` dep). next-sanity 13.0.11 + `@sanity/image-url` ^2.1.1 in `apps/web`.
- `pnpm typecheck` / `lint` / `build` clean across all packages (verified this session).

## What was done in this (2026-06-05, Chunk 7) session

1. **17 earlier commits pushed** (OD-6 + Chunk 6b wrap), then **Chunk 7 built and shipped** (commits `f4a8cbd`–`68f0f6e`): deps (next-sanity 13, sanity 5.26→5.30 for peer alignment, `peerDependencyRules.ignoreMissing` for studio-embed-only peers), the five `lib/sanity/` modules, typegen with query result types, home-page smoke test, architecture docs. Typing verified with a consumed `@ts-expect-error` probe; build verified fetching live data.
2. **Owner created `vetkit-dev`** (public dataset, Viewer token, CORS for localhost:3333/3000); env files written and verified gitignored.
3. **Adversarial review workflow** (4 lenses, 25 agents) → 12 confirmed findings, all fixed:
   - **Real defect:** `useCdn: true` + tag-only revalidation = stale-pinning race (one post-webhook refetch can read a not-yet-invalidated CDN response and stick until the next publish). Fixed → `useCdn: false` (`819de66`); fetch-cache verified to hit `api.sanity.io` only. Logged as a §12 cache-refinement row with two tag rules: webhook busts doc+list tags on every mutation; dereferencing queries also tag the dereferenced type (service detail → `sanity:faq:list`).
   - Doc staleness purged: CLAUDE.md `sanity-codegen`→`sanity typegen` (3 places) + §4 tree (tags.ts, sanity-types files); PROJECT-ARCHITECTURE "Sanity v3"/`sanity.cli.ts`/"empty schema array"/"query types come later" all corrected; SCHEMA.md service row + icon.
4. **Wrap docs:** plan.md row 7 checked (✓ with deviations noted), execution-map → Chunk 8, this file.

## What is NOT yet set up

Standing inventory — cross off as items ship.

- ~~Tailwind CSS v4~~ ✓ 2026-05-20. ~~ESLint flat config~~ ✓. ~~Husky~~ ✓.
- ~~Sanity schema (Chunk 4)~~ ✓ 2026-05-26. ~~Studio TR + desk (Chunk 5)~~ ✓. ~~Typegen (Chunk 6)~~ ✓.
- ~~Schema i18n simplification (Chunk 6b)~~ ✓ 2026-06-05.
- ~~Shared Sanity infra (Chunk 7)~~ ✓ 2026-06-05.
- **SEO helpers (Chunk 8)** — active next.
- Template contract (Chunk 9); `templates/modern/` (Chunk 10).
- Marketing pages (Chunk 11) — note: detail pages do the slug→`_id` two-step for per-doc tags, plus `listTag('faq')` on service detail (see `queries.ts` comments).
- Contact form + Resend (Chunk 12).
- Revalidation route + Sanity webhook (Chunk 13) — must bust BOTH doc and list tags on every mutation (CLAUDE.md §12 2026-06-05 refinement).
- shadcn/ui init (Chunk 14). GitHub Actions CI (OD-3). Vercel deployment (Chunk 15).
- Dataset content: `vetkit-dev` is empty — seed a siteSettings doc + a couple of services when Chunk 8/11 needs visible data.

## Open decisions still pending

See [`plan.md`](./plan.md) §3.

- **OD-3** (CI timing) — the only open decision. Recommendation: minimal workflow before Chunk 15.

## Heads-up for the next session

- **Chunk 8 (SEO helpers) is the active chunk** — full spec in [`execution-map.md`](./execution-map.md) §1: `lib/seo/metadata.ts` + `schema.ts` (JSON-LD `VeterinaryCare`), `app/sitemap.ts` / `robots.ts` / `manifest.ts` / `opengraph-image.tsx` (Next 16 `ImageResponse`). New sitemap queries go in `queries.ts` as `defineQuery` + regen typegen.
- **Unpushed:** everything after `93ce3ca` (the entire Chunk 7 batch + wrap docs). Push before/at next session start.
- **Gotchas baked into the code — don't "fix" them back:** `useCdn: false` is deliberate (race, see client.ts comment); `@sanity/image-url` is a deliberate direct dep (next-sanity 13 does NOT re-export the builder); `generated.ts` is ESLint-exempt raw typegen output.
- Husky pre-commit is active — every commit auto-runs lint+format.
