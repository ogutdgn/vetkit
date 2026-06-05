# Project architecture

> A walkthrough of the vetkit repository skeleton. This document explains **what each folder and config file is for** and **whether it's committed to git or generated locally**. It complements [CLAUDE.md](../CLAUDE.md), which holds the higher-level decisions and conventions; this file is the practical "what is this thing?" reference.
>
> Update this file whenever the skeleton changes (new package, new config, new build artifact directory).

---

## 1. Mental model

vetkit is a **monorepo**: a single git repository that contains multiple related packages (apps and shared libraries) managed together.

Three layers, top to bottom:

| Layer          | What lives here                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root**       | Tooling configs (pnpm workspace, Turborepo, Prettier, Node version, gitignore), shared TypeScript settings, project-level documentation.    |
| **Workspaces** | The actual deployable apps (`apps/web`, `apps/studio`) and shared internal libraries (`packages/*`).                                        |
| **Generated**  | Build outputs and caches (`node_modules/`, `.next/`, `.turbo/`, etc.). Never committed; recreated by `pnpm install` and the build commands. |

The whole point of the monorepo is: **one place for the website code + one place for the CMS schema + shared TypeScript/ESLint/Tailwind settings, all in lock-step.** A bug fix or a schema change is one PR, not two.

---

## 2. Root files (all committed)

### Workspace and build orchestration

| File                                            | What it does                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`package.json`](../package.json)               | Root manifest. Declares the project name, the pnpm version (`packageManager`), the engine requirements (Node ≥ 20.9), and shared scripts (`pnpm dev`, `pnpm build`, `pnpm typecheck`) that delegate to Turbo.                               |
| [`pnpm-workspace.yaml`](../pnpm-workspace.yaml) | Tells pnpm "the sub-packages of this repo live under `apps/*` and `packages/*`." This is what makes one `pnpm install` install everything and lets packages reference each other with `"workspace:*"`.                                      |
| [`turbo.json`](../turbo.json)                   | Turborepo task pipeline. Declares dependencies between tasks (e.g. "before building app A, build the libraries it depends on"), cacheable outputs, and global env files. Turbo turns "rebuild everything" into "rebuild only what changed." |
| [`tsconfig.json`](../tsconfig.json)             | Root TypeScript config. Mostly a pointer/extension surface — the real per-app configs live in each app and extend [`@vetkit/config-typescript`](../packages/config-typescript/).                                                            |

### Tooling

| File                            | What it does                                                                                                                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`.nvmrc`](../.nvmrc)           | One line: `24`. Pins the Node.js version for the project. `nvm use` reads it; CI and Vercel can read it; collaborators get the same Node out of the box.                                                        |
| [`.prettierrc`](../.prettierrc) | Prettier formatter rules (single quotes, trailing commas, line width, etc.). Run on save in the editor and via `pnpm format`. Without it, every contributor's diff would be polluted by formatting differences. |
| [`.gitignore`](../.gitignore)   | Files and folders git should never track: `node_modules/`, `.next/`, `.turbo/`, `.env`, build outputs, OS junk, and `old-sites/` (vetkit-specific — see CLAUDE.md §7).                                          |

### Documentation

| File                          | What it does                                                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`CLAUDE.md`](../CLAUDE.md)   | The single source of truth for architectural decisions, conventions, and the project plan. Read this before making changes; update it when a decision changes. |
| [`README.md`](../README.md)   | Public-facing repo intro (when added).                                                                                                                         |
| [`project-documentation/`](.) | This folder. All committed reference material that elaborates on what `CLAUDE.md` summarizes.                                                                  |

---

## 3. The `apps/` directory

Each subfolder is a standalone application that gets deployed somewhere.

### [`apps/web/`](../apps/web/)

The Next.js 16.2.4 site that visitors actually see. Deployed once **per client** as a separate Vercel project, all sharing this same source code (env vars and the `TEMPLATE` flag differentiate them at build time — see [CLAUDE.md §2.1](../CLAUDE.md)).

Key files (current state of the skeleton):

