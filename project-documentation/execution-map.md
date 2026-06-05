# Execution map

> **The single answer to "what do I work on next?"** — focused, ordered, _next session only_.
>
> **Read with siblings:**
>
> - [`plan.md`](./plan.md) — full roadmap, granular ordered backlog, open decisions. Skim before changing scope.
> - [`last-point.md`](./last-point.md) — what was actually done in the last session, current working tree.
> - [`../CLAUDE.md`](../CLAUDE.md) — architectural source of truth.
>
> **Maintenance:** Update at the **start** of every session (confirm the active chunk is still right) and at the **end** of every session (set the next chunk). Skill `updating-execution-map` at `.claude/skills/updating-execution-map/SKILL.md` codifies the protocol.

---

## 1. Active chunk — what to build next

**Chunk 6b — Schema i18n simplification (plain single-language fields).**

**Goal:** Rework the Chunk 4 schema from field-level `{ tr, en }` locale objects to plain single-language fields, per OD-6 (resolved 2026-06-05 → Option 1, logged in CLAUDE.md §12). This unblocks Chunk 7: queries become plain projections instead of `coalesce(field[$locale], …)`.

**Done when:**

- The four `locale*` object types (`localeString`, `localeText`, `localeSlug`, `localePortableText`) are deleted from `apps/studio/schemas/` and unregistered from `schemas/index.ts`.
- Every document/object schema field that used a `locale*` type now uses plain `string` / `text` / `slug` / portable-text array. Turkish titles, descriptions, and validation survive the swap.
- `@sanity/language-filter` is removed from `apps/studio/package.json` and `sanity.config.ts`; any locale-detection plumbing (the name-prefix check) is gone.
- `siteSettings` no longer has `activeLocales` (nor any other field that existed only for i18n, e.g. `defaultLocale`).
- `pnpm --filter @vetkit/studio typegen` regenerates `packages/sanity-types/` with no `Locale*` types in `generated.ts`; `apps/web/types/sanity.ts` still compiles.
- `pnpm typecheck` / `pnpm lint` / `pnpm build` pass across the workspace.

**Depends on:** Chunks 4, 6 (both shipped 2026-05-26).

**Open decisions that affect this chunk:**

- None — OD-6 resolved 2026-06-05 (this chunk *is* the resolution's implementation). OD-3 (CI timing) is open but does not block.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `refactor(studio): replace locale object fields with plain single-language fields`
2. `refactor(studio): drop language-filter plugin and locale plumbing`
3. `chore(studio): regenerate sanity types after i18n simplification`

Chunk 7 (shared Sanity infra in `apps/web/lib/sanity/`) follows immediately — its locked decisions (`next-sanity`, OD-5 cache tags `sanity:<type>:<id>`, `vetkit-dev` sandbox project) are in plan.md §2 row 7 and CLAUDE.md §12. The owner creates `vetkit-dev` once this chunk ships; projectId lands in gitignored `apps/web/.env.local` + `apps/studio/.env.local`.

---

## 2. Pickup protocol — start of every session

1. **Read [`last-point.md`](./last-point.md)** to confirm the snapshot of where things stopped.
2. **Cross-check with `git log --oneline -5` and `git status`** — does reality match the snapshot? If not, update last-point.md before doing any work (use `writing-last-point` skill).
3. **Confirm the active chunk above (§1) is still right.** If [`plan.md`](./plan.md) was reordered or a decision was resolved since last session, adjust §1 before starting work.
4. **Skim open decisions in [`plan.md`](./plan.md) §3** — does the active chunk depend on an unresolved one? Raise it now, not after the chunk is half-done.
5. **Do the work.** Commit per `.claude/skills/writing-commits/SKILL.md`.

---

## 3. Wrap-up protocol — end of every session

1. **Refresh [`last-point.md`](./last-point.md)** — last commit hash, what got done, anything left dangling (use `writing-last-point` skill).
2. **Update §1 of this file** — set the new active chunk for the next session (use `updating-execution-map` skill).
3. **Update [`plan.md`](./plan.md)** — check off completed items, log resolved decisions in CLAUDE.md §12, reorder if scope shifted (use `updating-plan` skill).
4. **Commit the doc updates** as topical `docs(*)` commits — usually `docs(last-point): ...`, `docs(execution-map): ...`, `docs(plan): ...`, each separate.

This file should never go more than one chunk out of date.
