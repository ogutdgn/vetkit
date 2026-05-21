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

**Chunk 4 — Sanity schema (Phase 1) — the keystone.**

**Goal:** Implement the full Phase 1 Sanity schema in `apps/studio/schemas/` per CLAUDE.md §5: all required document types, all reusable objects, singleton enforcement for `siteSettings`, and a Turkish-friendly document structure. Read `old-sites/gigi-veteriner/` and `old-sites/ovapark-veteriner/` first to inform field shapes (don't constrain to them — design as a _superset_ of what the old sites had).

**Done when:**

- All document types from §5 exist: `siteSettings` (singleton), `service`, `blogPost`, `teamMember`, `faq`, `galleryImage`, `page`.
- All reusable objects exist: `seo` (metaTitle/metaDescription/ogImage), `openingHours` (day-by-day), `socialLinks` (instagram/facebook/x/youtube/tiktok), `cta` (label/link).
- Every public-URL document embeds the `seo` object.
- Every image field has `hotspot: true`.
- Rich-text (Portable Text) is constrained: marks `strong`/`em`/`link`, block styles `normal`/`h2`/`h3`/`blockquote` (no h1).
- `siteSettings` enforced as a singleton via the Studio's custom desk structure (or stop-gap workaround) — exactly one document per Sanity project.
- All schemas exported from `apps/studio/schemas/index.ts`.
- `pnpm --filter @vetkit/studio dev` opens Studio with the new schemas visible; documents of each type can be created and saved.
- `pnpm --filter @vetkit/studio typecheck` and `lint` both pass.

**Depends on:** **OD-1 must be resolved first.** Picking Sanity v3 vs v4 vs v5 changes the schema authoring API and the singleton-enforcement plumbing. Don't start until the version is locked.

**Open decisions that affect this chunk:**

- **OD-1 (Sanity major version)** — blocker. Resolve before any schema code.
- Field-level questions will surface as we go (e.g. should `service` have `pricing`? does `teamMember` need a `credentials` field?). Capture new ODs in `plan.md` §3 as they appear rather than deciding silently.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `chore(studio): pin Sanity major version per OD-1 resolution` (if we upgrade)
2. `feat(studio): add reusable objects (seo, openingHours, socialLinks, cta)`
3. `feat(studio): add siteSettings singleton with desk-structure enforcement`
4. `feat(studio): add service and blogPost document types with SEO`
5. `feat(studio): add teamMember, galleryImage, faq, page document types`
6. `docs(schema): document the Phase 1 schema in project-documentation/SCHEMA.md`

Chunk 5 (Turkish localization + polished desk structure) is the natural follow-up.

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
