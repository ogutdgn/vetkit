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

**R3 — Admin content CRUD (forms per type, draft/publish, Tiptap, Storage uploads, ordering).**

> ⚠ Context: the Sanity→Supabase rebuild (CLAUDE.md §12 2026-06-14). R1 (`@vetkit/db`, RLS 9/9) and R2 (`apps/admin` auth shell) shipped. Work stays on branch `feat/supabase-rebuild`; **no push to `main` without owner approval.** Super-admin dev login: `doganogut06@gmail.com` (temp password issued at R2 — owner should rotate).

**Goal:** Inside `apps/admin`, give clinic users + super-admin full content management for the active tenant: list/create/edit/delete for each content type, a draft/publish toggle, a Tiptap rich-text editor, Supabase Storage image uploads (the `media` table + bucket), and drag/ordering via `sort_order`. All writes go through `@vetkit/db` under the authenticated role — RLS scopes to the active tenant.

**Locked context:**

- Content types (spec §4): services, blog_posts, team_members, faqs, gallery_images, pages, testimonials, hero_slides, the `site_settings` singleton.
- Rich text: **Tiptap**, configured to the §5 ruleset — blocks `normal/h2/h3/blockquote`, lists `bullet/number`, marks `strong/em/link(newTab)`; **no h1**. Store as the `TiptapDoc` jsonb shape (`@vetkit/db` schemas). Verify current Tiptap + React 19 APIs against live docs first.
- Images: upload to the `media` bucket at `<tenantId>/<category>/<file>` (the storage write policy enforces the tenant segment), insert a `media` row, reference via `*_media_id`. Image transforms are **Pro-plan only** — confirm the plan with the owner (Free → origin images + focal CSS only).
- Validation: the `@vetkit/db` Zod schemas at the write boundary (add richer email/url/phone validators here — verify zod 4 API). Port `turkishSlugify` from `apps/studio/lib/slug.ts` for slugs (unique per tenant).
- Forms: React Hook Form + Zod (per CLAUDE.md §3). shadcn/ui init (R9) likely pulled forward here for inputs/dialogs/tables.

**Done when:**

- Each content type has a working list + create/edit/delete in `apps/admin`, scoped to the active tenant, with draft/publish.
- Tiptap editor saves/loads the jsonb body; image upload writes to Storage + the `media` table; ordering persists.
- The `site_settings` singleton editor works. `pnpm typecheck`/`lint`/`build` pass; a content round-trip is verified against the live DB.

**Depends on:** R2 (auth shell) — shipped.

**Open decisions affecting this chunk:** Supabase plan tier (Pro for image transforms) — owner call before the image-upload UX is finalized.

**Suggested commit split:** by content area, e.g. `feat(admin): add services CRUD`, `feat(admin): add the tiptap editor`, `feat(admin): add media uploads`; one combined `docs(project): wrap R3` at session end.

R4 (public data-layer swap to `@vetkit/db`) can proceed in parallel — it only depends on R1.

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
4. **Commit the doc updates as ONE combined docs commit** (owner preference, 2026-06-06), e.g. `docs(project): wrap chunk N` covering plan.md + execution-map.md + last-point.md + any doc fixes. Never mix docs with feature code.

This file should never go more than one chunk out of date.
