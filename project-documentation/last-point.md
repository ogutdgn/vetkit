# Last point — vetkit

> **Snapshot of where the last session stopped.** Read this first when picking up work; refresh it before closing a chat or before any major operation.
>
> **Read with siblings:**
> - [`execution-map.md`](./execution-map.md) — what to work on next.
> - [`plan.md`](./plan.md) — the full plan and backlog.
>
> **Maintenance:** Refresh before chat closes, before any big operation (multi-file refactor, deploy, schema migration), or whenever the working tree is about to shift significantly. Skill `writing-last-point` at `.claude/skills/writing-last-point/SKILL.md` codifies the protocol. The last commit referenced below is the last *meaningful* commit before this snapshot was written; the snapshot itself ships in a `docs(last-point): ...` commit immediately after.

---

## Snapshot

**Date:** 2026-05-20
**Last commit on `main`:** `9cebd0f docs(claude): reference three-file operational doc set and project skills`
**Working tree:** clean (this file is the only pending change, committed in the next `docs(last-point): ...` commit).

## What's running

- Monorepo skeleton (pnpm workspaces + Turborepo) in place.
- `apps/web` boots: `pnpm --filter @vetkit/web dev` → Next.js 16.2.4 (Turbopack) ready in ~330ms, `localhost:3000` returns HTTP 200.
- `apps/studio` wired to env-driven Sanity v3.99 config — **no schemas yet** (empty array in `apps/studio/schemas/index.ts`).
- `pnpm typecheck` passes for both apps.
- Shared `@vetkit/config-typescript` provides 3 TS presets (base / nextjs / react-library).

## What was done in this session

- **Restructured `project-documentation/`** from a single `EXECUTION-MAP.md` into three operational files: [`plan.md`](./plan.md) (master plan + ordered Phase 1 backlog + open decisions), [`execution-map.md`](./execution-map.md) (next session's focused chunk only, plus pickup/wrap-up protocols), [`last-point.md`](./last-point.md) (this file — session-boundary snapshot). Commit `3317b99 docs(plan): split EXECUTION-MAP into plan and lowercase execution-map`.
- **Added four project-level skills** under `.claude/skills/`: `writing-commits`, `updating-plan`, `updating-execution-map`, `writing-last-point`. Each codifies the protocol for the corresponding file or operation. Commit `e70cd33 chore(claude): add writing-commits and three doc-maintenance skills`.
- **Updated `CLAUDE.md`** — §4 (folder listing now shows plan/execution-map/last-point), §10 (inline roadmap replaced with pointer to plan.md), §12 (decision log row added for 2026-05-20 restructure), §13 (quick-start walks through the three operational docs and four skills). Commit `9cebd0f docs(claude): reference three-file operational doc set and project skills`.
- **Updated memory** `feedback_commit_style.md`: max commit length raised from 1-2 to 3-4 sentences; cross-reference added to the writing-commits skill.

## What is NOT yet set up

(Standing inventory of Phase 1 gaps — carry forward; cross off as they ship.)

- Tailwind CSS v4 — `apps/web/app/page.tsx` still uses inline styles as a placeholder.
- ESLint flat config — `lint` scripts are placeholders that just `echo`.
- Husky / lint-staged.
- shadcn/ui.
- Sanity schema, GROQ queries, Sanity client wrapper, draft mode helpers.
- SEO helpers (`generateMetadata`, JSON-LD, sitemap, robots, OG image).
- Template contract (`apps/web/types/template.ts`) and `templates/modern/`.
- Marketing pages beyond the placeholder home.
- Contact form + Resend integration.
- Revalidation route and Sanity webhook setup.
- GitHub Actions CI.
- Vercel deployment for any client.

## Open decisions still pending

See [`plan.md`](./plan.md) §3 for the full table. Active set: OD-1 (Sanity v3 vs v4 vs v5), OD-2 (Husky vs CI-only), OD-3 (CI timing), OD-4 (Studio hostname pattern), OD-5 (`tokens.css` location for Phase 1).

## Heads-up for the next session

- Active chunk is **Chunk 1 — Tailwind v4 + token system in `apps/web`** (see [`execution-map.md`](./execution-map.md) §1).
- Resolve **OD-5** (`tokens.css` location) during this chunk — don't defer past it.
- Working tree should be clean before starting (this last-point.md refresh is the only thing left to commit). Run `git status` to confirm.
- Use `.claude/skills/writing-commits/SKILL.md` for every commit; split topically.
