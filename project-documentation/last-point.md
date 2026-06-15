# Last point — vetkit

> **Snapshot of where the last session stopped.** Read this first when picking up work; refresh it before closing a chat or before any major operation.
>
> **Read with siblings:**
>
> - [`execution-map.md`](./execution-map.md) — what to work on next.
> - [`plan.md`](./plan.md) — the full plan and backlog.
>
> **Maintenance:** Refresh before chat closes, before any big operation, or whenever the working tree is about to shift significantly. Skill `writing-last-point` at `.claude/skills/writing-last-point/SKILL.md` codifies the protocol.

---

## Snapshot

**Date:** 2026-06-14
**Branch:** `feat/supabase-rebuild` (off `main` @ `5302328`). **Not pushed.** No `main` push without explicit owner approval.
**State:** the **Sanity → Supabase pivot** is underway (CLAUDE.md §12 2026-06-14). **R1 (the `packages/db` data layer) shipped and is fully verified.** Committing this session as feature commits + one bundled docs commit.
**Cloud project:** Supabase `alzwrhvuvqwwxoownnjf` (`vetkit-dev`). Keys (incl. the correct `sb_secret_` service-role key) are in `apps/web/.env.local` (gitignored). CLI linked.

## R1 — DONE ✓ (`packages/db` = `@vetkit/db`)

- **Schema LIVE on the cloud DB** — 4 migrations applied via `supabase db push`: `init_base_and_tenancy` (private schema, `set_updated_at`, tenants/profiles/memberships/platform_admins, the 2 security-definer helpers, `handle_new_user` trigger), `media_and_storage` (media table + public bucket), `content_tables` (10 content tables + 4 junctions), `rls_and_grants` (RLS on every table, per-op/per-role policies, GRANTs incl. **service_role**, Storage policies).
- **6-lens adversarial review** (workflow; synthesis agent stalled, findings recovered from the journal) → all blockers fixed. Report: [`specs/2026-06-14-supabase-r1-review.md`](./specs/2026-06-14-supabase-r1-review.md). Notable fixes: the **critical `service_role` grants gap** (auto-expose OFF withholds them), storage `SELECT` policy for `list()`, junction tenant-integrity WITH CHECK, `profiles` auto-trigger, leak-test correctness (`is_empty`→`throws_ok` on submissions) + coverage (9→16 assertions).
- **Types generated** from the live schema (19 tables) + jsonb override (`MergeDeep` from Zod). `@vetkit/db` typecheck + ESLint clean; full-repo typecheck green.
- **RLS proven LIVE 9/9** via a no-Docker Node smoke test (anon published-only + can't read leads + can submit; clinic user tenant-scoped; cross-tenant writes denied; reads own leads). The pgTAP suite is the durable CI gate for **R10** (needs Docker — not installed here).

## What was done this session

1. Owner pivoted off Sanity → Supabase + a custom admin (`apps/admin`); all 6 forks locked (shared project + RLS; both clinic + super-admin; draft/publish; submissions persist + email; full rebuild; supabase-js + gen-types).
2. Wrote the data-model spec + ran a research workflow → R1 brief. Locked the pivot into CLAUDE.md (§12 + banner), plan.md (R1–R10 roadmap), execution-map, last-point.
3. Built + reviewed + verified R1 (above). Created `vetkit-dev` cloud project, fixed two malformed env values (URL had `/rest/v1/`; ref was wrong; later the secret↔publishable mixup).

## Next chunk: R2 — `apps/admin` auth shell

Spec in [`execution-map.md`](./execution-map.md) §1. `@supabase/ssr` auth, invite-only login, tenant + super-admin resolution, protected shell. **First R2 step:** seed the first `platform_admin` with the service-role key (chicken-and-egg — RLS write policies need an existing admin). Verify the current `@supabase/ssr` + Next 16 cookie/middleware API against live docs first.

## Heads-up for the next session

- **Sanity code is still on disk** (apps/studio, lib/sanity, packages/sanity-types, the marketing pages) — NOT deleted; removal is R4 (public swap). Sanity env vars are commented in `.env.local` / marked legacy in `.env.example`.
- **No Docker here** → can't run `supabase db test` (pgTAP) or `supabase start` locally; use the Node RLS smoke pattern for behavioral checks, pgTAP is the R10 CI gate (Docker on the runner; basejump bootstrap chain in `packages/db/README.md`).
- **CLI workflow:** load `apps/web/.env.local` literally (don't `source` — values may contain shell metachars), then `pnpm --filter @vetkit/db exec supabase --workdir . <cmd>`. Push is `db:push:dry` then `db:push`; types via `gen:types` (uses `SUPABASE_PROJECT_REF`).
- **Don't "fix" back:** `service_role` grants are required (auto-expose OFF); junction policies carry same-tenant EXISTS guards; helpers live in `private` with empty `search_path`; anon submission insert is an accepted R1 residual (move server-side in R6).
- Husky pre-commit active; ONE bundled docs commit per session wrap.
