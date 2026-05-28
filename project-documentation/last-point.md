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

**Date:** 2026-05-28
**Last commit on `main`:** `593722a docs(project): mark chunk 6 done, set chunk 7 active, refresh last-point` (the docs trio shipping next — `docs(claude): …`, `docs(plan): …`, `docs(project): …` — are the wrap of the 2026-05-28 decisions, no code changes since 2026-05-26).
**Working tree:** clean apart from this snapshot and an untracked `.claude/settings.json`.
**Remote:** `origin → https://github.com/ogutdgn/vetkit.git`. All commits through this wrap are pushed at the end of this session.

## What's running

Carries over from the 2026-05-26 session (no code touched on 2026-05-28):

- Monorepo (pnpm + Turborepo), Tailwind v4, ESLint flat-config, Husky pre-commit, Sanity v5 Studio with the full Phase 1 schema, custom desk structure with orderable lists, `@sanity/language-filter` for content-locale, `@sanity/locale-tr-tr` for Studio chrome.
- `@vetkit/sanity-types` workspace package with 43 generated schema types; `apps/web` consumes via `apps/web/types/sanity.ts` re-export.
- `pnpm typecheck` / `lint` / `build` clean across all packages.

## What was done in this (2026-05-28) wrap

Two architectural decisions taken and logged:

1. **`next-sanity` over vanilla `@sanity/client`** for the Chunk 7 client wrapper. Reasoning: Next 16 fetch cache + `revalidateTag` integration is load-bearing for the Chunk 13 webhook, `defineQuery` is picked up by `sanity typegen` for typed GROQ result types, draft-mode and live-preview helpers come included. Logged in `CLAUDE.md` §12.
2. **OD-4 resolved → `studio.<client-domain>.com` via CNAME** for Studio hostnames. Reasoning: white-label feel for clinic owners; ~5 min extra onboarding step is acceptable at our scale. Logged in `CLAUDE.md` §12; removed from `plan.md` §3.

One new open decision flagged:

- **OD-5: cache-tag naming convention.** Recommendation `sanity:<type>:<id>` namespaced (stable across slug renames; `sanity:<type>:list` for collections; `sanity:siteSettings` for the singleton). Logged in `plan.md` §3 as a blocker for the **first** commit of Chunk 7 — once a tag shape ships in `queries.ts`, every consumer bakes it in and changing it later means a global sweep. Decide before writing the first query.

`execution-map.md` updated to lock `next-sanity` for Chunk 7 and to flag OD-5 as a first-commit blocker.

No code commits in this turn — only docs.

## What is NOT yet set up

Standing inventory — cross off as items ship.

- ~~Tailwind CSS v4~~ ✓ 2026-05-20.
- ~~ESLint flat config~~ ✓ 2026-05-20.
- ~~Husky / lint-staged~~ ✓ 2026-05-20.
- ~~Sanity schema (Chunk 4)~~ ✓ 2026-05-26.
- ~~Studio Turkish localization + custom desk (Chunk 5)~~ ✓ 2026-05-26.
- ~~Sanity type generation (Chunk 6)~~ ✓ 2026-05-26.
- **Shared Sanity infra in `apps/web/lib/sanity/` (Chunk 7)** — active.
- SEO helpers (Chunk 8).
- Template contract + `templates/modern/` (Chunks 9-10).
- Marketing pages (Chunk 11).
- Contact form + Resend (Chunk 12).
- Revalidation route + Sanity webhook (Chunk 13).
- shadcn/ui init (Chunk 14).
- GitHub Actions CI (OD-3 open — recommendation: minimal workflow before Chunk 15).
- Vercel deployment (Chunk 15 — Studio hostname OD-4 resolved → CNAME `studio.<client-domain>.com`).

## Open decisions still pending

See [`plan.md`](./plan.md) §3.

- **OD-1** (Sanity major version) — resolved 2026-05-26 → **v5**.
- **OD-3** (CI timing) — open. Recommendation: before Chunk 15.
- **OD-4** (Studio hostname pattern) — resolved 2026-05-28 → **CNAME `studio.<client-domain>.com`**.
- **OD-5** (cache-tag naming convention) — new on 2026-05-28; blocks the first Chunk 7 commit. Recommendation: `sanity:<type>:<id>` namespaced.

## Heads-up for the next session

- Active chunk is **Chunk 7 — shared Sanity infra in `apps/web/lib/sanity/`**. See [`execution-map.md`](./execution-map.md) §1 for the Done-when.
- **First action: resolve OD-5.** Pick a cache-tag convention before writing the first GROQ query. My recommendation is `sanity:<type>:<id>` (namespaced, `_id`-based); decide explicitly so it doesn't get baked in by accident.
- **Second action:** scaffold `apps/web/lib/sanity/client.ts` against `next-sanity` (public CDN-cached + draft-mode-aware variants).
- **Third action:** `image.ts` (urlFor builder) and `live.ts` (`await draftMode()` toggle for Next 16).
- **Fourth action:** `queries.ts` with three initial queries (`siteSettingsQuery`, `servicesListQuery`, `serviceBySlugQuery`) using `defineQuery` so `sanity typegen` emits typed results.
- **Fifth action:** rerun `pnpm --filter @vetkit/studio typegen` and let it pick up the GROQ queries; commit the regenerated `generated.ts`.
- **Smoke:** wire `app/page.tsx` to fetch and render one field from `siteSettingsQuery` as end-to-end proof. Real marketing pages land in Chunk 11.
- Husky pre-commit is active — every commit auto-runs lint+format.
