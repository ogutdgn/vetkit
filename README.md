# vetkit

A multi-tenant web platform for veterinary clinics. One codebase, many clinic websites — each with its own content, branding, and admin panel.

## What it is

vetkit lets a small studio run several veterinary-clinic sites without forking a new repo for every client. The Next.js app is deployed once per clinic as a separate Vercel project, all pointing at this same source. Each clinic gets its own Sanity Studio so the owner can edit services, blog posts, team, gallery, FAQ, and contact info without developer involvement.

The first two clinics being onboarded are gigiveteriner.com and ovaparkveteriner.com.

## Tech

- **Next.js 16.2.4** (App Router, Turbopack) on Vercel
- **React 19.2** with React Server Components
- **Sanity v3** as the headless CMS — one project per clinic
- **TypeScript 5** with strict mode and `noUncheckedIndexedAccess`
- **Tailwind CSS v4** for styling
- **Resend** for contact-form email delivery (no database)
- **pnpm workspaces + Turborepo** monorepo
- **Node.js 24 LTS** (pinned via `.nvmrc`)

## Repository layout

```
apps/
  web/        # Next.js site — deployed once per clinic
  studio/     # Sanity Studio — deployed once per clinic
packages/
  config-typescript/   # shared TS config presets
project-documentation/ # architecture, schema, onboarding, execution map
CLAUDE.md              # the architectural source of truth
```

For a deeper walkthrough of every folder, what is committed vs. generated, and how the build commands flow, see [`project-documentation/PROJECT-ARCHITECTURE.md`](project-documentation/PROJECT-ARCHITECTURE.md).

## Getting started

```bash
# Install all workspace dependencies
pnpm install

# Run the Next.js site (apps/web)
pnpm --filter @vetkit/web dev

# Run the Sanity Studio (apps/studio)
pnpm --filter @vetkit/studio dev

# Or run everything at once
pnpm dev
```

Per-app environment variables are documented in `apps/web/.env.example` and `apps/studio/.env.example`. Copy each to `.env.local` and fill in real values for the clinic you're running locally.

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — architectural decisions, conventions, anti-patterns, decision log.
- [`project-documentation/EXECUTION-MAP.md`](project-documentation/EXECUTION-MAP.md) — current state of the build, the active chunk of work, and the ordered Phase 1 backlog.
- [`project-documentation/PROJECT-ARCHITECTURE.md`](project-documentation/PROJECT-ARCHITECTURE.md) — repo skeleton walkthrough.

## Built by

vetkit is built and maintained by **[Dastugo](https://dastugo.com)** — an AI and software-development studio operating between Turkey and the United States.

The project was created by Dastugo's founders:

- **Dogan O.** — [github.com/ogutdgn](https://github.com/ogutdgn)
- **Serap O.** — [github.com/oykuserap](https://github.com/oykuserap)
