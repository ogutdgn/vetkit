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

**Chunk 10 — `templates/modern/` — all components, polished.**

**Goal:** The first visual work in the project: build the `modern` template's six components against the Chunk 9 contract, wire the `getTemplate()` loader, and connect the §2.5 brand-token pipeline (Sanity `brandColor` → CSS variables). The design is deliberately modern (CLAUDE.md §7: old sites are content reference, NOT visual reference). `vetkit-dev` is seeded, so every component renders real content ("Pati Veteriner Kliniği", 5 services, 3 team members) during development.

**Locked context:**

- The contract is `apps/web/types/template.ts` — exact component names/props, typed against query projections. A mismatch is a compile error by design.
- Styling: Tailwind utilities + the CSS variables in `templates/modern/tokens.css` ONLY (anti-pattern #11 — no custom CSS files). Brand overrides per §2.5: a server component fetches `siteSettings` and writes `brandColor` (etc.) as inline CSS vars on the root layout element, overriding tokens.css defaults.
- Images through `urlFor` (lib/sanity/image.ts) + `next/image` (cdn.sanity.io already allowed in next.config.ts).
- Fonts: Inter is already wired via `next/font` (`--font-inter`).
- shadcn/ui primitives only if genuinely needed — that's Chunk 14, pull it in only when the first primitive is unavoidable.

**Done when:**

- `templates/modern/` contains `Header.tsx`, `Hero.tsx`, `ServiceCard.tsx`, `BlogCard.tsx`, `TeamSection.tsx`, `Footer.tsx` and an `index.ts` whose default export satisfies `ThemeComponents` (compile-checked, no casts).
- `lib/template.ts` exists with the `getTemplate()` loader from CLAUDE.md §6 (dynamic import per `TEMPLATE` env, default `modern`).
- The §2.5 brand pipeline works: `siteSettings.brandColor.hex` overrides the token defaults at runtime (verify by changing the color in Studio and reloading dev).
- The home page renders through the template (`getTemplate()` → Header + Hero + service cards + Footer with seeded content) — it becomes the real home in Chunk 11.
- Components are responsive (mobile-first), semantic (single h1 per page, nav/main/footer landmarks), and accessible (alt texts from Sanity, focus states).
- `pnpm typecheck` / `pnpm lint` / `pnpm build` pass; visual check on the dev server against seeded content.

**Depends on:** Chunks 1 (tokens), 9 (contract) — shipped. Dataset seeded 2026-06-05.

**Open decisions that affect this chunk:**

- None blocking. OD-3 (CI timing) is open but does not block this chunk.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `feat(web): add template loader keyed on TEMPLATE env`
2. `feat(web): add modern header and footer`
3. `feat(web): add modern hero`
4. `feat(web): add modern service, blog, and team components`
5. `feat(web): wire brand tokens from siteSettings into the root layout`
6. `feat(web): render the home page through the modern template`
7. `docs(architecture): document the template loader and modern template`

Chunk 11 (marketing pages) follows — by far the largest remaining chunk; it consumes everything built so far (queries, SEO helpers, template components).

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
