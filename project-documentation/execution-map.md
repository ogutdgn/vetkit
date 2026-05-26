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

**Chunk 5 — Sanity Studio Turkish polish + ergonomic cleanup.**

The schema, custom desk structure, singleton enforcement, language-filter wiring, and orderable lists all shipped with Chunk 4 on 2026-05-26 — they were originally planned to spill into Chunk 5 but came along for the ride. Chunk 5's scope therefore narrows to the **Studio chrome and editor UX** that wasn't covered yet.

**Goal:** Make the Studio feel finished to a Turkish-speaking clinic owner who has never used a CMS before. Audit the rendered UI against a fresh dataset, surface remaining English strings (Sanity's own chrome, plugin labels, validation messages), and tighten any edit-state friction.

**Done when:**

- `pnpm --filter @vetkit/studio dev` opens Studio against a scratch dataset and the **left-rail menu, doc-type lists, field labels, field descriptions, validation messages, and language-filter dropdown** are all Turkish.
- Sanity Studio's own chrome (top bar, menus) is set to Turkish via the v5 i18n bundle config in `sanity.config.ts` (Sanity v5 ships locale bundles; we register the `tr` bundle and set it as default).
- Empty-state messages where a clinic has no `service` / `blogPost` / `teamMember` / `faq` / `galleryImage` / `testimonial` / `page` documents are friendly and in Turkish.
- Each of the 8 doc types can be created and saved with the minimum required fields; required-field validation fires with Turkish messages.
- One full editorial dry-run: create a `siteSettings` document, one `service`, one `blogPost` referencing a `teamMember`, one `page` — all save cleanly. Notes go into a follow-up working-notes doc only if friction is found.
- `pnpm --filter @vetkit/studio typecheck` / `lint` / `build` still pass; `pnpm --filter @vetkit/web build` still passes (no cross-app breakage).

**Depends on:** Chunk 4 (shipped 2026-05-26).

**Open decisions that affect this chunk:**

- None directly. OD-3 (CI) and OD-4 (Studio hostname) are tracked in [`plan.md`](./plan.md) §3 but don't block Chunk 5.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `feat(studio): register the turkish i18n bundle and set it as default`
2. `feat(studio): polish desk structure empty-state and list labels`
3. `feat(studio): turkish-ify validation messages where defaults leak english`
4. `docs(studio): note the editorial dry-run outcome in working-notes (if friction surfaced)`

Chunk 6 (`sanity-codegen` → `packages/sanity-types/`) is the natural follow-up — once the schema feels stable to editors, generate the TS types for the web app to consume.

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
