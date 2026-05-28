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

**Chunk 7 — Shared Sanity infra in `apps/web/lib/sanity/`.**

**Goal:** Give `apps/web` the small, type-safe set of helpers it needs to fetch Sanity content for server components and route handlers. This is the layer between the schema (Chunk 4) + generated types (Chunk 6) and the actual marketing pages (Chunk 11).

**Locked decisions (settled 2026-05-28):**

- **`next-sanity`** as the client wrapper (not vanilla `@sanity/client`). Reasoning in CLAUDE.md §12. Use `defineQuery` for queries so `sanity typegen` picks them up.

**Done when:**

- `apps/web/lib/sanity/client.ts` exists, wraps `next-sanity`'s `createClient`, reads `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` from env. Two exports: a CDN-cached public client and a draft-mode-aware client that uses `SANITY_API_READ_TOKEN`.
- `apps/web/lib/sanity/queries.ts` exists, holds the GROQ queries as `defineQuery(...)` calls. At least three are written and exported: `siteSettingsQuery`, `servicesListQuery`, `serviceBySlugQuery`. (More land in Chunk 11; the goal here is a working shape.)
- `apps/web/lib/sanity/image.ts` exists, exporting a `urlFor(image)` builder using `@sanity/image-url` (re-exported by `next-sanity`).
- `apps/web/lib/sanity/live.ts` exists with an `await draftMode()`-aware wrapper that flips the client used by queries (Next 16's `draftMode` is async).
- Every query call passes `next: { tags: [...] }` so the Chunk 13 webhook can selectively `revalidateTag`. **Tag-naming convention must be picked at the start of the chunk — see OD-5** (recommendation: `sanity:<type>:<id>` namespaced).
- Running `pnpm --filter @vetkit/studio typegen` after the queries are added emits **GROQ query result types** alongside the schema types (the typegen config already globs `apps/web/**/*.{ts,tsx}`), and those types are usable from the query helpers.
- `pnpm typecheck` / `pnpm lint` / `pnpm build` all pass.
- At least one page (e.g. `app/page.tsx`) imports a query helper to prove the chain end-to-end (still a placeholder render — the real pages land in Chunk 11).

**Depends on:** Chunks 4 (schema), 6 (typegen).

**Open decisions that affect this chunk:**

- **OD-5 (cache-tag convention)** — blocker. Resolve in the first commit. Recommendation: `sanity:<type>:<id>` for single docs (e.g. `sanity:service:abc123`), `sanity:<type>:list` for collection queries, `sanity:siteSettings` for the singleton. `_id`-based instead of slug-based for stability.
- OD-3 (CI timing) — open but does not block this chunk.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `feat(web): add next-sanity client wrapper with draft-mode toggle`
2. `feat(web): add image url builder helper`
3. `feat(web): add initial groq queries (siteSettings, services list, service detail) with cache tags`
4. `chore(studio): regenerate sanity types to include groq query results`
5. `feat(web): wire the home page to a sanity query as an end-to-end smoke test`
6. `docs(architecture): document the apps/web/lib/sanity/ shape`

Chunk 8 (SEO helpers) is the natural follow-up — once queries return typed data, `generateMetadata` can lean on it.

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
