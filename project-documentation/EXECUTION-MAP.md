# Execution map

> **Living document.** This file tracks where we are in the build, what's next, and which decisions are still open. Update it at the start and end of every working session — it is the first thing to read when picking up work in a new session.
>
> See [CLAUDE.md](../CLAUDE.md) for the architectural source of truth (decisions, conventions, anti-patterns) and [PROJECT-ARCHITECTURE.md](./PROJECT-ARCHITECTURE.md) for the repo skeleton walkthrough. This file is the **operational** counterpart: granular, ordered, current.

---

## 1. Where we are now

**Last commit on `main`:** `81c49ca docs(architecture): add PROJECT-ARCHITECTURE.md repository walkthrough`

**Working tree state:** clean.

**What's running:**
- Monorepo skeleton (pnpm workspaces + Turborepo) is in place.
- `apps/web` boots: `pnpm --filter @vetkit/web dev` → Next.js 16.2.4 (Turbopack) ready in ~330ms, `localhost:3000` returns HTTP 200.
- `apps/studio` is wired to env-driven Sanity v3.99 config but has no schemas yet (empty array in `apps/studio/schemas/index.ts`).
- `pnpm typecheck` passes for both apps.
- Shared `@vetkit/config-typescript` provides three TS presets (base / nextjs / react-library).

