# Last point — vetkit

> **Snapshot of where the last session stopped.** Read this first when picking up work; refresh it before closing a chat or before any major operation.
>
> **Read with siblings:**
>
> - [`execution-map.md`](./execution-map.md) — what to work on next.
> - [`plan.md`](./plan.md) — the full plan and backlog.
>
> **Maintenance:** Refresh before chat closes, before any big operation (multi-file refactor, deploy, schema migration), or whenever the working tree is about to shift significantly. Skill `writing-last-point` at `.claude/skills/writing-last-point/SKILL.md` codifies the protocol. The last commit referenced below is the last _meaningful_ commit before this snapshot was written; the snapshot itself ships in a `docs(last-point): ...` commit immediately after.

---

## Snapshot

**Date:** 2026-06-05 (Chunks 6b, 7, 8, 9 shipped + dataset seeded — one long day)
**Last commit on `main`:** `6f6cbf1 docs(architecture): add template contract and templates rows`. This wrap ships `docs(plan): ...`, `docs(execution-map): ...`, then this `docs(last-point): ...`, then pushes.
**Working tree:** apart from this wrap's doc edits and untracked `.claude/` local files, clean.
**Remote:** `origin → https://github.com/ogutdgn/vetkit.git`. Pushed through `c307c18`; the Chunk 9 batch + this wrap push at wrap end.

## What's running

- Monorepo (pnpm + Turborepo), Tailwind v4, ESLint flat-config, Husky pre-commit, Sanity v5 Studio (sanity 5.30), plain-field Phase 1 schema.
- **`vetkit-dev` seeded** (projectId `v682t332`, public dataset): "Pati Veteriner Kliniği" siteSettings, 5 services, 4 FAQs, 3 team members, hakkımızda page, 2 testimonials, 2 blog posts, 4 gallery images (+15 assets).
- **Chunk 7 data layer** (`lib/sanity/`): origin-only client, `sanityFetch`, **6 typed queries** (incl. blog + team lists), OD-5 tags, `urlFor`.
- **Chunk 8 SEO layer** (`lib/seo/` + 4 route files), root layout wired (metadata + `VeterinaryCare` JSON-LD).
- **Chunk 9 template contract** (`types/template.ts`): six-component `ThemeComponents`, props typed against query-result projections, `SanityImageWithAlt` invariant holds for every contract image (incl. `page.heroImage` after the alt fix). `templates/classic|premium` placeholder READMEs.
- `pnpm typecheck` / `lint` / `build` clean.

## What was done in this (2026-06-05, Chunk 9 + seeding) session

1. **Dataset seeded** (22 docs + 15 assets via `sanity dataset import`; builder at `/tmp/vetkit-seed/`, deliberately uncommitted per anti-pattern #8). Verified live: build renders "Pati Veteriner Kliniği", 5 services, JSON-LD, branded OG image. Owner's one-shot Editor token used and not stored (revocation advised).
2. **Chunk 9 shipped:** `types/template.ts` contract + `blogPostsListQuery`/`teamMembersListQuery` + classic/premium READMEs. Assignability probes passed.
3. **Adversarial review** (2 lenses, 12 agents) → 6 confirmed findings, all fixed:
   - blog list query comment now names the `listTag('teamMember')` dependency (`author->` deref, tags.ts rule 2).
   - `page.heroImage.alt` made plain-required (typegen can't see conditional validation; optional alt broke the `SanityImageWithAlt` assignability invariant) + typegen regen + SCHEMA.md note.
   - CLAUDE.md §6 sketch aligned with the shipped contract (query-result typing, image-only media) + §12 row logging the decision; PROJECT-ARCHITECTURE got `types/template.ts` + `templates/` rows.
4. **Wrap:** plan.md row 9 checked, execution-map → Chunk 10, this file.

## What is NOT yet set up

Standing inventory — cross off as items ship.

- ~~Chunks 1–6, 6b, 7, 8, 9~~ ✓ (plan.md §2 has dates/commits). ~~Dataset content~~ ✓ seeded.
- **`templates/modern/` (Chunk 10)** — active next. First visual work; L-size.
- Marketing pages (Chunk 11) — reminders: `buildPageMetadata({ ..., path, clinicName })`, slug→`_id` two-step for per-doc tags, `listTag('faq')` on service detail, `listTag('teamMember')` on blog list.
- Contact form + Resend (Chunk 12). Revalidation webhook (Chunk 13) — bust BOTH doc and list tags. shadcn/ui (Chunk 14). CI (OD-3). Vercel deploy (Chunk 15).
- Manifest icons (Chunk 10 branding pass).

## Open decisions still pending

See [`plan.md`](./plan.md) §3.

- **OD-3** (CI timing) — the only open decision. Recommendation: minimal workflow before Chunk 15.

## Heads-up for the next session

- **Chunk 10 (`templates/modern/`) is the active chunk** — spec in [`execution-map.md`](./execution-map.md) §1: six components against the contract, `getTemplate()` loader, §2.5 brand-token pipeline (siteSettings.brandColor → CSS vars on root layout), home page rendered through the template. Seeded content makes every component renderable from day one.
- **Local stale-cache gotcha (until Chunk 13):** after Sanity content edits, `rm -rf apps/web/.next/cache/fetch-cache` before a local `next build` (dev server unaffected).
- **Gotchas — don't "fix" back:** complete per-page `openGraph` blocks; no canonical/og:url in root metadata; `useCdn: false`; `@sanity/image-url` direct dep; `generated.ts` ESLint-exempt; `page.heroImage.alt` plain-required on purpose.
- Husky pre-commit is active — every commit auto-runs lint+format.
