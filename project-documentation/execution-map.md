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

**Chunk 9 — Template contract (`apps/web/types/template.ts`).**

**Goal:** Lock the TypeScript contract every template must satisfy: the shared prop interfaces and the `ThemeComponents` interface from CLAUDE.md §6. This is deliberately small — it forces the data-shape decisions (what does a `Header` actually receive?) before the `modern` template (Chunk 10) is built against them, and it makes a misnamed/misshapen template a compile error by definition.

**Locked context:**

- CLAUDE.md §6 sketches the contract: `HeaderProps` (settings + navItems), `HeroProps`, `ServiceCardProps`, `BlogCardProps`, `TeamSectionProps`, `FooterProps` → `ThemeComponents` with exactly those component names. §2.4: no template-specific fields; one schema for all templates.
- **Design point to settle while writing (not an OD — decide in-chunk):** props should be typed against the _query-result_ shapes pages actually fetch (e.g. `ServicesListQueryResult[number]`), not raw document types — a card never receives a full `Service` doc. Keep the contract aligned with `queries.ts` projections; add projections to queries if a template genuinely needs more.
- Folder structure ships day-one per §2.4: `templates/classic/README.md` and `templates/premium/README.md` placeholders ("not yet implemented"); `templates/modern/` already holds `tokens.css`.
- The `getTemplate()` loader (`lib/template.ts`, CLAUDE.md §6) needs `templates/modern/index.ts` to exist — that lands with Chunk 10, not here.

**Done when:**

- `apps/web/types/template.ts` exists and exports every prop interface plus `ThemeComponents`, typed against generated Sanity query-result types (no `any`, no template-specific fields).
- `apps/web/templates/classic/README.md` and `apps/web/templates/premium/README.md` exist as placeholders explaining "not yet implemented" (per CLAUDE.md §2.4).
- `pnpm typecheck` / `pnpm lint` / `pnpm build` pass.

**Depends on:** Chunks 6 (types), 7 (query shapes) — both shipped.

**Open decisions that affect this chunk:**

- None blocking. OD-3 (CI timing) is open but does not block this chunk.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `feat(web): add theme components template contract`
2. `chore(web): add classic and premium template placeholders`

Chunk 10 (`templates/modern/` — all components, polished, L-size) follows: the first visual work in the project. Consider seeding `vetkit-dev` with a siteSettings doc + a few services first so components render real content during development.

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
