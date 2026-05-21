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
**Last commit on `main`:** `702ba59 docs(execution-map): flag Chunk 4 as paused mid-brainstorm`
**Working tree:** clean (this file is the only pending change, committed in the next `docs(last-point): ...` commit).

## What's running

- Monorepo skeleton (pnpm workspaces + Turborepo) in place.
- `apps/web` builds and dev-runs with **Tailwind v4** + Inter font + modern template tokens. `pnpm --filter @vetkit/web build` clean (last verified 2026-05-20).
- `apps/studio` wired to env-driven Sanity v3.99 config — **no schemas yet**. Chunk 4 will bump to **v4** per OD-1 resolution (locked in brainstorm).
- **ESLint flat-config + Husky + lint-staged** pre-commit fully active. Every commit auto-runs `eslint --fix` + `prettier --write` on staged JS/TS/MJS, `prettier --write` on docs/styles. Verified working across multiple sessions.
- `pnpm typecheck` passes for both apps; `pnpm lint` at root runs both via Turbo (~2.9s cold).

## What was done in this session

This session spanned 2026-05-20 → 2026-05-21 and shipped two infrastructure chunks plus brainstormed the schema.

- **Chunks 2-3 shipped earlier in the session** (ESLint flat-config + Husky pre-commit). See the previous last-point snapshot in git history (`docs(last-point): refresh after Chunks 2-3 (ESLint + Husky)`) for details — those commits are `c570f55`, `8d3187b`, `0c20426` and the doc commits around them.
- **Chunk 4 brainstorm started, paused mid-design.** Locked decisions on Sanity version, i18n pattern, locales, and schema-shape rules. Ran the old-sites audit. Drafted a design overview (7 doc types, 11 reusable objects, Studio config). Did **not** finish: 6 open discussion points remain, and the final spec doc hasn't been written. Everything captured in [`project-documentation/working-notes/2026-05-21-chunk-4-brainstorm.md`](./working-notes/2026-05-21-chunk-4-brainstorm.md) — this is a **temporary file** that gets deleted when Chunk 4 ships.
- **Updated [`execution-map.md`](./execution-map.md) §1** with a "paused mid-brainstorm" note pointing to the working-notes doc.

## What is NOT yet set up

Standing inventory — cross off as items ship.

- ~~Tailwind CSS v4~~ ✓ 2026-05-20.
- ~~ESLint flat config~~ ✓ this session.
- ~~Husky / lint-staged~~ ✓ this session.
- **Sanity schema (Chunk 4) — design ~75% complete (paused), implementation not started.**
- shadcn/ui.
- SEO helpers.
- Sanity client wrapper, GROQ queries, draft mode helpers (Chunk 7).
- Template contract + rest of `templates/modern/`.
- Marketing pages.
- Contact form + Resend.
- Revalidation route + Sanity webhook (Chunk 13).
- GitHub Actions CI.
- Vercel deployment.

## Open decisions still pending

See [`plan.md`](./plan.md) §3 and the brainstorm doc.

- **OD-1 (Sanity major version):** _resolved in brainstorm → **v4**_, but not yet promoted to CLAUDE.md §12 (will be on Chunk 4 ship).
- **OD-3** (CI timing) — open.
- **OD-4** (Studio hostname pattern) — open.
- **6 Chunk 4 micro-decisions** in [working-notes brainstorm doc](./working-notes/2026-05-21-chunk-4-brainstorm.md): `service.pricing` UI visibility, `page` doc vs `aboutPage` singleton, `teamMember.name` localization, `emergencyBanner` location, `testimonial` Phase 1 inclusion, `service.responsibleVets` necessity.

## Heads-up for the next session

- Active chunk is still **Chunk 4 — Sanity schema**. Status: paused mid-brainstorm.
- **First action:** read [`working-notes/2026-05-21-chunk-4-brainstorm.md`](./working-notes/2026-05-21-chunk-4-brainstorm.md) in full. It has all locked decisions, audit findings, design overview, and the 6 open points.
- **Second action:** resolve the 6 open discussion points (quick yes/no for each — they're listed at the bottom of the brainstorm doc).
- **Third action:** promote the design overview into a final spec doc at `project-documentation/specs/<today>-sanity-schema-design.md`, self-review per `writing-skills`, then ask the user to review.
- **Fourth action (on approval):** invoke `superpowers:writing-plans` skill to draft the implementation plan, then execute per Chunk 4's suggested commit split in [`execution-map.md`](./execution-map.md) §1.
- **Cleanup reminder:** when Chunk 4 ships, **delete** the working-notes brainstorm doc in the same commit that adds the final spec. Don't leave stale WIPs in `working-notes/`.
- Husky pre-commit is active — every commit auto-runs lint+format. Already verified working.
