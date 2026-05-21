---
name: updating-plan
description: Use when a chunk completes, an open decision resolves, the phase backlog reorders, or scope shifts in or out of any phase. Keeps project-documentation/plan.md authoritative as the source of truth for what gets built, in what order, in the vetkit project.
---

# Updating plan.md

## Overview

`project-documentation/plan.md` is the master plan for vetkit. CLAUDE.md tracks *decisions and conventions*; plan.md tracks *work to be done, in order, with checkboxes*. Drift between code reality and plan.md erodes trust in the doc fast — update it deliberately at the moments below, never reactively or from memory.

## When to update

| Trigger | What to change |
|---|---|
| A chunk completes (committed and on `main`) | Check the box in §1 (Phase roadmap) **and** in §2 (ordered backlog) for that chunk. |
| An open decision (OD-N) is resolved | Remove from §3 (Open decisions). Append an entry to `CLAUDE.md` §12 (Decision log) instead. |
| Phase 1 backlog order changes | Update §2 *and* note the reason in `CLAUDE.md` §12. Adjust the **Depends on** column if dependencies shifted. |
| New scope is pulled in | Add a row in §1 (right phase) and §2 (with depends-on, size, notes). |
| Scope is pushed out (deferred to a later phase) | Move the row from its current phase to the new one. Add to the "Explicitly out of Phase 1" list if relevant. |
| A new open decision surfaces | Add as OD-N+1 in §3 with: the decision, why it matters, when it must be resolved. |

## Update protocol

1. **Read `project-documentation/plan.md` in full** before editing. Don't edit from memory — drift hides in small diffs.
2. **Make the edit minimally.** Don't rewrite untouched sections. Preserve checkbox state for items that didn't change.
3. **Sync §1 and §2.** A chunk shipped means *both* sections get checked. If they fall out of sync the doc loses credibility.
4. **Cross-references** — if the change touches a decision, update `CLAUDE.md` §12 in the same edit pass. If it touches the next session's focus, also update `project-documentation/execution-map.md` (use the [[updating-execution-map]] skill).
5. **Commit separately.** Use `docs(plan): <what changed>` — do not mix plan changes with feature code in one commit. Follow `.claude/skills/writing-commits/SKILL.md`.

## Hard rules

- **Never delete checked-off items.** Done work is a record. If something needs to be redone, add a new line — don't unmark the original.
- **Never leave a chunk half-checked.** Either the chunk shipped (check both §1 and §2) or it didn't (leave both unchecked). No mixed state.
- **OD entries leave §3 only when actually decided.** "We'll figure it out later" is not a resolution — leave it open.
- **Phase 2+ items stay coarse-grained** until they become Phase 1's "next." Don't pre-detail Phase 2-4 backlogs — it's wasted speculation.
- **Don't touch CLAUDE.md sections other than §12.** plan.md does not own architectural decisions; the decision log is the only place plan-driven changes belong in CLAUDE.md.

## Common mistakes

| Mistake | Reality |
|---|---|
| Checking off in §1 but not §2 (or vice versa) | §2 is the granular truth; both must reflect ship. |
| Removing an OD without logging it in CLAUDE.md §12 | Decision history disappears. Always log resolutions in §12. |
| Editing plan.md in the same commit as the feature | Feature commits should be reviewable on their own. Doc commit is separate. |
| Rewriting the whole file for one change | Bloats diff, hides what actually changed. Edit narrowly. |
| Marking a chunk done before it's committed to `main` | Half-shipped ≠ shipped. Check after the commit lands. |

## Red flags — STOP and reconsider

- About to delete a checked-off item — *don't*, it's a record.
- About to add an "open decision" that's really just an undecided implementation detail — that belongs in the chunk's notes in §2, not in §3.
- Updating plan.md but skipping execution-map.md when the next chunk just shifted — both files must stay in sync.
- Bulk re-checking many items at once based on memory — re-derive from `git log` instead.

## Common rationalizations

| Excuse | Reality |
|---|---|
| "It's a tiny edit, no need to read the file first" | Drift starts here. Always read before editing. |
| "I'll mark this done now and commit later" | Don't. The check follows the commit, not the other way around. |
| "I'll bundle plan + execution-map + feature into one commit" | Bundling kills reviewability. Three commits. |
| "Phase 2 needs more detail right now" | Speculation. Detail Phase 2 only when it becomes Phase 1's "next." |
