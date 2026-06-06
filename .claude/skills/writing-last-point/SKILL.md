---
name: writing-last-point
description: Use before closing a chat session, before any major operation that could end the session (multi-file refactor, deploy, schema migration, large dependency install), or whenever the working tree state is about to change significantly in the vetkit project. Snapshots the state so the next session picks up cold.
---

# Writing last-point.md

## Overview

`project-documentation/last-point.md` is the **session-boundary snapshot**: last commit hash, what's running, what was done in _this_ session, what's still dangling, what to expect when picking up. Without it, future-you starts with five minutes of `git log` archeology. With it, seconds.

Refresh aggressively. It's cheap; staleness is what costs.

## When to refresh

| Moment                                                      | Why                                                                                                                                |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Before closing the chat / wrapping up**                   | Critical. This is the file next-session-you opens first.                                                                           |
| **Before any major operation** that could destabilize state | If a multi-file refactor or deploy goes sideways and the session ends abruptly, the pre-op snapshot is what saves the next pickup. |
| **After a significant chunk lands mid-session**             | Update even if not closing — the snapshot keeps pace with reality.                                                                 |
| **When the working tree shifts unexpectedly**               | E.g. a `pnpm install` modified the lockfile, a generated file changed. Capture before continuing.                                  |

## Required sections

Every snapshot has these eight sections — fill all of them every refresh:

1. **Snapshot date** — today's absolute date in `YYYY-MM-DD`.
2. **Last commit on `main`** — full one-line `git log -1 --oneline` output, hash included.
3. **Working tree** — `clean`, or specifics of uncommitted changes (staged + unstaged + untracked).
4. **What's running** — which apps boot, what tests pass, what's verified working.
5. **What was done in this session** — bullets of _actual_ changes (commits + uncommitted edits + decisions made + skills/docs added). Be specific; this is the diff between sessions.
6. **What is NOT yet set up** — the standing inventory of Phase 1 gaps. Carry forward from the previous snapshot; cross off what shipped.
7. **Open decisions still pending** — short pointer to `plan.md` §3, plus any new ODs that surfaced this session.
8. **Heads-up for the next session** — active chunk, landmines (uncommitted edits, half-finished migrations, locally-running services).

## Refresh protocol

1. **Read the current `project-documentation/last-point.md`** first.
2. **Run `git log --oneline -5` and `git status`** — capture real state, not what you remember.
3. **Rewrite each required section.** This file is meant to be fully replaced each refresh, not incrementally patched — the previous snapshot is preserved in git history if needed.
4. **Don't speculate** in "What was done in this session." Only list things that actually happened (files written, commits made, decisions confirmed). No "I plan to also..." entries — those belong in [[updating-execution-map]]'s execution-map.md.
5. **Cross-link.** If "What was done" includes a plan/scope change, link to [`plan.md`](../../../project-documentation/plan.md); if it changes the next chunk, link to [`execution-map.md`](../../../project-documentation/execution-map.md).
6. **Commit with the other wrap docs** in the session's single combined docs commit (e.g. `docs(project): wrap chunk N` — owner preference, 2026-06-06), usually the _last_ commit of a session. Follow `.claude/skills/writing-commits/SKILL.md`.

## Hard rules

- **Always include a real `git log -1 --oneline` hash.** Don't write "latest commit" — write the actual hash and message.
- **Never lie about working tree state.** If there are uncommitted changes, list them. Hiding them is how next-session-you breaks things.
- **"What was done in this session" is descriptive, not aspirational.** Past tense, completed items only. Aspirations go to execution-map.md / plan.md.
- **Never leave more than one session's work undescribed.** If two sessions pile up without a refresh, the next pickup is painful. Refresh at every boundary.
- **Don't trim the "What is NOT yet set up" inventory** by deleting unimplemented items. Cross them off only when they actually ship.

## Common mistakes

| Mistake                                                           | Reality                                                                                        |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Skipping refresh because "the session was short"                  | Short sessions still moved state. Snapshot it.                                                 |
| Listing "we discussed X" in "What was done"                       | If it wasn't written, committed, or otherwise persisted, it didn't happen.                     |
| Copying the previous snapshot verbatim with minor edits           | Re-derive from `git log` + `git status` each time. Stale snapshots are worse than no snapshot. |
| Forgetting to cross off shipped items in "What is NOT yet set up" | Inventory drifts. Cross off every time.                                                        |
| Refreshing only at chat close (not before big ops)                | Big ops can crash mid-flight. Snapshot _before_, not after, the risky move.                    |

## Red flags — STOP and reconsider

- Snapshot says "clean working tree" but `git status` shows uncommitted edits — reconcile before saving.
- "What was done" mentions plans or hopes, not actual changes — strip them.
- No commit hash in §2 — never ship a snapshot without one.
- About to close a chat without refreshing — _don't_. This is the highest-value moment for the file.
- About to run a destructive op (e.g. `git reset --hard`, mass rename, deploy) without a snapshot — refresh _first_.

## Common rationalizations

| Excuse                                  | Reality                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| "I'll remember what I did"              | You won't, and even if you do, next-session-you isn't you.                                  |
| "The previous snapshot is close enough" | "Close enough" hides exactly the state changes that matter.                                 |
| "Refresh takes too long"                | 90 seconds of `git status` + edit. Faster than re-deriving the state next session.          |
| "Nothing important changed"             | If nothing changed, no refresh needed — but verify with `git status` before believing that. |
