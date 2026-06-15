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

**R2 — `apps/admin` auth shell (`@supabase/ssr`, invite-only login, tenant + super-admin resolution).**

> ⚠ Context: the project pivoted off Sanity onto Supabase + a custom admin (CLAUDE.md §12 2026-06-14). R1 shipped — `packages/db` is live on cloud `alzwrhvuvqwwxoownnjf`, RLS verified 9/9. Work stays on branch `feat/supabase-rebuild`; **no push to `main` without owner approval.**

**Goal:** A new `apps/admin` Next 16 app where clinic users (invite-only) and the super-admin sign in via Supabase Auth; the session resolves the user's tenant(s) from `memberships` (super-admin via `platform_admins`, with a tenant switcher). Reads/writes go through `@vetkit/db` under the authenticated role — RLS does the scoping. No content CRUD yet (that's R3); this is auth + the protected shell.

**Locked context:**

- Stack: Next 16 App Router + `@supabase/ssr` (NOT the deprecated auth-helpers). Cookie `getAll`/`setAll` pattern + middleware session refresh. Consume `@vetkit/db` (`createAnonClient` is the browser/anon base; R2 adds the cookie-bound server/browser clients).
- Auth: invite-only — super-admin provisions users; no public signup. The **first** `platform_admin` is seeded out-of-band with the service-role key (chicken-and-egg, see review §residuals) — do this as the first R2 step so you can actually log in.
- Tenant resolution: `private.auth_tenant_ids()` / membership lookup → the logged-in user's tenant; `platform_admins` → super-admin sees all + a tenant switcher (store the active tenant in a cookie/URL).
- New deps in `apps/admin`: `@supabase/ssr`, `@supabase/supabase-js`, `@vetkit/db` (workspace). New Vercel project later (R10).

**Before writing code:** verify the CURRENT `@supabase/ssr` API + the Next 16 cookies/middleware pattern against live Supabase docs — training data is stale (the brief's §5 ssr notes were deferred from R1).

**Done when:**

- `apps/admin` runs; an unauthenticated visitor is redirected to a login; a seeded user logs in and lands on a protected shell showing their tenant (super-admin sees a tenant switcher).
- Session is read in Server Components via the cookie-bound client; middleware refreshes it.
- A clinic user's session is scoped to its tenant; the super-admin can switch tenants. `pnpm typecheck`/`lint`/`build` pass.

**Depends on:** R1 (`@vetkit/db`) — shipped.

**Open decisions affecting this chunk:** none blocking. (`is_platform_admin` stays a live table lookup per R1; revisit only if instant-revoke matters.)

**Suggested commit split:**

1. `feat(admin): scaffold apps/admin with supabase ssr auth`
2. `feat(admin): add tenant + super-admin resolution and protected shell`
3. One combined `docs(project): wrap R2` at session end.

R3 (admin content CRUD: forms, draft/publish, Tiptap, Storage uploads) follows.

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
