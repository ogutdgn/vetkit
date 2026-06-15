# Last point — vetkit

> **Snapshot of where the last session stopped.** Read this first when picking up work; refresh it before closing a chat or before any major operation.
>
> **Read with siblings:**
>
> - [`execution-map.md`](./execution-map.md) — what to work on next.
> - [`plan.md`](./plan.md) — the full plan and backlog.
>
> **Maintenance:** Refresh before chat closes, before any big operation, or whenever the working tree is about to shift significantly. Skill `writing-last-point` codifies the protocol.

---

## Snapshot

**Date:** 2026-06-14
**Branch:** `feat/supabase-rebuild` — **pushed to `origin`**. Still **no `main` push** without owner approval. `main` is at `5302328`.
**State:** Sanity → Supabase pivot (CLAUDE.md §12 2026-06-14). **R1 (`@vetkit/db`) and R2 (`apps/admin` auth shell) shipped + verified.** Committing R2 this session (feature commits + bundled docs commit).
**Cloud project:** Supabase `alzwrhvuvqwwxoownnjf` (`vetkit-dev`). Seeded: 2 tenants (`gigi`, `ovapark`) + a super-admin **`doganogut06@gmail.com`** (temp password issued in chat — owner should rotate). Keys in `apps/web/.env.local` + `apps/admin/.env.local` (both gitignored; admin only needs the public pair).

## R1 — DONE ✓ (`packages/db`)

Schema live on the cloud DB, 6-lens reviewed, RLS proven 9/9. See [`specs/2026-06-14-supabase-r1-review.md`](./specs/2026-06-14-supabase-r1-review.md). (Full detail in the prior last-point; unchanged.)

## R2 — DONE ✓ (`apps/admin`)

- New Next 16 app. **Supabase SSR auth verified against the canonical example**, with the key Next 16 detail: **`proxy.ts` replaces `middleware.ts`** (`export async function proxy`), **async `cookies()`**, and **`getClaims()`** (not getUser/getSession) for verification.
- `lib/supabase/{client,server,proxy}.ts` + root `proxy.ts` (gates all routes except `/login`); login (server action `signInWithPassword` + `useActionState` form); protected `(app)` group with `AdminShell` (tenant display, super-admin tenant switcher, sign-out); `lib/auth.ts` `getActor()` (cached) resolves email/super-admin/active-tenant/available-tenants via RLS-scoped queries.
- **Bootstrap:** `packages/db/scripts/bootstrap-superadmin.mjs` (idempotent) seeds the first `platform_admin` + the client tenants — the chicken-and-egg the R1 review flagged.
- **Verified:** typecheck + lint + `next build` clean (Proxy recognized); **live auth 5/5** (signin, getClaims, platform_admins, sees both tenants, no memberships); **runtime proxy** `GET /` → 307 `/login`, `/login` → 200 form.

## What was done this session

1. Decided the pivot; wrote the data-model spec + research brief; locked docs.
2. Built + reviewed + verified **R1**; created the cloud project; fixed env-value mistakes (URL `/rest/v1/` suffix, wrong ref, secret↔publishable mixup).
3. Committed R1 (4 commits) and **pushed the branch**.
4. Built + verified **R2** (above); seeded the super-admin + tenants.

## Next chunk: R3 — admin content CRUD

Spec in [`execution-map.md`](./execution-map.md) §1. Forms per content type, draft/publish, **Tiptap** (verify current API), Supabase Storage uploads (`media` table + bucket), ordering. Likely pulls **shadcn/ui** (R9) forward for inputs/dialogs/tables. R4 (public swap) can run in parallel (depends only on R1).

## Heads-up for the next session

- **Port 3000 is taken by the owner's other app** (a Vite "Samaritan Inn" app). Run the admin dev server on another port: `pnpm --filter @vetkit/admin exec next dev -p 3100`. Kill stray Next dev with `pkill -f next-server` (the :3000 app is Vite, safe).
- **Sanity code still on disk** (apps/studio, lib/sanity, packages/sanity-types, marketing pages) — removed in **R4**, not piecemeal.
- **No Docker here** → pgTAP leak test is the R10 CI gate; use the Node smoke pattern for live behavioral checks.
- **R3 verify-first:** Tiptap + React 19 API, zod 4 validators, and the Supabase **Pro-plan** requirement for image transforms (owner decision).
- **CLI/scripts:** load `apps/web/.env.local` literally (don't `source`); run supabase CLI via `pnpm --filter @vetkit/db exec supabase --workdir . <cmd>`.
- **Don't "fix" back:** Next 16 uses `proxy.ts` not `middleware.ts`; `getClaims()` not getUser; `service_role` grants are required; junction policies carry same-tenant guards.
- Husky pre-commit active; ONE bundled docs commit per session wrap.
