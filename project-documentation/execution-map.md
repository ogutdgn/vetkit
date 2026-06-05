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

**Chunk 8 — SEO helpers in `apps/web/lib/seo/` + the SEO route files.**

**Goal:** Give every page typed, consistent SEO output: `generateMetadata` helpers that merge a document's embedded `seo` object with `siteSettings.defaultSeo` fallbacks, JSON-LD structured data for local SEO, and the sitewide SEO route files (`sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`). This was one of the three problems vetkit exists to solve (CLAUDE.md §1.3) and Chunk 11's pages consume these helpers directly.

**Locked context:**

- Data comes through Chunk 7's layer: `sanityFetch` + `defineQuery` + OD-5 tags (`sanity:<type>:list` for sitemap queries). Published client is origin-only (`useCdn: false`).
- JSON-LD types per CLAUDE.md §4: `LocalBusiness` / `VeterinaryCare` built from `siteSettings` (address, phone, openingHours, coordinates).
- OG images via Next 16's `ImageResponse` (plan.md row 8 note).
- The `seo` object shape (SCHEMA.md): `metaTitle` (string), `metaDescription` (text), `ogImage` (image, alt required), `noIndex` (boolean).
- Turkish-only sites: `NEXT_PUBLIC_DEFAULT_LOCALE=tr-TR` is the html-lang/OG locale.

**Done when:**

- `apps/web/lib/seo/metadata.ts` exists: a helper that builds Next `Metadata` from (per-doc `seo` object, page fallbacks, `siteSettings.defaultSeo`), handling title template (`%s | <clinicName>`), description, canonical from `NEXT_PUBLIC_SITE_URL`, OG/Twitter images (via `urlFor`), and `robots: { index: false }` when `noIndex`.
- `apps/web/lib/seo/schema.ts` exists: JSON-LD builders returning `VeterinaryCare` (with address, geo, openingHoursSpecification, telephone from `siteSettings`) plus a small `<JsonLd>`-style serializer helper for pages to embed.
- `apps/web/app/sitemap.ts` exists: pulls service/blogPost/page slugs via tagged queries in `queries.ts` (new `defineQuery` entries are fine; regen typegen after).
- `apps/web/app/robots.ts` exists, referencing the sitemap URL.
- `apps/web/app/manifest.ts` exists with name/colors from sensible static values (siteSettings-driven theming can wait for Chunk 10 tokens).
- `apps/web/app/opengraph-image.tsx` exists: dynamic OG via `ImageResponse` (clinic name + tagline; brand styling lands properly in Chunk 10).
- `pnpm typecheck` / `pnpm lint` / `pnpm build` pass; the build emits `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, and the OG image route.

**Depends on:** Chunk 7 (shipped 2026-06-05).

**Open decisions that affect this chunk:**

- None blocking. OD-3 (CI timing) is open but does not block this chunk.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `feat(web): add seo metadata helpers`
2. `feat(web): add json-ld structured data builders`
3. `feat(web): add sitemap, robots, and manifest routes`
4. `feat(web): add dynamic opengraph image route`
5. `chore(studio): regenerate sanity types for sitemap queries`
6. `docs(architecture): document the apps/web/lib/seo/ shape`

Chunk 9 (template contract `types/template.ts`) is the natural follow-up — it's small and unblocks the `modern` template build (Chunk 10).

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