| Path                             | Purpose                                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`, `app/page.tsx` | Root App Router entries. Currently a placeholder landing page; the marketing pages and templates land in later phases.                                                       |
| `next.config.ts`                 | Next.js configuration. `images.remotePatterns` is set to allow Sanity's CDN (`cdn.sanity.io`) — required since `images.domains` was deprecated in Next 16.                   |
| `tsconfig.json`                  | Extends `@vetkit/config-typescript/nextjs.json`.                                                                                                                             |
| `next-env.d.ts`                  | Auto-managed by Next.js (do not edit).                                                                                                                                       |
| `.env.example`                   | Documents which environment variables the app needs (Sanity credentials, site identity, template choice, Resend key). The real `.env.local` is per-developer and gitignored. |

### [`apps/studio/`](../apps/studio/)

The Sanity v3 admin panel. Each client gets a separate Sanity project (free tier per project), and this Studio is deployed to `<client>.sanity.studio` for them to manage content.

| Path               | Purpose                                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sanity.config.ts` | Studio config. Reads `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` from env so the same code runs against any tenant.                                                         |
| `sanity.cli.ts`    | Sanity CLI config (used by `sanity deploy`).                                                                                                                                           |
| `schemas/index.ts` | Currently exports an empty array. Phase 1 will populate it with `siteSettings`, `service`, `blogPost`, `teamMember`, `galleryImage`, `faq`, `page` (see [CLAUDE.md §5](../CLAUDE.md)). |
| `tsconfig.json`    | Extends `@vetkit/config-typescript/react-library.json`.                                                                                                                                |
| `.env.example`     | Documents the two Studio env vars.                                                                                                                                                     |

---

## 4. The `packages/` directory

Internal shared libraries. Other workspaces consume them via `"@vetkit/<name>": "workspace:*"` in their `package.json`. They are not published to npm.

### [`packages/config-typescript/`](../packages/config-typescript/)

Three TypeScript config presets that the apps extend:

- `base.json` — strict mode, target ES2022, `noUncheckedIndexedAccess`, common compiler flags. Everything inherits from this.
- `nextjs.json` — extends `base.json`, adds DOM lib, the Next.js plugin, JSX preserve, bundler resolution.
- `react-library.json` — extends `base.json`, adds DOM lib and `jsx: react-jsx` for non-Next React code (like the Sanity Studio).

If we need to tighten or relax a TS rule, **we change it here once** and every app picks it up on the next typecheck.

### `packages/sanity-types/` — generated Sanity schema types

Holds the TypeScript types generated from `apps/studio/schemas/` by Sanity's official `sanity typegen` CLI. Consumers import them as `@vetkit/sanity-types` (e.g. `import type { Service, BlogPost } from '@vetkit/sanity-types'`); `apps/web/types/sanity.ts` is a thin re-export shim so route handlers and components can do `import type { Service } from '@/types/sanity'` without crossing the monorepo boundary manually.

Files:

- `package.json` — name `@vetkit/sanity-types`, private, no build step. The `exports` map exposes the root re-export and `./generated`.
- `tsconfig.json` — extends `@vetkit/config-typescript/react-library.json`.
- `index.ts` — `export * from './generated'`.
- `generated.ts` — **auto-generated by `sanity typegen generate`**. Do not edit by hand. Checked in so Vercel/CI don't have to run codegen at install time.
- `schema.json` — extracted by `sanity schemas extract`. Intermediate artifact consumed by typegen. Checked in for the same reason.

**Workflow** (run any time you touch `apps/studio/schemas/`):

```bash
pnpm --filter @vetkit/studio typegen
```

That runs `sanity schemas extract` (writes `schema.json`) then `sanity typegen generate` (reads `schema.json` plus the `typegen` block in `apps/studio/sanity.cli.js`, writes `generated.ts`). Commit the two regenerated files alongside the schema changes that prompted them. The watch mode (`sanity typegen generate --watch`) is available for iterative work, but the standard flow is run-on-demand. `generated.ts` is excluded from ESLint (see `packages/config-eslint/base.mjs`) so the checked-in file stays byte-identical to raw typegen output.

GROQ query types come later — the typegen `path` glob points at `apps/web/{app,components,lib,templates,types}/**/*.{ts,tsx}` so once Chunk 7 introduces `defineQuery(...)` calls in `apps/web/lib/sanity/queries.ts`, the next typegen run will pick them up automatically.

### Future packages (not yet created)

- `packages/config-tailwind/` — shared Tailwind preset (theme tokens, plugins). Lands when the second template ships and tokens need to be DRYed across templates.

We add new packages **only when there's a real need to share code.** Premature abstraction is a real cost.

---

## 5. Generated / never-committed directories

These appear in your working copy but are listed in `.gitignore`. If you delete them, the next install/build recreates them.