**What is NOT yet set up** (don't assume any of these exist):
- Tailwind CSS v4 (no styling layer; `apps/web/app/page.tsx` uses inline styles as a placeholder).
- ESLint flat config (the `lint` scripts are placeholders that just `echo`).
- Husky / lint-staged.
- shadcn/ui.
- Sanity schema, GROQ queries, Sanity client wrapper, draft mode helpers.
- SEO helpers (`generateMetadata`, JSON-LD, sitemap, robots, OG image).
- Template contract (`apps/web/types/template.ts`) and `templates/modern/`.
- Any marketing pages beyond the placeholder home.
- Contact form and Resend integration.
- Revalidation route and Sanity webhook setup.
- GitHub Actions CI.
- Vercel deployment for any client.

---

## 2. Active chunk

**Next up: Chunk 1 — Tailwind CSS v4.**

Goal: install Tailwind v4 in `apps/web`, set up the design-token contract (CSS variables for brand color, font, etc. so that Sanity `siteSettings` can override them at runtime per CLAUDE.md §2.5), and replace the inline styles in the placeholder home page so we know it works.

Done when:
- `apps/web` builds and dev-runs with Tailwind classes applied.
- A `tokens.css` (or equivalent) declares the CSS variables that templates will read.
- The placeholder page is restyled with Tailwind utilities (no inline styles).
- A `packages/config-tailwind/` shared preset exists if the configuration is non-trivial; otherwise leave it inline in `apps/web` and extract later.

---

## 3. Phase 1 backlog (ordered)

The order is chosen so each chunk has its dependencies already in place. Don't reorder without checking the **Depends on** column.

| # | Chunk | Depends on | Size | Notes |
|---|---|---|---|---|
| 1 | Tailwind v4 + token system in `apps/web` | — | S | See §2 above. |
| 2 | ESLint flat config: `packages/config-eslint` + per-app `eslint.config.mjs` | — | S | `next lint` was removed in Next 16; we invoke ESLint directly. |
| 3 | Husky + lint-staged pre-commit (eslint + typecheck on staged files) | 2 | S | See open decision §4 — confirm we want hooks. |
| 4 | **Sanity schema (Phase 1)** — all doc types + reusable objects | — | L | The keystone. Per CLAUDE.md §13, do this before any `apps/web` feature work. Read `old-sites/` for content shape; design schema as a superset. |
| 5 | Sanity Studio Turkish localization + custom desk structure | 4 | M | `siteSettings` enforced as singleton; Turkish field labels + descriptions. |
| 6 | `sanity-codegen` — generate TS types from schema into `packages/sanity-types/` | 4 | S | Re-run on every schema change (anti-pattern §11.14). |
| 7 | Shared Sanity infra in `apps/web/lib/sanity/`: client, GROQ queries, image URL builder, draft mode helpers | 4, 6 | M | Remember: `await draftMode()` (Next 16 async). |
| 8 | SEO helpers in `apps/web/lib/seo/`: `generateMetadata`, JSON-LD (LocalBusiness/VeterinaryCare), sitemap, robots, dynamic OG image | 7 | M | Use Next 16's faster `ImageResponse` for OG. |
| 9 | Template contract (`apps/web/types/template.ts`) | 6 | S | The `ThemeComponents` interface every template must satisfy. |
| 10 | `templates/modern/` — Header, Hero, ServiceCard, BlogCard, TeamSection, Footer, `tokens.css`, `index.ts` | 1, 9 | L | Polished, not stubbed. Phase 1 ships only this template. |
| 11 | Marketing pages — home, hakkimizda, hizmetler list/detail, blog list/detail, galeri, sss, iletisim | 7, 10 | L | All `[slug]` routes use async `params`. |
| 12 | Contact form + Resend (`api/contact/route.ts`) | 11 | S | No DB; email-only per CLAUDE.md §2.3. |
| 13 | Revalidation API route + Sanity webhook setup | 7 | S | `revalidateTag(tag, 'max')` — new Next 16 signature. |
| 14 | shadcn/ui init — only when a primitive (Button/Input/Form) is actually needed | 1 | S | Don't init speculatively; copy components on demand. |
| 15 | Vercel deploy + custom domain for gigi-veteriner | through 14 | S | Follow CLAUDE.md §9 onboarding playbook. |

**Out of Phase 1 (do not pull these in unless explicitly asked):** `templates/classic/`, `templates/premium/`, `apps/admin`, Supabase, automated `scripts/new-tenant.ts`, i18n, analytics SDKs.

---

## 4. Open decisions

These are flagged here so we don't forget. Resolve before they block the corresponding chunk.

| # | Decision | Why it matters | When it must be resolved |
|---|---|---|---|
| OD-1 | **Sanity major version: stay on v3, jump to v4, or jump to v5?** | We installed `sanity@^3.74` (resolved to 3.99) per CLAUDE.md, but v4 has a known migration date (Jul 15) and v5 is already on npm. Migrating after we've defined the schema is harder than choosing the right version up front. | Before Chunk 4 (schema). |
| OD-2 | **Pre-commit hooks: Husky + lint-staged, or lean on CI only?** | Hooks slow each commit but catch lint/type errors locally. CI catches them later but doesn't block the bad commit. | Before Chunk 3. |
| OD-3 | **GitHub Actions CI: when?** | CLAUDE.md §4 lists `.github/workflows/ci.yml` but the roadmap doesn't schedule it. Probably belongs after Chunk 2 (lint exists) but before Chunk 15 (deploy). | Before first push to a remote we want gated. |
| OD-4 | **Studio hostname pattern: `<client>.sanity.studio` (default) or CNAMEd `studio.<client-domain>.com`?** | Affects onboarding playbook and what we ask the client for DNS. | Before Chunk 15. |
| OD-5 | **Where do `tokens.css` brand variables live for Phase 1?** | If only one template exists, putting tokens inside `templates/modern/` is fine. If the shared preset already declares them, the template just consumes. Decide so we don't end up with two sources of truth. | During Chunk 1 / Chunk 10. |

---

## 5. Pick-up protocol

When starting a new session:

1. **Read §1** to confirm the snapshot is still current (cross-check against `git log --oneline -5`).
2. **Read §2 (Active chunk)** — that's the immediate work.
3. **Skim §4 (Open decisions)** — if the active chunk depends on an unresolved decision, raise it before starting.
4. **Do the work.** Commit per [feedback memory: commit style] — conventional prefixes, English, 1-2 sentences, split by topic, no Claude attribution.
5. **At end of session, update this file:**
   - Move completed chunk(s) out of §3 (or check them off).
   - Update §1 with the new last-commit hash and any state changes.
   - Update §2 with the next chunk.
   - Add new entries to §4 if new open questions surfaced.
6. **Commit the EXECUTION-MAP update** as `docs(execution-map): ...`.

This file should never go more than one chunk out of date.
