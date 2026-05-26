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

**Date:** 2026-05-26
**Last commit on `main`:** `1eb8bfc feat(studio): register the turkish locale bundle for studio chrome` (the snapshot itself ships next in `docs(project): set chunk 6 active and refresh last-point`).
**Working tree:** clean apart from this snapshot and an untracked `.claude/settings.json` (unrelated to chunk work).

## What's running

- Monorepo skeleton (pnpm workspaces + Turborepo), Tailwind v4 + Inter font + modern template tokens on `apps/web`, ESLint flat-config + Husky + lint-staged pre-commit — all carried over from prior chunks.
- **Sanity v5 Studio with the full Phase 1 schema** (Chunk 4): 4 locale primitives, 7 reusable objects, `siteSettings` singleton, 7 documents.
- Custom desk structure with `siteSettings` pinned + orderable lists (service / teamMember / faq / galleryImage / testimonial) + standard listings (blogPost / page).
- `@sanity/language-filter` wired for **content-locale** filtering (TR + EN) using a name-prefix detector on `locale*` objects.
- **`@sanity/locale-tr-tr@1.2.33` wired as `trTRLocale()`** (Chunk 5): translates the Studio chrome (top bar, menus, validation messages, empty states). Editors switch to Turkish from the language switcher in the top bar; the choice persists per browser. There is no `defineConfig`-level "force locale" hook in Sanity v5.
- `pnpm --filter @vetkit/studio typecheck` / `lint` / `build` and `pnpm --filter @vetkit/web build` all pass.

## What was done in this session

Session date: 2026-05-26. Shipped **Chunk 4 (Sanity schema)** end-to-end with 12 commits, then **Chunk 5 (Studio Turkish polish)** in a small follow-up:

Chunk 4 commits (in order): `118e81e`, `7dc1465`, `3934fe6`, `a1dbb49`, `9f0b52a`, `b52d3dd`, `57bfa61`, `28cffa0`, `e800343`, `5319292`, `a9e7e83`, `86f5a3c`. Brought Sanity v3.99 → v5.26.0 (incl. workspace fix-ups for jiti / config-typescript / sanity.cli rename / react bump / eslint), introduced 4 locale primitives + 7 reusable objects + siteSettings singleton + 7 docs + custom desk structure, wired language-filter, documented in SCHEMA.md, updated CLAUDE.md §12 (3 new decision rows + OD-1 resolved), and deleted the working-notes brainstorm.

Chunk 5 commit: `1eb8bfc feat(studio): register the turkish locale bundle for studio chrome`. Plus this `docs(*)` trio.

Chunk 5 scope ended up small because the bulk of its original scope (desk structure, singleton enforcement, Turkish field labels and descriptions, language-filter wiring) had spilled into Chunk 4. The residual was: install `@sanity/locale-tr-tr`, register `trTRLocale()`, document the distinction between Studio-UI locale and content locale in SCHEMA.md.

## What is NOT yet set up

Standing inventory — cross off as items ship.

- ~~Tailwind CSS v4~~ ✓ 2026-05-20.
- ~~ESLint flat config~~ ✓ 2026-05-20.
- ~~Husky / lint-staged~~ ✓ 2026-05-20.
- ~~Sanity schema (Chunk 4)~~ ✓ 2026-05-26.
- ~~Studio Turkish localization + custom desk (Chunk 5)~~ ✓ 2026-05-26.
- **Sanity type generation (Chunk 6) — `packages/sanity-types/`** — active.
- Shared Sanity infra in `apps/web/lib/sanity/` (Chunk 7).
- SEO helpers (Chunk 8).
- Template contract + `templates/modern/` components (Chunks 9-10).
- Marketing pages (Chunk 11).
- Contact form + Resend (Chunk 12).
- Revalidation route + Sanity webhook (Chunk 13).
- shadcn/ui init (Chunk 14).
- GitHub Actions CI (OD-3 still open).
- Vercel deployment (OD-4 still open).
- Editorial dry-run against a scratch Sanity dataset (Chunk 5 done-when item that needs a live project; not blocking).

## Open decisions still pending

See [`plan.md`](./plan.md) §3.

- **OD-1** (Sanity major version) — resolved 2026-05-26 → **v5**.
- **OD-3** (CI timing) — open.
- **OD-4** (Studio hostname pattern) — open.
- **Chunk 6 sub-decision:** `sanity-codegen` (community) vs `sanity typegen` (official v5 CLI). Resolve at the top of Chunk 6.

## Heads-up for the next session

- Active chunk is **Chunk 6 — Sanity type generation into `packages/sanity-types/`**. See [`execution-map.md`](./execution-map.md) §1 for the new Done-when.
- **First action:** decide `sanity-codegen` vs `sanity typegen`. The plan still says `sanity-codegen` but Sanity v5 ships an official `sanity typegen` CLI now — quick due-diligence first.
- **Second action:** scaffold `packages/sanity-types/` (package.json + tsconfig + an empty `index.ts` placeholder).
- **Third action:** wire the typegen command and emit the generated file. Check it in to avoid an install-time codegen step.
- **Fourth action:** ensure `apps/web` resolves `@vetkit/sanity-types` and stub an import to prove the chain works (full GROQ-typed queries land in Chunk 7).
- Husky pre-commit is active — every commit auto-runs lint+format. Already verified working.
