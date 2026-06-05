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

**Date:** 2026-06-05 (third wrap this date — Chunks 6b, 7, and 8 all shipped today)
**Last commit on `main`:** `f1968ea docs(architecture): document the seo layer and fix stale cdn and contents cells`. This wrap ships `docs(plan): ...`, `docs(execution-map): ...`, then this `docs(last-point): ...`.
**Working tree:** apart from this wrap's doc edits (`plan.md`, `execution-map.md`) and untracked `.claude/` local files, clean.
**Remote:** `origin → https://github.com/ogutdgn/vetkit.git`. Pushed through `0892c70` (the Chunk 7 wrap); the 12 Chunk 8 commits + this wrap's docs are **not pushed yet** (owner approves pushes).

## What's running

- Monorepo (pnpm + Turborepo), Tailwind v4, ESLint flat-config, Husky pre-commit, Sanity v5 Studio (sanity 5.30) with the plain-field Phase 1 schema.
- **`vetkit-dev` Sanity project live** (projectId `v682t332`, public `production` dataset, still empty). Gitignored `.env.local` files in both apps.
- **Chunk 7 data layer** (`lib/sanity/`): origin-only published client, `sanityFetch`, 4 typed queries, OD-5 tags, `urlFor`.
- **Chunk 8 SEO layer** (`lib/seo/` + route files): `buildRootMetadata`/`buildPageMetadata` (written around Next's metadata merge semantics), `VeterinaryCare` JSON-LD, `/sitemap.xml` (URL-deduped), `/robots.txt`, `/manifest.webmanifest`, dynamic `/opengraph-image` (1200×630 `ImageResponse`). Root layout wired: dynamic metadata + JSON-LD embed, `htmlLang` from `NEXT_PUBLIC_DEFAULT_LOCALE`.
- `pnpm typecheck` / `lint` / `build` clean; build emits all four SEO routes as static.

## What was done in this (2026-06-05, Chunk 8) session

1. **Chunk 8 built and shipped** (commits `312c095`–`777e855`): `lib/seo/metadata.ts`, `lib/seo/schema.ts`, the four `app/` SEO route files, root-layout wiring, sitemap query + typegen regen (4 queries now).
2. **Adversarial review** (4 lenses, 34 agents) → 19 confirmed findings, all fixed (`66001a4`–`f1968ea`). The big ones, all mechanically verified against next@16.2.4 source:
   - **Child `openGraph` replaces the root wholesale** (no deep merge) → `buildPageMetadata` now emits a complete OG block (type/locale/url/siteName via optional `clinicName` param), not an images-only delta.
   - **Root `alternates.canonical` + OG `url` are inherited by every child route** → removed from `buildRootMetadata`; pages set their own via `buildPageMetadata` (Chunk 11 must pass `path` + `clinicName`).
   - **`description: undefined` still overrides the parent (→ null)** → conditional spread.
   - `NEXT_PUBLIC_SITE_URL` now throws in production builds when unset (was silently shipping localhost URLs); `NEXT_PUBLIC_DEFAULT_LOCALE` actually wired (`htmlLang`/`ogLocale`); closed days emitted in JSON-LD per Google's pattern; sitemap URL-dedupe (page doc vs static route); OG image alt/fallback unified, dead `fontWeight` dropped (next/og bundles only a 400-weight face — real bold font lands in Chunk 10).
   - Docs: PROJECT-ARCHITECTURE got the `lib/seo/` breakdown + SEO route rows + fixed three stale "CDN client" cells (predated the Chunk 7 `useCdn: false` flip) + refreshed §7 contents; CLAUDE.md §5 seo object now lists `noIndex`.
3. **Wrap docs:** plan.md row 8 checked, execution-map → Chunk 9, this file.

## What is NOT yet set up

Standing inventory — cross off as items ship.

- ~~Chunks 1–6, 6b, 7~~ ✓ (see plan.md §2 for dates/commits).
- ~~SEO helpers (Chunk 8)~~ ✓ 2026-06-05.
- **Template contract (Chunk 9)** — active next; small.
- `templates/modern/` (Chunk 10) — first visual work; L.
- Marketing pages (Chunk 11) — pages must use `buildPageMetadata({ ..., path, clinicName })`, the slug→`_id` two-step for per-doc tags, `listTag('faq')` on service detail.
- Contact form + Resend (Chunk 12).
- Revalidation route + webhook (Chunk 13) — bust BOTH doc and list tags on every mutation (CLAUDE.md §12).
- shadcn/ui (Chunk 14). CI (OD-3). Vercel deploy (Chunk 15).
- **Dataset content: `vetkit-dev` is empty** — seed siteSettings + a few services before/with Chunk 10 so components render real content (also makes the OG image show a real clinic name).
- Manifest icons (deferred to Chunk 10 branding pass; Lighthouse PWA installability flags it until then).

## Open decisions still pending

See [`plan.md`](./plan.md) §3.

- **OD-3** (CI timing) — the only open decision. Recommendation: minimal workflow before Chunk 15.

## Heads-up for the next session

- **Chunk 9 (template contract) is the active chunk** — spec in [`execution-map.md`](./execution-map.md) §1. Key design point: type props against _query-result_ shapes (`ServicesListQueryResult[number]`), not raw doc types.
- **Unpushed:** everything after `0892c70` (Chunk 8 batch + wrap docs). Ask owner / push at session start.
- **Gotchas — don't "fix" back:** page-level `openGraph` blocks must stay complete (Next replaces wholesale); no canonical/og:url in root metadata; `useCdn: false` deliberate; `@sanity/image-url` direct dep deliberate; `generated.ts` ESLint-exempt.
- Husky pre-commit is active — every commit auto-runs lint+format.
