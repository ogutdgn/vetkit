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

**Date:** 2026-05-21
**Last commit on `main`:** `6c1d0a0 docs(execution-map): set Chunk 4 (Sanity schema) as next active chunk`
**Working tree:** clean (this file is the only pending change, committed in the next `docs(last-point): ...` commit).

## What's running

- Monorepo skeleton (pnpm workspaces + Turborepo) in place.
- `apps/web` builds and dev-runs with **Tailwind v4** + Inter font + modern template tokens (from previous session). `pnpm --filter @vetkit/web build` → 2.4s compile, TS check passes, static prerender clean.
- `apps/studio` wired to env-driven Sanity v3.99 config — **no schemas yet** (Chunk 4 is next).
- **ESLint flat-config** live in both apps. `pnpm --filter @vetkit/web lint` and `pnpm --filter @vetkit/studio lint` both exit 0; `pnpm lint` at root runs both via Turbo (~2.9s cold, cached after).
- **Husky + lint-staged** pre-commit hook active. Every commit auto-runs `eslint --fix` + `prettier --write` on staged JS/TS/MJS files and `prettier --write` on staged docs/styles. Hook is verified working — fired correctly across all commits in this session.
- `pnpm typecheck` passes for both apps.

## What was done in this session

- **Shipped Chunk 2 — ESLint flat config**: added [`packages/config-eslint`](../packages/config-eslint/) with `base`, `nextjs`, and `react-library` exports (type-aware TS rules + Prettier compat). Added a root catch-all [`eslint.config.mjs`](../eslint.config.mjs) so files outside any app also lint. Wired both apps with one-line `eslint.config.mjs` re-exports and replaced their placeholder `lint` scripts with `eslint .`. Commits `c570f55`, `8d3187b`.
- **Shipped Chunk 3 — Husky + lint-staged**: installed at root, `prepare: "husky"` sets up the git hooks path on every install, [`.husky/pre-commit`](../.husky/pre-commit) runs `pnpm exec lint-staged`. lint-staged config in root [`package.json`](../package.json) covers JS/TS (eslint+prettier) and docs/styles (prettier only). Resolves OD-2. Commit `0c20426`.
- **Resolved OD-2** in [`plan.md`](./plan.md) §3 and logged the decision in [`CLAUDE.md`](../CLAUDE.md) §12. Commits `92a21c6`, `b9150a2`.
- **Updated [`execution-map.md`](./execution-map.md)** to point at **Chunk 4 — Sanity schema** as the next active chunk, with a suggested 6-commit split and an explicit OD-1 blocker. Commit `6c1d0a0`.
- Root [`.gitignore`](../.gitignore) now excludes `.husky/_/` (auto-generated husky internals).
- Root [`package.json`](../package.json) now also declares `eslint` as a devDep so lint-staged finds the binary from the workspace root.

## What is NOT yet set up

(Standing inventory of Phase 1 gaps — carry forward; cross off as they ship.)

- ~~Tailwind CSS v4~~ ✓ shipped 2026-05-20.
- ~~ESLint flat config~~ ✓ shipped this session.
- ~~Husky / lint-staged~~ ✓ shipped this session.
- shadcn/ui.
- **Sanity schema, GROQ queries, Sanity client wrapper, draft mode helpers. (Chunk 4 — next.)**
- SEO helpers (`generateMetadata`, JSON-LD, sitemap, robots, OG image).
- Template contract (`apps/web/types/template.ts`) and the rest of `templates/modern/` (Header, Hero, ServiceCard, BlogCard, TeamSection, Footer, `index.ts`).
- Marketing pages beyond the placeholder home.
- Contact form + Resend integration.
- Revalidation route and Sanity webhook setup.
- GitHub Actions CI.
- Vercel deployment for any client.

## Open decisions still pending

See [`plan.md`](./plan.md) §3. Active set: **OD-1** (Sanity v3 vs v4 vs v5 — blocks Chunk 4), **OD-3** (CI timing), **OD-4** (Studio hostname pattern). OD-2 was resolved this session, OD-5 in the previous one.

## Heads-up for the next session

- Active chunk is **Chunk 4 — Sanity schema (Phase 1)** (see [`execution-map.md`](./execution-map.md) §1). The 6-commit split is sketched there.
- **OD-1 is a hard blocker** — do not write schema code until the Sanity major version is locked. Picking v3 vs v4 vs v5 changes the schema authoring API and how `siteSettings` singleton enforcement is wired. Open `apps/studio/package.json` to confirm current resolved version (`3.99.x` at last check).
- Before starting Chunk 4, also **read both `old-sites/`** (`gigi-veteriner/`, `ovapark-veteriner/`) per CLAUDE.md §5 — extract content categories, hardcoded fields that should become editable, anything missing. The schema is the keystone; getting field shapes wrong now means painful Sanity migrations later when real client data exists.
- Working tree should be clean before starting (this last-point.md refresh is the only thing left to commit). Run `git status` to confirm.
- Husky pre-commit hook is now active — every commit auto-runs lint+format on staged files. If a commit takes 1-3s longer than before, that's expected.
