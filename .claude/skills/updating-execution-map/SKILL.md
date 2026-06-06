---
name: updating-execution-map
description: Use at the start of every session (confirm the active chunk is still right) and at the end of every session (set the next chunk). Also use whenever the immediate next-chunk focus shifts mid-session in the vetkit project.
---

# Updating execution-map.md

## Overview

`project-documentation/execution-map.md` answers exactly one question: **"What do I work on next?"** It holds the active chunk for the _upcoming_ session — not the whole backlog (that's [[updating-plan]]'s plan.md), not the rear-view (that's [[writing-last-point]]'s last-point.md). Keep it sharp; if it drifts, every session starts with confusion.

## When to update

| Moment                                  | What to do                                                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Start of session**                    | Read §1. Cross-check against [`last-point.md`](../../../project-documentation/last-point.md) and `git log --oneline -5`. If reality moved, fix §1 before doing any work. |
| **End of session**                      | Set the new active chunk in §1. Pull the next item from [`plan.md`](../../../project-documentation/plan.md) §2. Rewrite "Goal" and "Done when" for the new chunk.        |
| **Mid-session, when the chunk changes** | If you finish Chunk N and start Chunk N+1 in the same session, update §1 before working on N+1 — so a future read picks up the new focus.                                |
| **When dependencies shift**             | If the active chunk is suddenly blocked, swap in the next viable chunk and explain why in the "Depends on" line.                                                         |

## Update protocol

1. **Read `project-documentation/execution-map.md` in full** first. Don't edit from memory.
2. **Set §1 to a single chunk.** Not two. Not "Chunk 1 and 2 in parallel." One focus. If two chunks are genuinely parallel, that's an exception — say so explicitly in "Notes."
3. **Pull from [`plan.md`](../../../project-documentation/plan.md) §2.** Don't invent a chunk that isn't in the backlog. If the work is genuinely new, add it to plan.md §2 first (use [[updating-plan]]).
4. **Include all four sub-sections** for the active chunk: Goal, Done when, Depends on, Open decisions that affect this chunk.
5. **Don't change §2 (Pickup protocol) or §3 (Wrap-up protocol)** unless the protocol itself is changing. Those sections are stable infrastructure.
6. **Commit with the other wrap docs** in the session's single combined docs commit (e.g. `docs(project): wrap chunk N` — owner preference, 2026-06-06). Follow `.claude/skills/writing-commits/SKILL.md`.

## Hard rules

- **Exactly one active chunk.** If you can't pick one, you're either not done with the previous chunk or the plan needs splitting (use [[updating-plan]]).
- **"Done when" criteria must be testable.** "Tailwind works" is not testable. "Dev server renders a Tailwind-styled page and `pnpm --filter @vetkit/web build` succeeds" is.
- **Never reference a chunk not in plan.md §2.** Sync the two files; plan.md is upstream of execution-map.md.
- **No historical chunk content in this file.** When a chunk completes, that history goes to [`last-point.md`](../../../project-documentation/last-point.md). execution-map.md is forward-looking only.

## Common mistakes

| Mistake                                                                             | Reality                                                                                       |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Leaving the previous chunk's content under §1 alongside the new one                 | This file is single-focus. Replace, don't append.                                             |
| Vague "Done when" criteria like "tailwind installed"                                | Future-you needs an objective test. Write it that way.                                        |
| Picking a chunk whose dependencies aren't ready                                     | Check `Depends on` in plan.md §2 first. Pull the next _viable_ chunk.                         |
| Updating execution-map.md but forgetting to check off the previous chunk in plan.md | Both files must agree on what's done. Use [[updating-plan]] in the same pass.                 |
| Treating this file as a rolling log of recent chunks                                | It's not a log. It's a forward-looking pointer. Logs live in last-point.md history (via git). |

## Red flags — STOP and reconsider

- More than one active chunk listed in §1 without an explicit "parallel" annotation.
- "Done when" criteria that can't be verified by reading code or running a command.
- The active chunk depends on an unresolved open decision and you didn't flag it.
- You're about to start work but execution-map.md still shows last session's chunk — _update it first_.
- Chunk listed in §1 isn't in plan.md §2 — fix plan.md first.

## Common rationalizations

| Excuse                                                         | Reality                                                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| "I'll just start the next chunk and update the file later"     | "Later" never comes. Update first, work second.                                               |
| "The previous chunk's notes are still useful, I'll leave them" | They belong in last-point.md history, not here. Replace.                                      |
| "Parallel chunks are fine if I'm careful"                      | Parallel = exception, not norm. State it explicitly with a reason or split into two sessions. |
| "I know what the next chunk is, I don't need to write it down" | Write it down. Next-session-you doesn't have your mental model.                               |
