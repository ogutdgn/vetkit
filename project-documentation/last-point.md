# Last point — vetkit

> **Snapshot of where the last session stopped.** Read this first when picking up work; refresh it before closing a chat or before any major operation.
>
> **Read with siblings:**
>
> - [`execution-map.md`](./execution-map.md) — what to work on next.
> - [`plan.md`](./plan.md) — the full plan and backlog.
>
> **Maintenance:** Refresh before chat closes, before any big operation (multi-file refactor, deploy, schema migration), or whenever the working tree is about to shift significantly. Skill `writing-last-point` at `.claude/skills/writing-last-point/SKILL.md` codifies the protocol.

---

## Snapshot

**Date:** 2026-06-07
**Last commit on `main`:** the design-adoption review-fix commit. This wrap ships as ONE combined `docs(project): wrap legacy design adoption` commit, then pushes.
**Working tree:** apart from this wrap's doc/skill edits and untracked `.claude/` local files, clean.
**Remote:** `origin → https://github.com/ogutdgn/vetkit.git`. Pushed through `b983992`; the design-adoption batch pushes at wrap end.

## What's running

- Monorepo (pnpm + Turborepo), Tailwind v4, ESLint flat-config (ignores `old-sites/**`), Husky, Sanity v5 Studio (5.30), plain-field schema.
- **`vetkit-dev` = real Ovapark content** (siteSettings `#F15E42`, 6 services + photos, 4 FAQs, hakkımızda, 6 gallery; no team/blog/testimonials — old site had only filler). `old-sites/` populated locally (gitignored).
- **The site now wears the legacy look (owner decision 2026-06-07, CLAUDE.md §12):** dark header/nav, full-width CMS-driven hero carousel (`siteSettings.heroSlides`, 3 real Ovapark slides seeded — inert inactive slides, sr-only h1 outside the rotation, autoplay stops on manual nav, reduced-motion aware), overlapping info-card row, Hoşgeldiniz + legacy icon-row services on home, dark page banners everywhere. Brand ramp now carries a hue-aware WCAG floor for white-text steps.
- **The full public site works end-to-end**: `(marketing)` route group — home, hakkımızda, hizmetler + 6 SSG detail pages, blog (+detail, empty state), galeri, sss, iletisim (form shell). OD-5 two-step tagging on details; `PortableTextRenderer` + `ImageGallery` shared components; per-tenant dynamic favicons; sitemap guards unrouted page slugs.
- Chunks 1–11 ✓ (see plan.md §2). `pnpm typecheck` / `lint` / `build` clean; 15 routes emit; HTTP walk all 200 + clean 404.

## What was done in this (2026-06-07, design-adoption) session — previous session summary below still applies

1. **Ovapark re-seed + old-sites pull** (see ddcf329's last-point entry): real client content now drives dev; design note — owner likes the old hero carousels (Slider Revolution), discuss for a design-polish pass.
2. **Chunk 11 shipped** (`a8cc1b2`–`754704e`, consolidated commits): 12 new queries (OD-5 two-step recipes), shared renderers, the 9 marketing pages, brand favicon routes, eslint old-sites ignore, absolute-title fix for editor metaTitles.
3. **Adversarial review** (4 lenses, 36 agents) → 22 confirmed, all fixed in ONE commit (`4e804f2`): **blocker** — home page had no generateMetadata (no canonical/og:url on the homepage); OG-image fallback was disabled on all inner pages by the wholesale openGraph replacement (now named explicitly); blog detail missing `listTag('blogPost')` for relatedPosts deref; dead queries removed; sitemap unrouted-slug guard; Turkish-locale favicon uppercase; `dl`→`ul` a11y; sr-only h2s.
4. **Owner convention change:** session-wrap docs now bundle into ONE combined docs commit (skills + execution-map §3 updated; memory saved).

## What is NOT yet set up

- ~~Chunks 1–11~~ ✓. ~~Dataset seeding~~ ✓ (Ovapark).
- **Contact form + Resend (Chunk 12)** — active next; iletisim shell + comment in place. Owner action when ready: Resend API key (+ verified sender for real sends).
- Revalidation webhook (Chunk 13) — closes the local stale-cache gotcha; bust BOTH doc and list tags.
- shadcn/ui + branded not-found (Chunk 14). CI (OD-3). Vercel deploy (Chunk 15). gigi content migration (manual, pre-15).
- Design-polish pass before delivery: hero carousel question (owner likes the old sliders — schema-first discussion per §2.4), plus owner's notes from browsing.

## Open decisions still pending

- **OD-3** (CI timing) — recommendation: minimal workflow before Chunk 15.

## Heads-up for the next session

- **Design adoption (Chunk 11b) shipped this session** — review fixed a keyboard ghost-focus blocker (inert), h1-in-rotation, contrast floors. New gotchas: hero h1 is sr-only inside HeroCarousel; heroSlides drives the hero (static fallback only when empty); the brand 600/700 steps pass a real WCAG check in `lib/branding.ts`.
- **Chunk 12 (contact form + Resend) is the active chunk** — spec in [`execution-map.md`](./execution-map.md) §1. Check current package APIs (react-hook-form/zod/resolvers/resend/react-email) before writing code.
- **Local stale-cache gotcha (until Chunk 13):** after Sanity content edits, `rm -rf apps/web/.next/cache/fetch-cache` before a local `next build` (dev unaffected).
- **Gotchas — don't "fix" back:** complete per-page `openGraph` blocks with the explicit `/opengraph-image` fallback; `{ absolute }` titles for editor metaTitles + home; no canonical/og:url in root metadata; `useCdn: false`; `generated.ts` ESLint-exempt; brand guard rails in `lib/branding.ts`; `generateStaticParams` uses the plain client; sitemap `ROUTED_PAGE_SLUGS` until a generic page route exists.
- **Wrap convention: ONE combined docs commit** per session (owner, 2026-06-06).
- Husky pre-commit is active.
