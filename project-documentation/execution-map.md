# Execution map

> **The single answer to "what do I work on next?"** — focused, ordered, *next session only*.
>
> **Read with siblings:**
> - [`plan.md`](./plan.md) — full roadmap, granular ordered backlog, open decisions. Skim before changing scope.
> - [`last-point.md`](./last-point.md) — what was actually done in the last session, current working tree.
> - [`../CLAUDE.md`](../CLAUDE.md) — architectural source of truth.
>
> **Maintenance:** Update at the **start** of every session (confirm the active chunk is still right) and at the **end** of every session (set the next chunk). Skill `updating-execution-map` at `.claude/skills/updating-execution-map/SKILL.md` codifies the protocol.

---

## 1. Active chunk — what to build next

**Chunk 2 — ESLint flat config: `packages/config-eslint` + per-app `eslint.config.mjs`.**

**Goal:** Replace the placeholder `lint` scripts in `apps/web` and `apps/studio` (which currently just `echo`) with a real ESLint flat-config setup. Create `packages/config-eslint` as a shared preset (TypeScript + React + Next.js rules), wire each app to consume it via its own `eslint.config.mjs`, and make `pnpm lint` at the repo root run lint across both workspaces.

**Done when:**
- `packages/config-eslint/` exists with a flat-config preset that exports rule sets for `nextjs` and `react-library` targets.
- `apps/web/eslint.config.mjs` and `apps/studio/eslint.config.mjs` consume the preset.
- `pnpm --filter @vetkit/web lint` actually runs ESLint (not `echo`) and exits 0 on the current codebase.
- `pnpm --filter @vetkit/studio lint` does the same.
- `pnpm lint` at the root runs both via Turborepo.
- **No reliance on `next lint`** — it was removed in Next 16; ESLint is invoked directly per Next 16's migration guidance.

**Depends on:** nothing.

**Open decisions that affect this chunk:** none directly. OD-2 (Husky vs CI-only) is the next chunk's blocker; OD-3 (CI timing) is downstream. Flag both if work expands.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):
1. `feat(packages): add @vetkit/config-eslint shared flat-config preset`
2. `feat(web): wire @vetkit/web to the shared ESLint preset and run lint`
3. `feat(studio): wire @vetkit/studio to the shared ESLint preset and run lint`

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
