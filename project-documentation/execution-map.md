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

**Chunk 6 — `sanity-typegen` → `packages/sanity-types/`.**

**Goal:** Generate TypeScript types from the Sanity schema so the web app can consume them in a type-safe way. Land them in a shared workspace package (`packages/sanity-types/`) that `apps/web` imports via `@vetkit/sanity-types`. Re-run on every schema change.

**Done when:**

- `packages/sanity-types/` exists with its own `package.json` (name `@vetkit/sanity-types`, `private: true`).
- A generation step runs against `apps/studio/schemas/index.ts` and emits a `generated.ts` (or similar) into `packages/sanity-types/`. Use Sanity's official `sanity typegen` CLI (v5 ships with `sanity@5` — verify the exact command and flags before settling on `sanity-codegen` vs the built-in).
- The emitted types cover all 8 document types and the 11 reusable objects.
- `apps/web` is wired to import from `@vetkit/sanity-types` (a `pnpm-workspace.yaml` entry is already present for `packages/*`; just ensure `@vetkit/sanity-types` resolves).
- A root npm script (e.g. `pnpm typegen` or `pnpm --filter @vetkit/studio typegen`) regenerates types; document it in the README or PROJECT-ARCHITECTURE.md.
- The generated file is checked in (small, regenerable; checked-in to avoid an install-time codegen step in CI/Vercel).
- `pnpm typecheck` / `pnpm lint` / `pnpm build` all pass.

**Depends on:** Chunk 4 (schema in place).

**Open decisions that affect this chunk:**

- **`sanity-codegen` (community) vs `sanity typegen` (official, v5).** Verify which is the current best practice for Sanity v5. The plan note still says "sanity-codegen" but the official CLI may be the cleaner fit now. Resolve before writing the generation script.
- None of OD-3 / OD-4 affect this chunk.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `chore(workspace): scaffold packages/sanity-types with package.json + tsconfig`
2. `feat(studio): wire the typegen command (sanity typegen or sanity-codegen) and emit generated.ts`
3. `feat(web): import sanity types from @vetkit/sanity-types`
4. `docs(architecture): document the typegen workflow in PROJECT-ARCHITECTURE.md`

Chunk 7 (shared Sanity infra in `apps/web/lib/sanity/`) is the natural follow-up — once types exist, the GROQ query helpers can be written against them.

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
