# Plan — vetkit

> **Master plan and backlog.** This is the source of truth for _what gets built, in what order, with what dependencies_. Check items off as they ship.
>
> **Read this with its sibling docs:**
>
> - [`execution-map.md`](./execution-map.md) — the **next session's** focused chunk. Read first when picking up work.
> - [`last-point.md`](./last-point.md) — snapshot of the **last session**: what was done, working tree, current state.
> - [`../CLAUDE.md`](../CLAUDE.md) — architectural source of truth (decisions, conventions, anti-patterns).
> - [`PROJECT-ARCHITECTURE.md`](./PROJECT-ARCHITECTURE.md) — repo skeleton walkthrough.
>
> **Maintenance:** Update this file whenever a chunk completes, a decision resolves, the backlog reorders, or scope shifts. Skill `updating-plan` at `.claude/skills/updating-plan/SKILL.md` codifies the protocol.

> **⚠ 2026-06-14 — PIVOT: Sanity → Supabase + admin dashboard (full rebuild).** Owner decision (CLAUDE.md §12, 2026-06-14). The Sanity-based Phase 1 (chunks 1–11b, below under "Built on Sanity") shipped and worked, but is being **replaced**. The new Phase 1 is the **rebuild backlog R1–R10** in §2. Data-model + RLS spec: [`specs/2026-06-14-supabase-data-model.md`](./specs/2026-06-14-supabase-data-model.md). Work happens on branch `feat/supabase-rebuild`; **not pushed to `main` without owner approval.**

---

## 1. Phased roadmap

### Phase 1 — MVP (target: 4 weeks of focused work)

Infrastructure (already done):

- [x] Initialize monorepo — Turborepo + pnpm workspaces
- [x] `apps/web` scaffolded — Next.js 16.2.4, App Router, Sanity CDN images allowed
- [x] `apps/studio` scaffolded — Sanity v3 with env-driven tenant config (schemas TBD in Chunk 4)
- [x] Shared `@vetkit/config-typescript` presets — base / nextjs / react-library
- [x] Documentation set in place — CLAUDE.md, PROJECT-ARCHITECTURE.md, plan.md, execution-map.md, last-point.md, README

**Built on Sanity (2026-05/06) — now being replaced by the Supabase rebuild.** Chunks 1–11b shipped a complete public site on Sanity (Tailwind v4 + tokens, ESLint/Husky, full schema + Studio + typegen, `lib/sanity/` infra, SEO helpers, the template contract, `templates/modern/`, all marketing pages, legacy design adoption). The infra/tooling chunks (Tailwind, ESLint, Husky, the templates, SEO helper structure, route tree) are **kept**; the Sanity-specific layers (schema, Studio, `lib/sanity/*`, typegen, cache-tags) are **removed** in the rebuild. See git history through `5302328` for the Sanity Phase 1.

Rebuild on Supabase (active Phase 1) — see §2 for the ordered R1–R10 backlog:

- [x] R1 — Supabase project + `packages/db`: SQL migrations, RLS + leak test, generated types, client factory
- [ ] R2 — `apps/admin` shell: `@supabase/ssr` auth, invite-only login, tenant + super-admin resolution
- [ ] R3 — Admin content CRUD: forms per type, draft/publish, Tiptap, Storage uploads, ordering
- [ ] R4 — Public data-layer swap: `lib/sanity/*` → `lib/db/*`, re-type template props, image + rich-text rendering
- [ ] R5 — Revalidate-on-publish (replaces the Sanity webhook)
- [ ] R6 — Contact form + Resend + `submissions` inbox
- [ ] R7 — Super-admin: clinic management, user invites, cross-client overview
- [ ] R8 — Seed/migrate Ovapark + gigi content into Supabase
- [ ] R9 — shadcn/ui init + branded `not-found.tsx`
- [ ] R10 — CI (OD-3) + Vercel deploy (admin + public projects), RLS verified in prod
- [ ] Hand off to client, gather feedback for one week

### Phase 2 — Second client + second template (target: 2 weeks)

- [ ] Iterate on schema based on Phase 1 feedback (no breaking changes if possible)
- [ ] Build `templates/classic/` — same `ThemeComponents` contract, different look
- [ ] Migrate ovapark-veteriner content into Sanity
- [ ] Deploy ovapark-veteriner with `TEMPLATE=classic`

### Phase 3 — Scale prep (only if a 3rd client requires it)

- [ ] Build `templates/premium/` only if a real client need justifies it
- [ ] Build `scripts/new-tenant.ts` to automate onboarding
- [ ] Write `project-documentation/CLIENT-GUIDE.md` properly (Turkish, with screenshots)

### Phase 4 — Clinic operations (future, beyond content)

