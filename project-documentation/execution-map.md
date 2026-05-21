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

**Chunk 1 — Tailwind CSS v4 + token system in `apps/web`.**

**Goal:** Install Tailwind v4 in `apps/web`, define the design-token contract (CSS variables for brand color, fonts, etc. so Sanity `siteSettings` can override them at runtime per CLAUDE.md §2.5), and replace the placeholder inline styles in the home page so we know the wiring works end-to-end.

**Done when:**
- `apps/web` builds (`pnpm --filter @vetkit/web build`) and dev-runs with Tailwind classes applied.
- A `tokens.css` (or equivalent) declares the CSS variables that templates will read.
- The placeholder home page is restyled with Tailwind utilities — **no inline styles remain**.
- A `packages/config-tailwind/` shared preset exists *only* if the config grows non-trivial; otherwise leave it inline in `apps/web` and extract later.

**Depends on:** nothing.

**Open decisions that affect this chunk:** OD-5 (where do `tokens.css` brand variables live in Phase 1?). Resolve during the chunk — don't defer past it.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):
1. `feat(web): add Tailwind v4 with PostCSS plugin and base config`
2. `feat(web): add tokens.css with brand color, font, and spacing CSS variables`
3. `refactor(web): replace placeholder inline styles with Tailwind utilities`

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
