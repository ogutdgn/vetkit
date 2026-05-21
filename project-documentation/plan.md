# Plan — vetkit

> **Master plan and backlog.** This is the source of truth for *what gets built, in what order, with what dependencies*. Check items off as they ship.
>
> **Read this with its sibling docs:**
> - [`execution-map.md`](./execution-map.md) — the **next session's** focused chunk. Read first when picking up work.
> - [`last-point.md`](./last-point.md) — snapshot of the **last session**: what was done, working tree, current state.
> - [`../CLAUDE.md`](../CLAUDE.md) — architectural source of truth (decisions, conventions, anti-patterns).
> - [`PROJECT-ARCHITECTURE.md`](./PROJECT-ARCHITECTURE.md) — repo skeleton walkthrough.
>
> **Maintenance:** Update this file whenever a chunk completes, a decision resolves, the backlog reorders, or scope shifts. Skill `updating-plan` at `.claude/skills/updating-plan/SKILL.md` codifies the protocol.

---

## 1. Phased roadmap

### Phase 1 — MVP (target: 4 weeks of focused work)

Infrastructure (already done):

- [x] Initialize monorepo — Turborepo + pnpm workspaces
- [x] `apps/web` scaffolded — Next.js 16.2.4, App Router, Sanity CDN images allowed
- [x] `apps/studio` scaffolded — Sanity v3 with env-driven tenant config (schemas TBD in Chunk 4)
- [x] Shared `@vetkit/config-typescript` presets — base / nextjs / react-library
- [x] Documentation set in place — CLAUDE.md, PROJECT-ARCHITECTURE.md, plan.md, execution-map.md, last-point.md, README

Feature work (open):

- [x] Tailwind CSS v4 + token-driven theme variables (Chunk 1)
- [ ] ESLint flat config — `packages/config-eslint` + per-app `eslint.config.mjs` (Chunk 2)
- [ ] Husky + lint-staged pre-commit hooks (Chunk 3 — depends on OD-2)
- [ ] Full Sanity schema — all doc types + reusable objects (Chunk 4)
- [ ] Sanity Studio Turkish localization + custom desk structure (Chunk 5)
- [ ] `sanity-codegen` — TS types generated into `packages/sanity-types/` (Chunk 6)
- [ ] Shared Sanity infra in `apps/web/lib/sanity/` — client, GROQ, image, draft mode (Chunk 7)
- [ ] SEO helpers — `generateMetadata`, JSON-LD, sitemap, robots, OG image (Chunk 8)
- [ ] Template contract `apps/web/types/template.ts` — `ThemeComponents` interface (Chunk 9)
- [ ] `templates/modern/` — Header, Hero, ServiceCard, BlogCard, TeamSection, Footer, tokens.css (Chunk 10)
- [ ] Marketing pages — home, hakkimizda, hizmetler list/detail, blog list/detail, galeri, sss, iletisim (Chunk 11)
- [ ] Contact form + Resend `api/contact/route.ts` (Chunk 12)
- [ ] Revalidation route + Sanity webhook (Chunk 13)
- [ ] shadcn/ui init — only when first primitive is needed (Chunk 14)
- [ ] Migrate gigi-veteriner content into Sanity (manual)
- [ ] Deploy gigi-veteriner to Vercel with custom domain (Chunk 15)
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

### Phase 4 — Internal admin (only at 5+ clients)

- [ ] Add Supabase for centralized form submission storage (if needed)
- [ ] Build `apps/admin` for the developer to monitor all clients in one place

---

## 2. Phase 1 ordered backlog

The order is chosen so each chunk has its dependencies in place. Don't reorder without checking the **Depends on** column.

| # | Chunk | Depends on | Size | Notes |
|---|---|---|---|---|
| ✓ 1 | Tailwind v4 + token system in `apps/web` | — | S | Shipped 2026-05-20 (commits `56a0b30`, `8ca0a3e`). |
| 2 | ESLint flat config: `packages/config-eslint` + per-app `eslint.config.mjs` | — | S | `next lint` was removed in Next 16; we invoke ESLint directly. |
| 3 | Husky + lint-staged pre-commit (eslint + typecheck on staged files) | 2 | S | See OD-2. |
| 4 | **Sanity schema (Phase 1)** — all doc types + reusable objects | — | L | The keystone. Read `old-sites/` for content shape; design schema as a superset. |
| 5 | Sanity Studio Turkish localization + custom desk structure | 4 | M | `siteSettings` enforced as singleton. |
| 6 | `sanity-codegen` — TS types into `packages/sanity-types/` | 4 | S | Re-run on every schema change. |
| 7 | Shared Sanity infra in `apps/web/lib/sanity/` | 4, 6 | M | Remember `await draftMode()` (Next 16 async). |
| 8 | SEO helpers in `apps/web/lib/seo/` | 7 | M | Use Next 16's faster `ImageResponse` for OG. |
| 9 | Template contract (`apps/web/types/template.ts`) | 6 | S | `ThemeComponents` interface for all templates. |
| 10 | `templates/modern/` — all components, polished | 1, 9 | L | Phase 1 ships only this template. |
| 11 | Marketing pages | 7, 10 | L | All `[slug]` routes use async `params`. |
| 12 | Contact form + Resend | 11 | S | No DB; email-only per CLAUDE.md §2.3. |
| 13 | Revalidation API route + Sanity webhook | 7 | S | `revalidateTag(tag, 'max')` — Next 16 signature. |
| 14 | shadcn/ui init | 1 | S | Only when the first primitive is actually needed. |
| 15 | Vercel deploy + custom domain for gigi-veteriner | through 14 | S | Follow CLAUDE.md §9 onboarding playbook. |

**Explicitly out of Phase 1** — don't pull in unless asked: `templates/classic/`, `templates/premium/`, `apps/admin`, Supabase, automated `scripts/new-tenant.ts`, i18n, analytics SDKs.

---

## 3. Open decisions

Flagged here so we don't forget. Resolve before they block the corresponding chunk.

| # | Decision | Why it matters | Resolve before |
|---|---|---|---|
| OD-1 | **Sanity major version: stay on v3, jump to v4, or v5?** | We installed `sanity@^3.74` (resolved to 3.99). v4 has a known migration date (Jul 15); v5 is already on npm. Migrating after schema is defined is harder than choosing right upfront. | Chunk 4 (schema). |
| OD-2 | **Pre-commit hooks: Husky + lint-staged, or CI only?** | Hooks slow each commit but catch lint/type errors locally. CI catches them later but doesn't block the bad commit. | Chunk 3. |
| OD-3 | **GitHub Actions CI: when?** | Should land after Chunk 2 (lint exists) and before Chunk 15 (deploy). | Before first push to a gated remote. |
| OD-4 | **Studio hostname pattern: `<client>.sanity.studio` (default) or CNAMEd `studio.<client-domain>.com`?** | Affects onboarding playbook and DNS asks. | Chunk 15. |

---

## 4. Maintaining this file

Update when:
- A chunk completes → check off the box in §1 *and* §2 for that chunk.
- An open decision resolves → remove from §3 and append an entry to `CLAUDE.md` §12 (Decision log).
- Phase 1 backlog order changes → update §2 and log the reason in `CLAUDE.md` §12.
- Scope is pulled in or pushed out → update §1 and §2 in sync.

The skill at `.claude/skills/updating-plan/SKILL.md` codifies the full update protocol.