> Supabase + `apps/admin` + a leads/`submissions` table were **pulled into Phase 1** by the 2026-06-14 pivot. This phase is now the operational tables a vet clinic wants beyond marketing content.

- [ ] Appointments / booking
- [ ] Patient records
- [ ] Leads/CRM workflows on top of `submissions`

---

## 2. Phase 1 ordered backlog

The order is chosen so each chunk has its dependencies in place. Don't reorder without checking the **Depends on** column. Full data-model + RLS design: [`specs/2026-06-14-supabase-data-model.md`](./specs/2026-06-14-supabase-data-model.md).

| #    | Chunk                                                                                                                                                | Depends on | Size | Notes                                                                                                                                                                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ✓ R1 | Supabase project + `packages/db` — SQL migrations, RLS policies + **cross-tenant leak test**, generated types, client factory                        | —          | L    | Shipped 2026-06-14. Applied to cloud `alzwrhvuvqwwxoownnjf`; 6-lens adversarial review + all blockers fixed ([review](./specs/2026-06-14-supabase-r1-review.md)); **RLS proven live 9/9** via a no-Docker Node smoke test. pgTAP suite is the R10 CI gate (needs Docker). 19 tables. |
| R2   | `apps/admin` shell — `@supabase/ssr` auth, invite-only login, tenant resolution from membership, super-admin tenant switcher                         | R1         | M    | Verify `@supabase/ssr` + Next 16 cookie pattern against live docs first.                                                                                                                                                                                                             |
| R3   | Admin content CRUD — forms per type, draft/publish toggle, Tiptap rich text, Storage image upload + transforms, ordering, siteSettings + hero slides | R2         | L    | Tiptap config mirrors the §5 ruleset (h2/h3/blockquote, lists, strong/em/link; no h1). Port `turkishSlugify`.                                                                                                                                                                        |
| R4   | Public data-layer swap — `lib/sanity/*` → `lib/db/*`, re-type template props against DB types, image + rich-text rendering swap                      | R1         | M    | Templates/design untouched. PortableText renderer → Tiptap-JSON renderer; `urlFor` → Storage transform URLs.                                                                                                                                                                         |
| R5   | Revalidate-on-publish (replaces the Sanity webhook)                                                                                                  | R3, R4     | S    | Admin publish → `revalidateTag`/`revalidatePath` on the public site. OD-5 tag concept survives.                                                                                                                                                                                      |
| R6   | Contact form + Resend + `submissions` inbox                                                                                                          | R3         | S    | Form writes to `submissions` (leads seed) AND emails via Resend; admin inbox view. Owner action: Resend key + verified sender for real sends.                                                                                                                                        |
| R7   | Super-admin — clinic (tenant) management, user invites, cross-client overview                                                                        | R3         | M    | `platform_admins` + invite flow.                                                                                                                                                                                                                                                     |
| R8   | Seed/migrate Ovapark + gigi content into Supabase                                                                                                    | R3         | M    | Ovapark content already extracted (was in `vetkit-dev` Sanity); gigi manual.                                                                                                                                                                                                         |
| R9   | shadcn/ui init + branded `not-found.tsx`                                                                                                             | R2         | S    | Admin needs many primitives (forms, dialogs, tables); init when first is needed.                                                                                                                                                                                                     |
| R10  | CI (OD-3) + Vercel deploy — admin project + public projects, env, RLS verified in prod                                                               | through R9 | M    | Follow the rewritten §9 onboarding playbook (updated during R10).                                                                                                                                                                                                                    |

**Explicitly out of Phase 1** — don't pull in unless asked: `templates/classic/`, `templates/premium/`, appointments/patients/scheduling tables, content version history, document-level i18n, analytics SDKs, automated `scripts/new-tenant.ts`.

---

## 3. Open decisions

Flagged here so we don't forget. Resolve before they block the corresponding chunk.

| #    | Decision                     | Why it matters                                                                                                                                                                                                                                                             | Resolve before       |
| ---- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| OD-3 | **GitHub Actions CI: when?** | Husky + Vercel build cover most of the gap today; GH Actions would catch `apps/admin` build issues + run the RLS leak test on every push, and would survive a Husky-less machine. Recommendation: minimal workflow during R10 (or earlier, to run the R1 leak test in CI). | R10 (Vercel deploy). |

---

## 4. Maintaining this file

Update when:

- A chunk completes → check off the box in §1 _and_ §2 for that chunk.
- An open decision resolves → remove from §3 and append an entry to `CLAUDE.md` §12 (Decision log).
- Phase 1 backlog order changes → update §2 and log the reason in `CLAUDE.md` §12.
- Scope is pulled in or pushed out → update §1 and §2 in sync.

The skill at `.claude/skills/updating-plan/SKILL.md` codifies the full update protocol.