| Path                                 | Created by                   | What it is                                                                                                 |
| ------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `node_modules/`                      | `pnpm install`               | All npm dependencies. ~1000 packages, hundreds of MB. Recreatable from `package.json` + `pnpm-lock.yaml`.  |
| `.next/`                             | `next dev`, `next build`     | Next.js compiled output, hot-reload assets, generated route types (`.next/dev/types/routes.d.ts`).         |
| `.turbo/`                            | `turbo` (any task)           | Turborepo's local cache of task results so unchanged work isn't redone.                                    |
| `.sanity/`                           | `sanity build`, `sanity dev` | Studio build output.                                                                                       |
| `.vercel/`                           | `vercel link`                | Vercel CLI metadata pointing the local checkout at a specific Vercel project.                              |
| `dist/`, `build/`, `out/`            | Various tools                | Generic build outputs.                                                                                     |
| `*.tsbuildinfo`                      | `tsc`                        | TypeScript incremental compilation cache.                                                                  |
| `coverage/`                          | Test runners                 | Test coverage reports.                                                                                     |
| `.env`, `.env.local`, `.env.*.local` | The developer                | Per-developer secrets and overrides. The committed file is `.env.example`. **Never commit a real `.env`.** |

`pnpm-lock.yaml` is the **exception**: it's auto-generated by pnpm but is **always committed**. It guarantees that everyone (and CI, and Vercel) installs exactly the same versions.

---

## 6. The `old-sites/` directory

Read-only reference material — copies of the two existing client sites (gigi-veteriner, ovapark-veteriner). It is gitignored (it's just for content migration reference, not part of the new product). See [CLAUDE.md §7](../CLAUDE.md) for the full rationale.

---

## 7. The `project-documentation/` directory

The folder you're reading this from. All committed long-form documentation lives here, alongside `CLAUDE.md` at the root.

Current contents:

- `PROJECT-ARCHITECTURE.md` (this file) — repo skeleton walkthrough.
- `NEXTJS-16.md` — local-only working notes about Next.js 16 specifics. **Gitignored** by an entry in `.gitignore`. Useful for the developer/AI assistant; not part of the public repo.

Planned contents (will be added as the project grows):

- `SCHEMA.md` — Sanity schema reference, kept in sync with `apps/studio/schemas/`.
- `ONBOARDING.md` — step-by-step playbook for spinning up a new client.
- `CLIENT-GUIDE.md` — Turkish-language end-user guide for clinic owners using the Studio. (Per CLAUDE.md, this one stays in Turkish; everything else here is in English.)

The structure is intentionally flat for now. Subfolders can come in if a topic grows large enough to warrant it (e.g. `project-documentation/templates/` if the three template designs need their own pages).

---

## 8. How a typical command flows

Quick mental model for the most common operations:

- **`pnpm install`** — pnpm reads `pnpm-workspace.yaml`, finds all sub-packages, installs everything into a single shared `node_modules` (with symlinks). Workspace dependencies are linked, not downloaded.
- **`pnpm dev`** — runs `turbo run dev`. Turbo checks `turbo.json`, sees that `dev` is `cache: false, persistent: true` (a long-running task), and starts each workspace's own `dev` script in parallel. For us today: `next dev` for `apps/web`, `sanity dev` for `apps/studio`.
- **`pnpm build`** — runs `turbo run build`. Turbo respects `dependsOn: ["^build"]`, so library packages build before their consumers. Build outputs (`.next/`, `dist/`) are declared in `turbo.json` so Turbo can cache them.
- **`pnpm typecheck`** — runs `tsc --noEmit` in every workspace. Each workspace's `tsconfig.json` extends our shared preset, so every app validates against the same strict rules.

---

## 9. What lives where — quick lookup

| If you need to change…                   | Edit…                                    |
| ---------------------------------------- | ---------------------------------------- |
| The website's pages, components, styling | `apps/web/`                              |
| What clinic owners can edit (CMS schema) | `apps/studio/schemas/`                   |
| TypeScript strictness rules              | `packages/config-typescript/base.json`   |
| Build/cache rules                        | `turbo.json`                             |
| Required Node version                    | `.nvmrc` and `package.json#engines.node` |
| Code formatting rules                    | `.prettierrc`                            |
| What git should ignore                   | `.gitignore`                             |
| Project-wide decisions / conventions     | `CLAUDE.md`                              |
| Long-form architectural docs             | this folder, `project-documentation/`    |
