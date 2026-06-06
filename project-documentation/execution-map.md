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

**Chunk 11 — Marketing pages (`app/(marketing)/`).**

**Goal:** Build every public page against the shipped stack (queries → SEO helpers → template components): home (refine the Chunk 10 integration), `hakkimizda`, `hizmetler` + `hizmetler/[slug]`, `blog` + `blog/[slug]`, `galeri`, `sss`, `iletisim` (page shell only — the form itself is Chunk 12). The largest remaining chunk; everything it needs already exists.

**Locked context / load-bearing reminders:**

- **Every page calls `buildPageMetadata({ title, description, seo, path, clinicName })`** — a page-level openGraph block replaces the root wholesale, so `clinicName` matters; `path` is the canonical.
- **Detail-page tagging (OD-5):** slug→`_id` lookup tagged `listTag(type)`, then the full fetch tagged `docTag(type, _id)`; service detail also carries `listTag('faq')` (relatedFAQs deref), blog lists/details carry `listTag('teamMember')` (author deref).
- All `[slug]` routes use **async `params`** (Next 16); `generateStaticParams` from the list queries where it helps.
- Rich text renders through `@portabletext/react` (re-exported by next-sanity) — build one shared `PortableTextRenderer` in `components/shared/` honoring the blockContent ruleset (h2/h3/blockquote, strong/em/link).
- New queries needed (add as `defineQuery` + regen): page-by-slug, FAQ list, gallery list, blog post by slug, service slug→id lookups. Bound home-page lists with GROQ slices (e.g. posts `[0...4]`).
- Header/Hero own the h1 — detail pages pass the doc title to Hero (or render their own single h1 where Hero doesn't fit); cards stay h3 under section h2s.
- Sitemap STATIC_ROUTES must stay in sync once routes exist; the `(marketing)` route group does NOT change URLs.
- Manifest icons + favicons: the deferred Chunk 10 item — fold into this chunk's polish pass.

**Done when:**

- All routes from CLAUDE.md §4's `app/(marketing)/` tree exist and render seeded content end-to-end (lists + details).
- Every page exports `generateMetadata` via the helpers with correct canonical paths; detail pages 404 cleanly (`notFound()`) on unknown slugs.
- Cache tags follow the OD-5 recipes above on every fetch.
- Portable Text renders with the shared renderer on service/blog/page/FAQ bodies.
- `pnpm typecheck` / `pnpm lint` / `pnpm build` pass; browser check of every route against seeded content.

**Depends on:** Chunks 7, 8, 9, 10 — all shipped. Dataset seeded.

**Open decisions that affect this chunk:**

- None blocking. OD-3 (CI timing) is open but does not block this chunk.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `feat(web): add remaining groq queries for marketing pages` + `chore(studio): regenerate sanity types`
2. `feat(web): add shared portable text renderer`
3. `feat(web): add hizmetler list and detail pages`
4. `feat(web): add blog list and detail pages`
5. `feat(web): add hakkimizda, sss, galeri, and iletisim pages`
6. `feat(web): refine the home page composition`
7. `docs(architecture): document the marketing routes`

Chunk 12 (contact form + Resend) follows — small once the iletisim page shell exists.

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
