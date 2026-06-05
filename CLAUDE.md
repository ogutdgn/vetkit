# CLAUDE.md — vetkit

> **For Claude Code and any AI assistant working on this project.**
>
> This document is the single source of truth for vetkit's architecture, decisions, and conventions. Read it fully before making any changes. If a decision needs to change, update this document first, then implement.

---

## 1. Project overview

**vetkit** is a multi-tenant web platform for veterinary clinics. A single codebase serves multiple clinic websites, each with isolated content managed through a CMS.

### Business model

- Currently 2 existing clients to migrate: **gigiveteriner.com** and **ovaparkveteriner.com**
- Their existing sites are static HTML/CSS/JS with some PHP — see `./old-sites/` for reference (more on this in section 7)
- 1-year target: 2-5 clinics
- Revenue model: site delivery fee + monthly maintenance/hosting fee
- Each client gets their own admin panel (Sanity Studio) to manage content (services, blog posts, gallery, team, FAQ, clinic info) without developer involvement

### Problems being solved

1. The old setup keeps each client in a separate static HTML folder. Bug fixes and feature updates must be applied manually to every repo. Unsustainable past 2-3 clients.
2. Clients cannot edit their own content. Every minor update (new service, blog post, phone number change) requires the developer.
3. The old sites lack modern SEO infrastructure: no structured data, no dynamic OG images, no proper sitemap, no semantic HTML for local SEO.

---

## 2. Architectural decisions

Every decision below has been deliberated. Do not change without reading the rationale and updating this document.

### 2.1 Multi-tenancy strategy: **One codebase, N Vercel projects**

**Decision:** Single GitHub monorepo. For each client, create a separate Vercel project that points to the same GitHub repo. Tenant differentiation happens via **environment variables** at build time.

**Rationale:**

- A separate repo per client means bug fixes get applied N times, code fossilizes per client, and the system collapses past 3-4 clients. This is the exact problem the old setup created.
- Domain-based runtime tenant detection (single deploy, hostname → tenant resolution) is overengineering for 2-5 clients. Vercel projects are free, deployment isolation is clean, and build-time decisions are simpler.
- Template selection (see 2.4) is also build-time. There is no runtime tenant decision logic anywhere in the codebase.

**Rejected alternatives:**

