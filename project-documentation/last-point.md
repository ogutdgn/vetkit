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
**Last commit on `main`:** `aa4ab7e docs(execution-map): set Chunk 2 (ESLint flat config) as next active chunk`
**Working tree:** clean (this file is the only pending change, committed in the next `docs(last-point): ...` commit).

## What's running

- Monorepo skeleton (pnpm workspaces + Turborepo) in place.
- `apps/web` builds and dev-runs with **Tailwind v4** (CSS-first config via `postcss.config.mjs`, no `tailwind.config.ts`). `pnpm --filter @vetkit/web build` → 2.4s compile, TS check passes, 3/3 static pages prerendered.
- **Inter** loaded via `next/font/google` with `latin-ext` subset for Turkish characters; CSS variable `--font-inter` is wired through `--font-sans` in `templates/modern/tokens.css`.
- **Modern template tokens** declared in `apps/web/templates/modern/tokens.css` (`@theme` block) — brand 50→900 palette, ink neutrals, font, radius scale.
- `apps/studio` wired to env-driven Sanity v3.99 config — **no schemas yet** (empty array in `apps/studio/schemas/index.ts`).
- `pnpm typecheck` passes for both apps.
- Shared `@vetkit/config-typescript` provides 3 TS presets (base / nextjs / react-library).

## What was done in this session

- **Restructured `project-documentation/`** into the trio plan.md / execution-map.md / last-point.md (commits `3317b99`, `fb7ae2b`, `9cebd0f`).
- **Added four project skills** under `.claude/skills/`: `writing-commits`, `updating-plan`, `updating-execution-map`, `writing-last-point` (commit `e70cd33`).
- **Shipped Chunk 1 — Tailwind v4 + modern template tokens**: installed `tailwindcss@^4` + `@tailwindcss/postcss@^4`, added `postcss.config.mjs`, wired Inter via `next/font/google`, declared `templates/modern/tokens.css` with brand/ink/radius tokens, replaced placeholder inline styles in `app/page.tsx` with Tailwind utilities. Build verified clean (commits `56a0b30`, `8ca0a3e`).
- **Resolved OD-5** — tokens live per-template at `templates/<name>/tokens.css`. Removed from `plan.md` §3, logged in `CLAUDE.md` §12 (commits `11cb71e`, `dbb5369`).
- **Updated execution-map.md** to point at **Chunk 2 — ESLint flat config** as the next active chunk, with a suggested 3-commit split (commit `aa4ab7e`).
- **Updated memory** `feedback_commit_style.md`: max length raised to 3-4 sentences; cross-reference to the writing-commits skill added.

## What is NOT yet set up

(Standing inventory of Phase 1 gaps — carry forward; cross off as they ship.)

- ~~Tailwind CSS v4~~ ✓ shipped this session.
- ESLint flat config — `lint` scripts are still placeholders that just `echo`. **(Chunk 2 — next.)**
- Husky / lint-staged. (Chunk 3 — blocked on OD-2.)
- shadcn/ui.
- Sanity schema, GROQ queries, Sanity client wrapper, draft mode helpers.
- SEO helpers (`generateMetadata`, JSON-LD, sitemap, robots, OG image).
- Template contract (`apps/web/types/template.ts`) and the rest of `templates/modern/` (Header, Hero, ServiceCard, BlogCard, TeamSection, Footer, `index.ts`).
- Marketing pages beyond the placeholder home.
- Contact form + Resend integration.
- Revalidation route and Sanity webhook setup.
- GitHub Actions CI.
- Vercel deployment for any client.

## Open decisions still pending

See [`plan.md`](./plan.md) §3 for the full table. Active set after this session: **OD-1** (Sanity v3 vs v4 vs v5), **OD-2** (Husky vs CI-only — blocks Chunk 3), **OD-3** (CI timing), **OD-4** (Studio hostname pattern). OD-5 was resolved this session.

## Heads-up for the next session

- Active chunk is **Chunk 2 — ESLint flat config** (see [`execution-map.md`](./execution-map.md) §1). 3-commit split is sketched there.
- **OD-2 affects Chunk 3** (Husky), not Chunk 2 directly — but it's worth raising before Chunk 2 finishes, so Chunk 3 isn't blocked the moment Chunk 2 ships.
- Working tree should be clean before starting (this last-point.md refresh is the only thing left to commit). Run `git status` to confirm.
- Use `.claude/skills/writing-commits/SKILL.md` for every commit; split topically per the execution-map suggestion.
- Visual verification of Chunk 1 was build-only (no browser smoke test ran in-session). If anything looks off when opening `localhost:3000`, the likely culprits are font variable wiring (`--font-inter` resolution) or token cascade — both isolated to `app/layout.tsx` and `templates/modern/tokens.css`.