- ❌ One repo per client (the old system's mistake — unsustainable)
- ❌ Single Vercel project + middleware-based hostname routing (revisit only at 15+ clients)

### 2.2 CMS: **Sanity** (not Supabase, not Payload, not Strapi)

**Decision:** Each client gets their own Sanity project. The schema is defined once in `apps/studio/` and deployed per project.

**Rationale:**

- Sanity ships with a polished content management UI out of the box: rich text editor, image hotspot/cropping, draft/publish workflow, document preview, references. Building this UI from scratch is 2-3 weeks of work that adds zero customer value.
- Free tier per project: 3 users, 10GB assets, 500K API CDN requests/month. A vet clinic site stays well within this. So 5 clients = 5 free Sanity projects = $0/month for CMS.
- Managed service — no hosting, no DB backups, no monitoring overhead.
- TypeScript codegen via the official `sanity typegen` CLI produces types from schema and GROQ queries, enabling type-safe data fetching in Next.js.

**Rejected alternatives:**

- ❌ **Supabase as CMS:** Would require building a custom admin UI (rich text, image upload + CDN, draft/publish, preview). 2-3 weeks of non-revenue work. Wrong tool.
- ❌ **Payload CMS:** Self-hosted, requires MongoDB or Postgres, you own monitoring/backups. Pricing becomes more attractive at 15+ clients, but at 2-5 the operational overhead is too high.
- ❌ **Strapi:** Same self-hosting overhead, weaker DX.

**Accepted trade-off:** Sanity's free tier limits to 3 users per project. If a clinic has 4+ people who need Studio access, paid plan ($15/month/project) is required. Pass this through to client pricing — do not absorb.

### 2.3 Form handling: **Resend (email-only), no database**

**Decision:** Contact form submissions are emailed directly to the clinic's email address via Resend. No data is persisted in any database.

**Rationale:**

- Vet clinics already use Gmail/Outlook for communication. They do not want or need a separate CRM dashboard.
- Adding a database means: infrastructure overhead, GDPR/KVKK considerations for stored personal data, building a "messages" view in some panel. None of this is requested or valuable at this scale.
- Resend free tier: 3000 emails/month. Vastly sufficient.

**Future trigger for revisiting:** If 5+ clients exist and we want a unified internal admin panel showing all incoming form submissions across clinics, Supabase can be introduced as an internal admin layer. **YAGNI for now.**

### 2.4 Template system: **3 build-time templates, no runtime switching**

**Decision:** Three visually distinct templates live in `apps/web/templates/` (`modern`, `classic`, `premium`). Each client selects one template via the `TEMPLATE` environment variable at deploy time and uses it for the lifetime of their site.

**Rationale:**

- Clients do not switch templates after launch. There is no real-world need for runtime switching.
- Build-time selection enables tree-shaking — only the chosen template's components ship in the JS bundle.
- All non-visual logic (data fetching, SEO, form handling, routing, schema) is **shared** across templates. Only presentation differs.

**Critical contract — schema is the lowest common denominator:**

- All three templates consume **the same Sanity schema**. No template may demand a template-specific field.
- When adding a new feature, the schema field must make sense for **all three** templates. If a field is meaningful for only one template, the design is wrong — rethink it.
- Templates render the same data differently (e.g. services may be a carousel in `modern`, a grid in `classic`, a list in `premium`). They never request different data shapes.

**Template contract (TypeScript):**

- Every template must export the same component names with the same props interface.
- This is enforced via a shared `ThemeComponents` interface in `apps/web/types/template.ts`.
- A template that renames `Header` to `NavBar` or accepts different props for `Hero` is broken by definition.

**Rejected alternatives:**

- ❌ **Runtime theme switching (theme selected in Sanity):** Adds complexity for no real-world benefit. Clients pick once and stay.
- ❌ **Block/section page builder:** Reconsider only past 5 clients. At current scale, the freedom given to clients destroys design consistency. Clients will create ugly pages and blame the platform.
- ❌ **One repo per template:** Same multi-tenancy problem repeated at the template level. Unsustainable.

**Phased implementation:**

- **Phase 1:** Build only the `modern` template. Ship gigi-veteriner with it. Validate the schema with real content.
- **Phase 2:** After client feedback, build `classic`. Migrate ovapark-veteriner.
- **Phase 3:** Build `premium` only if a third client requests something the first two templates cannot deliver. Otherwise leave it out — having two solid templates is better than three half-finished ones.

**Important:** The folder structure should accommodate three templates from day one (so the contract is enforced early), but only `modern` needs actual implementation in Phase 1. Leave `classic/` and `premium/` as empty placeholders with a `README.md` explaining "not yet implemented."

### 2.5 Brand customization

**Decision:** Brand color, logo, and font choice live in the `siteSettings` singleton in Sanity. Templates consume these as CSS variables at runtime.

**Rationale:**

- The same template with different brand colors looks substantially different across clients. This alone provides meaningful visual variety even with a single template.
- Rebranding a client (color change, logo update) requires zero code changes — the client edits Sanity and the change is live.

**Implementation note:** Each template has its own `tokens.css` defining defaults. The Sanity values override these via inline `style` on the root layout element, written by a server component that fetches `siteSettings` at request time.

---

## 3. Tech stack (locked)

```
Frontend:        Next.js 16.2.4 (App Router, RSC, Turbopack default — see project-documentation/NEXTJS-16.md, local-only)
React:           19.2 (bundled with Next 16; App Router uses React Canary)
Language:        TypeScript 5.1+ (strict mode, noUncheckedIndexedAccess: true)
CMS:             Sanity v3 (separate project per client)
Styling:         Tailwind CSS v4
Component lib:   shadcn/ui (copied into repo, not installed as package)
Form:            React Hook Form + Zod
Email:           Resend + React Email (for templates)
Hosting:         Vercel (separate project per client, same GitHub repo)
Monorepo:        Turborepo + pnpm workspaces
Node version:    v24 LTS "Krypton" (pinned in .nvmrc — Vercel default; Next 16 minimum is 20.9)
Type generation: sanity typegen — official CLI (schema + GROQ queries → TS types)
Linting:         ESLint flat config (eslint.config.mjs) + Prettier — `next lint` removed in 16
Git hooks:       Husky + lint-staged (pre-commit eslint + typecheck)
```

### Forbidden / not used

- ❌ **Pages Router** — App Router only
- ❌ **Plain JavaScript** — only `.ts` / `.tsx`
- ❌ **npm or yarn** — pnpm only (workspace consistency)
- ❌ **Supabase, Firebase, Prisma, any DB** — not at this stage
- ❌ **User authentication on the public site** — Sanity Studio has its own auth; the public site is fully public
- ❌ **Custom CSS files** — Tailwind utilities + design tokens only
- ❌ **MUI, Chakra, Mantine, Ant Design** — shadcn/ui is sufficient
- ❌ **Redux, Zustand, Jotai** — server components + URL state are sufficient at this complexity
- ❌ **i18n libraries** — sites are Turkish-only by default; revisit if a multi-language client appears
- ❌ **Analytics SDKs by default** — Vercel Analytics is opt-in per client, not bundled

---

## 4. Folder structure (canonical)

```
vetkit/
├── apps/
│   ├── web/                              # Next.js — deployed once per client
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   │   ├── page.tsx              # home
│   │   │   │   ├── hakkimizda/page.tsx   # about
│   │   │   │   ├── hizmetler/
│   │   │   │   │   ├── page.tsx          # services list
│   │   │   │   │   └── [slug]/page.tsx   # service detail
│   │   │   │   ├── blog/
│   │   │   │   │   ├── page.tsx          # blog list
│   │   │   │   │   └── [slug]/page.tsx   # blog post
│   │   │   │   ├── galeri/page.tsx       # gallery
│   │   │   │   ├── sss/page.tsx          # FAQ
│   │   │   │   └── iletisim/page.tsx     # contact
│   │   │   ├── api/
│   │   │   │   ├── contact/route.ts      # form → Resend
│   │   │   │   └── revalidate/route.ts   # Sanity webhook → on-demand ISR
│   │   │   ├── layout.tsx                # root layout, metadata, theme tokens
│   │   │   ├── sitemap.ts                # dynamic, pulls slugs from Sanity
│   │   │   ├── robots.ts
│   │   │   ├── manifest.ts
│   │   │   ├── opengraph-image.tsx       # dynamic OG generation
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── shared/                   # used by all templates
│   │   │   │   ├── ContactForm.tsx
│   │   │   │   ├── SEOHead.tsx
│   │   │   │   └── ImageGallery.tsx
│   │   │   └── ui/                       # shadcn primitives (button, input, etc.)
│   │   ├── templates/
│   │   │   ├── modern/                   # Phase 1 — implemented
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── ServiceCard.tsx
│   │   │   │   ├── BlogCard.tsx
│   │   │   │   ├── TeamSection.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── tokens.css            # default colors/fonts for this template
│   │   │   │   └── index.ts              # exports all components
│   │   │   ├── classic/                  # Phase 2 — placeholder
│   │   │   │   └── README.md             # "not yet implemented"
│   │   │   └── premium/                  # Phase 3 — placeholder
│   │   │       └── README.md
│   │   ├── lib/
│   │   │   ├── sanity/
│   │   │   │   ├── client.ts             # createClient using env projectId
│   │   │   │   ├── queries.ts            # GROQ queries (defineQuery)
│   │   │   │   ├── tags.ts               # OD-5 cache-tag builders
│   │   │   │   ├── image.ts              # urlFor builder
│   │   │   │   └── live.ts               # sanityFetch + draft mode
│   │   │   ├── seo/
│   │   │   │   ├── metadata.ts           # generateMetadata helpers
│   │   │   │   └── schema.ts             # JSON-LD: LocalBusiness, VeterinaryCare
│   │   │   ├── email/
│   │   │   │   └── resend.ts             # Resend client wrapper
│   │   │   └── template.ts               # selects template based on TEMPLATE env
│   │   ├── types/
│   │   │   ├── template.ts               # ThemeComponents contract
│   │   │   └── sanity.ts                 # re-exports from packages/sanity-types
│   │   ├── public/                       # favicons, robots fallback
│   │   ├── .env.example                  # documents required env vars
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs            # Tailwind v4 PostCSS plugin (CSS-first config; no tailwind.config.ts)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── studio/                           # Sanity Studio — deployed once per client
│       ├── schemas/
│       │   ├── documents/
│       │   │   ├── service.ts
│       │   │   ├── blogPost.ts
│       │   │   ├── teamMember.ts
│       │   │   ├── faq.ts
│       │   │   ├── galleryImage.ts
│       │   │   └── page.ts               # generic flexible page
│       │   ├── singletons/
│       │   │   └── siteSettings.ts       # one record per project (clinic info, branding)
│       │   ├── objects/
│       │   │   ├── seo.ts                # reusable SEO object embedded in documents
│       │   │   ├── openingHours.ts
│       │   │   └── socialLinks.ts
│       │   └── index.ts                  # exports all schemas
│       ├── structure/
│       │   └── deskStructure.ts          # custom Studio sidebar (Turkish labels)
│       ├── lib/
│       │   └── i18n.ts                   # Studio UI in Turkish
│       ├── sanity.config.ts
│       ├── sanity.cli.ts
│       └── package.json
│
├── packages/                             # shared code (lazy — add only when needed)
│   ├── sanity-types/                     # generated TS types from schema + queries
│   │   ├── index.ts
│   │   ├── generated.ts
│   │   ├── schema.json
│   │   └── package.json
│   ├── config-eslint/
│   ├── config-typescript/
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   └── react-library.json
│   └── config-tailwind/                  # shared Tailwind preset
│
├── scripts/                              # operational tooling (build over time)
│   ├── new-tenant.ts                     # create new Sanity + Vercel project, set envs
│   ├── seed-content.ts                   # seed initial content for a new client
│   └── deploy-studio.sh                  # deploy Studio to studio.<client>.com
│
├── old-sites/                            # READ-ONLY reference — see section 7
│   ├── gigi-veteriner/                   # original HTML/CSS/JS
│   └── ovapark-veteriner/
│
├── project-documentation/                # all committed project docs live here
│   ├── plan.md                           # master plan + ordered Phase 1 backlog + open decisions (checkboxes)
│   ├── execution-map.md                  # next session's focused chunk — read first when picking up work
│   ├── last-point.md                     # session-boundary snapshot (refreshed before chat close / big ops)
│   ├── PROJECT-ARCHITECTURE.md           # repo skeleton walkthrough (commit/ignore, what each folder does)
│   ├── ONBOARDING.md                     # step-by-step new client setup
│   ├── SCHEMA.md                         # schema documentation
│   └── CLIENT-GUIDE.md                   # end-user guide for clinic owners (Turkish)
│   # NEXTJS-16.md lives in this folder locally but is gitignored (working notes)
│
├── .github/workflows/
│   ├── ci.yml                            # lint, typecheck, build
│   └── deploy-studio.yml
│
├── CLAUDE.md                             # this file
├── README.md
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                          # root, workspaces declared
├── .nvmrc
├── .gitignore
└── .prettierrc
```

### Folder rules

- **Do not create `packages/ui` until at least 2 templates exist and share components.** Premature abstraction is a real risk in monorepos.
- **Do not create `apps/admin` (internal panel for the developer).** Build that only when 5+ clients exist and operational pain is real.
- **`old-sites/` is read-only reference material.** Never modify, never deploy from there.

---

## 5. Sanity schema design principles

The schema is the most critical design artifact in this project. A bad schema is painful to migrate later (Sanity migrations are write-scripts, and clients hate disruption). Get it right early.

### Core principles

1. **One schema, all templates.** No template-specific fields. If a field exists, it must be meaningful to all three templates (even if rendered differently).
2. **Every document type that has a public URL must have an embedded `seo` object.** This includes services, blog posts, and pages. The `seo` object contains: `metaTitle`, `metaDescription`, `ogImage`, `noIndex`. These override defaults computed from the document body.
3. **Every Turkish field must have a Turkish description in the schema.** Clinic owners are not developers. A field labeled "slug" with no description is useless to them. Use `description: 'URL adresinde görünecek kısa kimlik (örn: kedi-asilamasi)'`.
4. **Every image field must have `hotspot: true`** so clinic owners can crop their own images.
5. **Rich text (Portable Text) limits:** Allowed marks: `strong`, `em`, `link`. Allowed block styles: `normal`, `h2`, `h3`, `blockquote`. **Disallow `h1`** — the page title is already an h1, and clinic owners will accidentally create multiple h1s, hurting SEO.
6. **Use `orderable-document-list` plugin** for documents that have explicit ordering (services on the homepage, team members, FAQ entries). Drag-and-drop reordering > manual `order: number` field.
7. **Singletons (one-and-only-one document) are enforced via custom Studio structure.** `siteSettings` is the canonical example — there must be exactly one per project.

### Required document types (Phase 1)

| Type           | Plural label (TR)     | Purpose                                                                                                | Singleton? |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| `siteSettings` | Klinik Bilgileri      | Clinic name, logo, primary color, address, phone, email, opening hours, social links, Maps coordinates | Yes        |
| `service`      | Hizmetler             | Veterinary services offered                                                                            | No         |
| `blogPost`     | Blog Yazıları         | Articles                                                                                               | No         |
| `teamMember`   | Ekip                  | Veterinarians and staff                                                                                | No         |
| `galleryImage` | Galeri                | Clinic photos                                                                                          | No         |
| `faq`          | Sıkça Sorulan Sorular | FAQ entries with category                                                                              | No         |
| `page`         | Sayfalar              | Generic flexible pages (e.g. "Hakkımızda")                                                             | No         |

### Reusable objects

- `seo` (metaTitle, metaDescription, ogImage, noIndex)
- `openingHours` (day-by-day open/close, plus closed flag)
- `socialLinks` (instagram, facebook, x, youtube, tiktok — all optional)
- `cta` (label, link — used in hero, footer, etc.)

### Schema extraction task

When implementing the schema, **read `./old-sites/gigi-veteriner/` and `./old-sites/ovapark-veteriner/`** to understand what content currently exists. Use this to **inform** the schema, not to **constrain** it. Specifically:

- Extract all visible content categories (services listed, blog topics, team bios, etc.)
- Note what's hardcoded that should become editable (phone numbers, addresses, opening hours)
- Identify what's missing that a clinic owner might want to manage (online appointment CTA, emergency contact banner, social media links)

The schema should be a **superset** of what the old sites had — design for what clinic owners would _want_ to manage, not just what currently exists.

---

## 6. Template system contract

### TypeScript contract

```typescript
// apps/web/types/template.ts
import type { ComponentType } from 'react';
import type { SiteSettings, Service, BlogPost, TeamMember } from './sanity';

export interface HeaderProps {
  settings: SiteSettings;
  navItems: Array<{ label: string; href: string }>;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  media?: SanityImage | SanityVideo;
  cta?: { label: string; href: string };
}

export interface ServiceCardProps {
  service: Service;
}

// ... all other component prop interfaces

export interface ThemeComponents {
  Header: ComponentType<HeaderProps>;
  Hero: ComponentType<HeroProps>;
  ServiceCard: ComponentType<ServiceCardProps>;
  BlogCard: ComponentType<BlogCardProps>;
  TeamSection: ComponentType<TeamSectionProps>;
  Footer: ComponentType<FooterProps>;
}
```

Each template's `index.ts` must satisfy `ThemeComponents`:

```typescript
// apps/web/templates/modern/index.ts
import type { ThemeComponents } from '@/types/template';
import { Header } from './Header';
import { Hero } from './Hero';
// ...

const modern: ThemeComponents = { Header, Hero, ServiceCard /* ... */ };
export default modern;
```

### Template loading

```typescript
// apps/web/lib/template.ts
import type { ThemeComponents } from '@/types/template';

export async function getTemplate(): Promise<ThemeComponents> {
  const name = process.env.TEMPLATE ?? 'modern';
  switch (name) {
    case 'modern':
      return (await import('@/templates/modern')).default;
    case 'classic':
      return (await import('@/templates/classic')).default;
    case 'premium':
      return (await import('@/templates/premium')).default;
    default:
      throw new Error(`Unknown template: ${name}`);
  }
}
```

Pages call `getTemplate()` once, destructure components, render. Tree-shaking handles the rest.

---

## 7. Reference: existing client sites (`./old-sites/`)

The `old-sites/` directory contains read-only copies of the two existing clients' websites. **These are reference material only — never edit, never deploy from there.**

```
old-sites/
├── gigi-veteriner/        # original code from github.com/ogutdgn/gigi-veteriner
└── ovapark-veteriner/     # original code from github.com/ogutdgn/ovapark-veteriner
```

### Tech stack of old sites

- Static HTML (multiple pages: index, blog-modern, blog-single, contact-us, gallery, our-faqs, our-services, 404)
- CSS (~40% of the codebase)
- JavaScript (~42%, mostly DOM manipulation and form handling)
- Some PHP (~2%, likely contact form handler)
- No build system, no framework, no CMS

### Use these directories to:

1. **Extract content for migration.** When seeding the new Sanity projects with initial content, copy text, images, and structure from the old sites.
2. **Inform schema design.** What fields exist? What's hardcoded that should be editable? What's missing that should be added?
3. **Preserve URL structure.** If old URLs are indexed by Google, the new site should ideally match (e.g. `/blog-single.html?id=5` → `/blog/[slug]`). Set up redirects in `next.config.ts` if needed.
4. **Avoid regressions.** Whatever the old site does well (e.g. a particular service description, a clinic photo composition), preserve in the new site.

### Do NOT:

- Copy old CSS or JS into the new codebase. The new site is built from scratch with modern tooling.
- Replicate the old design pixel-for-pixel. The new templates are deliberately modern.
- Use the old PHP form handler. Form submissions go through Resend (see 2.3).

---

## 8. Environment variables

Each Vercel project (one per client) needs the following env vars:

```bash
# Sanity (per-client)
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx     # unique per client
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...                 # for draft mode and webhook revalidation
SANITY_REVALIDATE_SECRET=<random-string>    # validates webhook authenticity

# Site identity
NEXT_PUBLIC_SITE_URL=https://gigiveteriner.com
NEXT_PUBLIC_SITE_NAME="Gigi Veteriner"
NEXT_PUBLIC_DEFAULT_LOCALE=tr-TR

# Template selection
TEMPLATE=modern                              # modern | classic | premium

# Email (Resend)
RESEND_API_KEY=re_...
CLINIC_EMAIL=info@gigiveteriner.com          # where contact form submissions go
CONTACT_FROM_EMAIL=iletisim@gigiveteriner.com  # verified domain in Resend
```

`.env.example` in `apps/web/` must always reflect this list. Any new env var added must be documented in both `.env.example` and this section.

---

## 9. New client onboarding playbook

Goal: 30 minutes from "client signed" to "site is live."

1. **Create Sanity project**

   ```bash
   cd apps/studio
   pnpm sanity init --create-project "<client-name>" --dataset production
   ```

   Save the project ID.

2. **Deploy Sanity Studio**

   ```bash
   pnpm sanity deploy
   ```

   Choose a hostname (e.g. `gigi-vetkit` → studio at `gigi-vetkit.sanity.studio`). Optionally CNAME `studio.<client-domain>.com` to it.

3. **Create Vercel project**
   - In Vercel dashboard: New Project → Import the vetkit GitHub repo
   - Set root directory to `apps/web`
   - Add environment variables from section 8
   - Deploy

4. **Configure domain**
   - Add the client's domain to the Vercel project
   - Update DNS records as instructed by Vercel

5. **Set up Sanity webhook**
   - In Sanity manage → Webhooks → Create
   - URL: `https://<client-domain>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
   - Trigger on: Create, Update, Delete

6. **Verify Resend domain**
   - In Resend dashboard, add and verify the client's domain for `CONTACT_FROM_EMAIL`

7. **Seed initial content**
   - Either use `scripts/seed-content.ts` (when built) or have the client populate Studio directly
   - For migrated clients: manually port content from `old-sites/<client>/` into Sanity

8. **Hand off to client**
   - Send Studio URL, login credentials, and the client guide (`project-documentation/CLIENT-GUIDE.md`)

When this playbook gets repeated 3+ times, automate steps 1, 3, and 5 in `scripts/new-tenant.ts`.

---

## 10. Phased roadmap

The roadmap and ordered backlog live in [`project-documentation/plan.md`](project-documentation/plan.md), **not here**. That file carries all four phases with checkboxes, the granular Phase 1 ordered backlog (chunk-by-chunk with dependencies and sizes), and the open-decisions list. Read it for "what's in scope and what's still on the backlog."

Companion operational docs:

- [`project-documentation/execution-map.md`](project-documentation/execution-map.md) — the **next session's** focused chunk. Read first when picking up work.
- [`project-documentation/last-point.md`](project-documentation/last-point.md) — **last session's** snapshot (last commit, working tree, what was done).

CLAUDE.md (this file) remains the architectural source of truth for **decisions and conventions** (sections 2, 5, 6, 11, 12). plan.md is for _what gets built_; execution-map.md is for _what gets built next_; last-point.md is for _what was just built_.

Process skills under `.claude/skills/` codify the update protocols for each operational doc:

- `updating-plan` — keep plan.md authoritative when chunks ship or decisions resolve.
- `updating-execution-map` — set the next chunk at session boundaries.
- `writing-last-point` — snapshot session-boundary state.
- `writing-commits` — Conventional Commits style for every commit on this project.

---

## 11. Anti-patterns (do not do these)

These are temptations that will damage the project. Resist them.

1. **Do not add features "just in case."** Every feature is technical debt until it's used. YAGNI applies hard at this scale.

2. **Do not add a database for form submissions in Phase 1.** Email is enough. (Section 2.3)

3. **Do not add user authentication on the public site.** Sites are public marketing pages. (Section 3)

4. **Do not let templates dictate schema fields.** If a template wants something the schema doesn't have, redesign the template, not the schema. (Section 2.4)

5. **Do not reproduce the old site's design.** New templates are deliberately modern. The old sites are reference for content, not visual style. (Section 7)

6. **Do not deploy each client from a separate repo.** This is the failure mode the project exists to escape. (Section 2.1)

7. **Do not implement all three templates before shipping the first client.** One polished template + one happy client > three half-done templates + zero clients. (Section 2.4)

8. **Do not put hardcoded clinic data in the codebase.** Everything client-specific lives in Sanity or environment variables. The codebase is template; Sanity is content; env is config.

9. **Do not skip TypeScript strictness.** `strict: true`, `noUncheckedIndexedAccess: true`, generated Sanity types — all mandatory.

10. **Do not introduce a state management library.** Server components and URL state cover this scale. Adding Zustand/Redux is premature.

11. **Do not write custom CSS files.** Tailwind utilities and design tokens (CSS variables defined in `tokens.css` per template) are the only styling layers.

12. **Do not internationalize prematurely.** Sites are Turkish. If a multi-language client appears, that's the moment to add i18n — not before.

13. **Do not add analytics by default.** Vercel Analytics is opt-in per client. Privacy and bundle size matter.

14. **Do not skip the schema documentation step.** Every schema change must update `project-documentation/SCHEMA.md` and re-run `pnpm --filter @vetkit/studio typegen`.

---

## 12. Decision log

| Date       | Decision                                                                                                                                                                                                                                                                                                                                                                                                                | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Document section                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 2026-05    | Multi-tenant via 1 repo + N Vercel projects (env-based)                                                                                                                                                                                                                                                                                                                                                                 | Avoids per-client repo fossilization; simpler than runtime tenant detection at this scale                                                                                                                                                                                                                                                                                                                                                                                       | 2.1                                                                |
| 2026-05    | Sanity as CMS                                                                                                                                                                                                                                                                                                                                                                                                           | Out-of-box admin UI, free tier covers scale, managed service                                                                                                                                                                                                                                                                                                                                                                                                                    | 2.2                                                                |
| 2026-05    | Resend for form submissions, no DB                                                                                                                                                                                                                                                                                                                                                                                      | Clinics use email anyway; DB is YAGNI at this scale                                                                                                                                                                                                                                                                                                                                                                                                                             | 2.3                                                                |
| 2026-05    | 3 build-time templates, schema is shared                                                                                                                                                                                                                                                                                                                                                                                | Real client behavior is "pick once, use forever"; build-time enables tree-shaking                                                                                                                                                                                                                                                                                                                                                                                               | 2.4                                                                |
| 2026-05    | Brand customization via Sanity (color, logo, font)                                                                                                                                                                                                                                                                                                                                                                      | Gives variety even within one template; no code changes for rebranding                                                                                                                                                                                                                                                                                                                                                                                                          | 2.5                                                                |
| 2026-05    | Phase 1 ships only `modern` template                                                                                                                                                                                                                                                                                                                                                                                    | Avoids paralyzing the first delivery; validate schema with one real client first                                                                                                                                                                                                                                                                                                                                                                                                | 2.4, 10                                                            |
| 2026-05    | Project name: `vetkit`                                                                                                                                                                                                                                                                                                                                                                                                  | Short, memorable, sector-flexible; clean npm scope                                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                  |
| 2026-05-06 | Next.js 16.2.4 (not 15)                                                                                                                                                                                                                                                                                                                                                                                                 | Latest stable; Turbopack default, async params/cookies/headers, new `revalidateTag(tag, profile)` signature, `next lint` removed. Project-specific impact tracked in `project-documentation/NEXTJS-16.md` (local-only).                                                                                                                                                                                                                                                         | 3                                                                  |
| 2026-05-06 | `project-documentation/` (not `docs/`) for committed docs                                                                                                                                                                                                                                                                                                                                                               | Renamed to make the folder's purpose explicit; all committed reference material (architecture, schema, onboarding, client guide) lives here. Personal/working notes (e.g. `NEXTJS-16.md`) sit in the same folder but are gitignored.                                                                                                                                                                                                                                            | 4                                                                  |
| 2026-05-06 | EXECUTION-MAP.md as live operational plan                                                                                                                                                                                                                                                                                                                                                                               | CLAUDE.md tracks decisions and conventions (what should be true); EXECUTION-MAP.md tracks current state and the next chunk of work (what to do next). Splitting them keeps each file's purpose sharp.                                                                                                                                                                                                                                                                           | 13, project-documentation/EXECUTION-MAP.md (superseded 2026-05-20) |
| 2026-05-20 | Split EXECUTION-MAP.md into three operational docs: `plan.md` (full plan + ordered backlog + open decisions), `execution-map.md` (next session's focused chunk only), `last-point.md` (session-boundary snapshot). Each has a paired `.claude/skills/` skill that codifies its update protocol (`updating-plan`, `updating-execution-map`, `writing-last-point`).                                                       | The single file was doing three jobs at once — full roadmap, next-up focus, and current-state snapshot — which made it hard to scan and prone to drift. Three sharper files, each with one purpose and a dedicated update skill, keep the operational docs trustworthy.                                                                                                                                                                                                         | 4, 10, 13                                                          |
| 2026-05-20 | Tailwind v4 with CSS-first config (no `tailwind.config.ts`); design tokens live per-template in `apps/web/templates/<name>/tokens.css`; Inter via `next/font/google` with `latin-ext` subset for Turkish characters. Resolves OD-5.                                                                                                                                                                                     | v4's idiomatic config is the `@theme` block in CSS, not a JS file. Per-template tokens.css matches §2.5 ("each template has its own tokens.css") and avoids a Phase 2 migration when classic adds its palette. Inter has strong Latin Extended coverage and a wide weight range that future components will need.                                                                                                                                                               | 2.5, 4                                                             |
| 2026-05-20 | Husky + lint-staged pre-commit hook with `eslint --fix` + `prettier --write` on staged JS/TS/MJS and Prettier-only on docs/styles. Resolves OD-2.                                                                                                                                                                                                                                                                       | A local gate catches lint and format mistakes before they hit CI or `main`. Per-commit latency (~1-3s) is tolerable; the alternative — CI-only, with `next lint` removed in Next 16 and no CI workflow yet (OD-3) — would mean no gate at all in the short term.                                                                                                                                                                                                                | 3                                                                  |
| 2026-05-26 | **Sanity v5** (revises the 2026-05-21 brainstorm pick of v4). Resolves OD-1. Bumps React/React-DOM to `^19.2.4` in both apps to satisfy the new Sanity peer dep. Workspace TS plumbing flattened (no nested tsconfig `extends`) and `apps/studio/sanity.cli` renamed to `.js` to keep Sanity v5's strict jiti loader happy in the monorepo.                                                                             | `@sanity/language-filter@5` is `peerDep: ^5` only and the "v5 plugin ecosystem too young" concern from the brainstorm is invalidated as of npm state on 2026-05-26. v5 is current stable with ~3 year lifetime. Schema authoring API is essentially unchanged across v3/v4/v5, so the migration cost is minimal.                                                                                                                                                                | 3                                                                  |
| 2026-05-26 | **Field-level i18n** via custom `localeString` / `localeText` / `localeSlug` / `localePortableText` object types; Phase 1 locales `tr` + `en`; per-tenant exposure via `siteSettings.activeLocales` + `@sanity/language-filter`. Editor-side locale detection uses a name-prefix check (types named `locale*`) rather than an `options.localized` flag, because Sanity v5's strict `ObjectOptions` rejects custom keys. | One-doc-two-locales is easier for small editorial teams to keep in sync than document-level i18n via `@sanity/document-internationalization` (which was rejected as over-engineered). Name-prefix detection avoids type hackery while still giving the editor a clean per-locale view.                                                                                                                                                                                          | 5 (superseded 2026-06-05)                                          |
| 2026-05-26 | **`page` doc stays generic** (no dedicated `aboutPage` singleton); `featuredTeamMembers?` + `ctaButtons?` added so About-style pages have opinionated structure without locking other generic pages. **`testimonial` doc included in Phase 1** with `source: 'manual' \| 'google' \| 'trustmary'` enum + optional `sourceUrl`. **`service.responsibleVets` dropped.**                                                   | Owner preference for maximum customization. Portable Text + a few opinionated optional fields gives more flexibility than a fixed singleton, without crossing into anti-pattern page-builder territory. `testimonial` enables a native pipeline now; Google Reviews automated ingest remains out of scope for Phase 1. `responsibleVets` reference complexity is not justified by current frontend needs (old sites don't surface vet-per-service); easy to add later if asked. | 5                                                                  |
| 2026-05-28 | **`next-sanity` as the Sanity client wrapper in `apps/web`** (over vanilla `@sanity/client`).                                                                                                                                                                                                                                                                                                                           | Official Sanity-maintained Next.js wrapper. Integrates with Next 16's fetch cache and `revalidateTag` (load-bearing for the Chunk 13 webhook), ships `defineQuery` which `sanity typegen` recognises for typed GROQ result types, and includes draft-mode + live-preview helpers. Small layer over `@sanity/client`, no meaningful bundle cost.                                                                                                                                 | 3, 7                                                               |
| 2026-05-28 | **Studio hostname pattern: `studio.<client-domain>.com` via CNAME** (resolves **OD-4**).                                                                                                                                                                                                                                                                                                                                | More professional white-label feel for clinic owners than `<client>.sanity.studio`. The ~5 minute extra onboarding step (CNAME DNS record + Sanity custom-domain config) is acceptable at our scale (2-5 clinics). The onboarding playbook in CLAUDE.md §9 will be updated when Chunk 15 ships.                                                                                                                                                                                 | 9                                                                  |
| 2026-05-30 | **OD-5 resolved → cache-tag convention `sanity:<type>:<id>`** (namespaced, `_id`-based): single docs → `sanity:service:abc123`; collection queries → `sanity:<type>:list`; singleton → `sanity:siteSettings`.                                                                                                                                                                                                           | `_id`-based tags survive slug renames (a slug-based tag would orphan when an editor renames the slug, leaving the page stale); per-doc + per-list granularity lets the Chunk 13 webhook revalidate only the affected pages instead of busting a whole type. Coarse per-type (`sanity:<type>`) rejected as wasteful at growing content volumes.                                                                                                                                  | 7, 13                                                              |
| 2026-06-05 | **OD-6 resolved → plain single-language fields** (supersedes the 2026-05-26 field-level i18n decision). Drop `localeString` / `localeText` / `localeSlug` / `localePortableText`, `@sanity/language-filter`, and `siteSettings.activeLocales`; all text fields become plain `string` / `text` / `slug` / portable-text array. A Chunk 4 schema-simplification pass (backlog row 6b) runs before Chunk 7.                | Sites are Turkish-only per §3 and anti-pattern #12; field-level `{ tr, en }` doubled every editor field and forced `coalesce(field[$locale], …)` into every Chunk 7+ query for a bilingual client that doesn't exist. No Sanity project or content exists yet, so migration cost is ~zero — the cheapest possible moment to reverse. If a bilingual client appears, that's the trigger to re-add i18n (and document-level vs field-level gets re-evaluated then).               | 3, 5                                                               |
| 2026-06-05 | **Cache-layer refinements (Chunk 7 review):** (a) the published Sanity client runs `useCdn: false`; (b) the Chunk 13 webhook busts BOTH `sanity:<type>:<id>` AND `sanity:<type>:list` on every create/update/delete; (c) a query that dereferences another type also tags that dependency (e.g. service detail carries `sanity:faq:list`).                                                                              | With tag-only revalidation, Next's tag-pinned data cache is the caching layer and origin is hit only at build/revalidation; the Sanity CDN in front would race `revalidateTag` (single refetch can read a not-yet-invalidated CDN response and pin stale content until the next publish). List projections carry mutable fields, so plain edits must bust lists; dereferenced content otherwise never reaches dependent pages.                                                  | 7 (lib/sanity), 13                                                 |

When making future decisions, append to this table with date, decision, rationale, and the section that captures it.

---

## 13. Quick start for Claude Code

If you are Claude Code joining this project:

1. **Read this entire document first.** Do not skip sections.
2. **Then read the three operational docs in this order:**
   - [`project-documentation/last-point.md`](project-documentation/last-point.md) — where the last session stopped (last commit, working tree, what was done).
   - [`project-documentation/execution-map.md`](project-documentation/execution-map.md) — the active chunk for the next session.
   - [`project-documentation/plan.md`](project-documentation/plan.md) — full roadmap, granular ordered Phase 1 backlog, open decisions.

   CLAUDE.md (this file) captures _how and why_ — architectural decisions and conventions. The three operational files above capture _what to do_, _what to do next_, and _what was just done_.

3. **Read [`project-documentation/PROJECT-ARCHITECTURE.md`](project-documentation/PROJECT-ARCHITECTURE.md)** for the repo-skeleton walkthrough (what every folder and config is for, what's committed vs. generated).
4. **Read `./old-sites/gigi-veteriner/` and `./old-sites/ovapark-veteriner/`** to understand the existing content and design baseline.
5. **Confirm understanding before writing code.** Ask the project owner to confirm anything ambiguous.
6. **Start with the monorepo skeleton** (Turborepo, pnpm workspaces, `apps/web`, `apps/studio`) before any feature work.
7. **Build the Sanity schema next** — it's the keystone. Do not start `apps/web` features until the schema is reviewed and locked.
8. **Implement the `modern` template last** in Phase 1, after all shared infrastructure exists.
9. **Update CLAUDE.md whenever an architectural decision changes** (this file is source-of-truth for decisions and conventions). **Update the operational docs at their respective trigger moments:**
   - `plan.md` whenever a chunk completes, a decision resolves, or scope shifts → use the `updating-plan` skill at `.claude/skills/updating-plan/SKILL.md`.
   - `execution-map.md` at the start and end of every session → use the `updating-execution-map` skill.
   - `last-point.md` before closing the chat or before any major operation → use the `writing-last-point` skill.
   - For commits, follow the `writing-commits` skill at `.claude/skills/writing-commits/SKILL.md`.

When in doubt, prefer:

- **Less code over more code**
- **Boring tech over exciting tech**
- **Shipping one thing well over starting three things**
- **Asking the project owner over guessing**
