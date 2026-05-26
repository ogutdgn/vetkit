# Sanity schema implementation plan — Chunk 4

> **For agentic workers:** Execute task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The companion design spec lives at [`../specs/2026-05-26-sanity-schema-design.md`](../specs/2026-05-26-sanity-schema-design.md); read it first.

**Goal:** Materialize the Phase 1 Sanity schema in `apps/studio/` per the approved spec: 8 document types, 11 reusable objects, field-level i18n via custom locale primitives, singleton enforcement for `siteSettings`, a Turkish desk structure, and orderable lists.

**Architecture:** Sanity v5 Studio with `structureTool` + `visionTool` + `@sanity/language-filter` + `@sanity/orderable-document-list`. Schemas are split into `objects/`, `documents/`, `singletons/` per CLAUDE.md §4. The `schema/index.ts` aggregator imports them all and exports a single `schemaTypes` array.

**Tech stack:**

- Sanity v5 (`sanity@^5.26.0`)
- `@sanity/language-filter@^5.0.2` for editor-side locale filtering
- `@sanity/orderable-document-list@^1.5.1` for drag-to-reorder lists
- TypeScript strict + `noUncheckedIndexedAccess: true` (inherited from `@vetkit/config-typescript/react-library.json`)
- ESLint flat-config (inherited from `@vetkit/config-eslint/react-library`)
- pnpm workspaces + Turborepo

**Verification model:** Sanity schemas are config-as-code; we don't add a runtime test framework for them. Each commit must satisfy: `pnpm --filter @vetkit/studio typecheck`, `pnpm --filter @vetkit/studio lint`, `pnpm --filter @vetkit/studio build`. A final smoke run against `pnpm --filter @vetkit/studio dev` opens Studio and confirms all 8 doc types render.

**Important caveats:**

- Husky pre-commit runs `eslint --fix` + `prettier --write` on staged JS/TS/MJS and `prettier --write` on `*.md`. Expect your commits to be auto-formatted; this is normal.
- `noUncheckedIndexedAccess` means every array/index access returns `T | undefined`. Don't rely on `arr[0]` being non-null; use `arr[0] ?? fallback` or explicit narrowing.
- Sanity v5's `defineType`/`defineField`/`defineArrayMember` give strict typing. Always import them at the top of every schema file.
- Schemas live under `apps/studio/schemas/`; **the existing `schemas/index.ts` exports `schemaTypes: never[] = []`** — replace, don't append.

---

## File structure (target)

```
apps/studio/
├── lib/
│   └── locale.ts                 # turkishSlugify, defaultSlugify, requireLocales helper
├── schemas/
│   ├── objects/
│   │   ├── localeString.ts
│   │   ├── localeText.ts
│   │   ├── localeSlug.ts
│   │   ├── localePortableText.ts
│   │   ├── seo.ts
│   │   ├── address.ts
│   │   ├── openingHours.ts
│   │   ├── socialLinks.ts
│   │   ├── cta.ts
│   │   ├── contactInfo.ts
│   │   └── emergencyBanner.ts
│   ├── documents/
│   │   ├── service.ts
│   │   ├── blogPost.ts
│   │   ├── teamMember.ts
│   │   ├── faq.ts
│   │   ├── galleryImage.ts
│   │   ├── page.ts
│   │   └── testimonial.ts
│   ├── singletons/
│   │   └── siteSettings.ts
│   └── index.ts                  # exports schemaTypes (replaces existing stub)
├── structure/
│   └── deskStructure.ts          # Turkish menu + siteSettings singleton + orderable lists
├── sanity.config.ts              # MODIFY: add languageFilter plugin + new desk structure
├── package.json                  # MODIFY: bump sanity to ^5, add plugins
└── .env.example                  # unchanged (SANITY_STUDIO_PROJECT_ID/_DATASET already documented)
```

---

## Task 1: Bump Sanity to v5 + add plugins

**Files:**

- Modify: `apps/studio/package.json`

**Why:** Sanity v3.x is installed; we need v5 to use the `@sanity/language-filter@^5` plugin. The schema authoring API does not change in ways that affect Phase 1 code.

**Steps:**

- [ ] **Step 1.1** — Edit `apps/studio/package.json` to bump and add deps. The full target file (replace only the `dependencies` and `devDependencies` blocks; keep `name`, `version`, `private`, `scripts` unchanged):

  ```jsonc
  {
    "dependencies": {
      "@sanity/language-filter": "^5.0.2",
      "@sanity/orderable-document-list": "^1.5.1",
      "react": "19.2.0",
      "react-dom": "19.2.0",
      "sanity": "^5.26.0",
      "styled-components": "^6.1.15",
    },
    "devDependencies": {
      "@sanity/vision": "^5.26.0",
      "@types/node": "^22.9.0",
      "@types/react": "^19.0.0",
      "@vetkit/config-eslint": "workspace:*",
      "@vetkit/config-typescript": "workspace:*",
      "eslint": "^9.16.0",
      "typescript": "^5.6.3",
    },
  }
  ```

  Notes: pnpm sorts dependency keys alphabetically on install; this layout already matches that order so the auto-format diff is small.

- [ ] **Step 1.2** — From repo root, install:

  ```bash
  pnpm install
  ```

  Expected: all packages resolve; `sanity` resolves to `5.x` (verify with `pnpm list --filter @vetkit/studio sanity`). If a peer-dep warning appears for `styled-components`, it's harmless (Sanity v5 ships its own resolved styled-components via the npm:@sanity/styled-components alias).

- [ ] **Step 1.3** — Sanity check Studio still builds with the empty schema:

  ```bash
  pnpm --filter @vetkit/studio typecheck
  pnpm --filter @vetkit/studio build
  ```

  Both must pass. If `sanity build` fails complaining about an empty schema, that's expected — proceed; we'll add schemas in subsequent tasks. If it errors on a different point (e.g. plugin export shape), pause and diagnose; do not commit until clean.

  > **Update:** If `sanity build` rejects an empty `schemaTypes`, replace its body in `schemas/index.ts` with a single placeholder that satisfies the type, e.g.:
  >
  > ```ts
  > import { defineField, defineType } from 'sanity';
  >
  > export const schemaTypes = [
  >   defineType({
  >     name: '_placeholder',
  >     type: 'document',
  >     fields: [defineField({ name: 'title', type: 'string' })],
  >   }),
  > ];
  > ```
  >
  > This is a temporary measure; the real schemas land in subsequent tasks. Mark the placeholder with a `// TODO: remove when real schemas land` comment and delete it in Task 2.6.

- [ ] **Step 1.4** — Stage and commit:

  ```bash
  git add apps/studio/package.json pnpm-lock.yaml
  git commit -m "chore(studio): upgrade sanity to v5 and add language-filter + orderable-document-list"
  ```

  Husky will format. Verify the commit succeeded with `git log -1 --oneline`.

---

## Task 2: Locale primitives + Turkish slugify helper

**Files:**

- Create: `apps/studio/lib/locale.ts`
- Create: `apps/studio/schemas/objects/localeString.ts`
- Create: `apps/studio/schemas/objects/localeText.ts`
- Create: `apps/studio/schemas/objects/localeSlug.ts`
- Create: `apps/studio/schemas/objects/localePortableText.ts`
- Modify: `apps/studio/schemas/index.ts` (to wire them in)

**Why:** Every other schema file depends on these. Build them first.

**Steps:**

- [ ] **Step 2.1** — Create `apps/studio/lib/locale.ts`:

  ```ts
  // Locale primitives + helpers used by the locale-aware schema types.

  export const SUPPORTED_LOCALES = ['tr', 'en'] as const;
  export type Locale = (typeof SUPPORTED_LOCALES)[number];

  const TURKISH_CHAR_MAP: Record<string, string> = {
    ç: 'c',
    Ç: 'c',
    ğ: 'g',
    Ğ: 'g',
    ı: 'i',
    İ: 'i',
    ö: 'o',
    Ö: 'o',
    ş: 's',
    Ş: 's',
    ü: 'u',
    Ü: 'u',
  };

  export function turkishSlugify(input: string): string {
    const normalized = Array.from(input)
      .map((ch) => TURKISH_CHAR_MAP[ch] ?? ch)
      .join('');
    return normalized
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 96);
  }

  export function defaultSlugify(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 96);
  }
  ```

- [ ] **Step 2.2** — Create `apps/studio/schemas/objects/localeString.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  export const localeString = defineType({
    name: 'localeString',
    type: 'object',
    title: 'Çok dilli kısa metin',
    description: 'Türkçe ve İngilizce için ayrı kısa metin alanı.',
    options: { localized: true },
    fields: [
      defineField({ name: 'tr', type: 'string', title: 'Türkçe' }),
      defineField({ name: 'en', type: 'string', title: 'English' }),
    ],
  });
  ```

- [ ] **Step 2.3** — Create `apps/studio/schemas/objects/localeText.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  export const localeText = defineType({
    name: 'localeText',
    type: 'object',
    title: 'Çok dilli uzun metin',
    description: 'Türkçe ve İngilizce için ayrı uzun metin alanı.',
    options: { localized: true },
    fields: [
      defineField({ name: 'tr', type: 'text', title: 'Türkçe', rows: 4 }),
      defineField({ name: 'en', type: 'text', title: 'English', rows: 4 }),
    ],
  });
  ```

- [ ] **Step 2.4** — Create `apps/studio/schemas/objects/localeSlug.ts`:

  ```ts
  import { defineField, defineType, type SlugSourceContext } from 'sanity';

  import { defaultSlugify, turkishSlugify } from '../../lib/locale';

  function readTitle(doc: Record<string, unknown>, locale: 'tr' | 'en'): string {
    const title = doc.title as { tr?: string; en?: string } | undefined;
    return title?.[locale] ?? '';
  }

  export const localeSlug = defineType({
    name: 'localeSlug',
    type: 'object',
    title: 'Çok dilli URL kimliği',
    description: 'Türkçe ve İngilizce için ayrı URL slug.',
    options: { localized: true },
    fields: [
      defineField({
        name: 'tr',
        type: 'slug',
        title: 'Türkçe slug',
        options: {
          source: (doc) => readTitle(doc as Record<string, unknown>, 'tr'),
          slugify: turkishSlugify,
          maxLength: 96,
        },
      }),
      defineField({
        name: 'en',
        type: 'slug',
        title: 'English slug',
        options: {
          source: (doc) => readTitle(doc as Record<string, unknown>, 'en'),
          slugify: defaultSlugify,
          maxLength: 96,
        },
      }),
    ],
  });

  // `SlugSourceContext` import retained for future per-locale uniqueness rules.
  export type _LocaleSlugSourceContext = SlugSourceContext;
  ```

  > Note: the `SlugSourceContext` import is kept because a follow-up task may use it for cross-locale uniqueness validation. If TypeScript complains about an unused import on strict mode, drop the `import { ..., type SlugSourceContext }` (keep `defineField, defineType` only) and remove the `_LocaleSlugSourceContext` line. Re-typecheck before committing.

- [ ] **Step 2.5** — Create `apps/studio/schemas/objects/localePortableText.ts`:

  ```ts
  import { defineArrayMember, defineField, defineType } from 'sanity';

  const blockContent = defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'Başlık 2', value: 'h2' },
      { title: 'Başlık 3', value: 'h3' },
      { title: 'Alıntı', value: 'blockquote' },
    ],
    lists: [
      { title: 'Madde', value: 'bullet' },
      { title: 'Numaralı', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Kalın', value: 'strong' },
        { title: 'Vurgu', value: 'em' },
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Bağlantı',
          fields: [
            defineField({
              name: 'href',
              type: 'url',
              title: 'Bağlantı adresi',
              validation: (rule) =>
                rule.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
            }),
            defineField({
              name: 'newTab',
              type: 'boolean',
              title: 'Yeni sekmede aç',
              initialValue: false,
            }),
          ],
        },
      ],
    },
  });

  export const localePortableText = defineType({
    name: 'localePortableText',
    type: 'object',
    title: 'Çok dilli zengin metin',
    description: 'Türkçe ve İngilizce için ayrı zengin metin alanı.',
    options: { localized: true },
    fields: [
      defineField({
        name: 'tr',
        type: 'array',
        title: 'Türkçe',
        of: [blockContent],
      }),
      defineField({
        name: 'en',
        type: 'array',
        title: 'English',
        of: [blockContent],
      }),
    ],
  });
  ```

- [ ] **Step 2.6** — Replace the body of `apps/studio/schemas/index.ts`:

  ```ts
  // All schema types registered with the Studio. Imported by sanity.config.ts.

  import { localePortableText } from './objects/localePortableText';
  import { localeSlug } from './objects/localeSlug';
  import { localeString } from './objects/localeString';
  import { localeText } from './objects/localeText';

  export const schemaTypes = [localeString, localeText, localeSlug, localePortableText];
  ```

  If a `_placeholder` doc was added in Task 1.3, remove it here.

- [ ] **Step 2.7** — Verify:

  ```bash
  pnpm --filter @vetkit/studio typecheck
  pnpm --filter @vetkit/studio lint
  pnpm --filter @vetkit/studio build
  ```

  All three must pass. The build will warn that no `document` types are registered yet — that's fine; we add documents in later tasks.

- [ ] **Step 2.8** — Commit:

  ```bash
  git add apps/studio/lib apps/studio/schemas
  git commit -m "feat(studio): add locale primitives and turkish slugify helper"
  ```

---

## Task 3: Reusable objects (non-locale)

**Files:**

- Create: `apps/studio/schemas/objects/seo.ts`
- Create: `apps/studio/schemas/objects/address.ts`
- Create: `apps/studio/schemas/objects/openingHours.ts`
- Create: `apps/studio/schemas/objects/socialLinks.ts`
- Create: `apps/studio/schemas/objects/cta.ts`
- Create: `apps/studio/schemas/objects/contactInfo.ts`
- Create: `apps/studio/schemas/objects/emergencyBanner.ts`
- Modify: `apps/studio/schemas/index.ts` (wire new objects in)

**Why:** Documents reference these. Build them before documents.

**Steps:**

- [ ] **Step 3.1** — Create `apps/studio/schemas/objects/seo.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  export const seo = defineType({
    name: 'seo',
    type: 'object',
    title: 'SEO ayarları',
    description: 'Sayfa için arama motoru ve sosyal medya önizleme bilgileri.',
    fields: [
      defineField({
        name: 'metaTitle',
        type: 'localeString',
        title: 'Meta başlık',
        description: 'Boş bırakılırsa sayfa başlığı kullanılır.',
      }),
      defineField({
        name: 'metaDescription',
        type: 'localeText',
        title: 'Meta açıklama',
        description: 'Boş bırakılırsa içerikten otomatik üretilir. 155 karakter önerilir.',
      }),
      defineField({
        name: 'ogImage',
        type: 'image',
        title: 'Sosyal medya görseli',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'localeString',
            title: 'Alternatif metin',
            validation: (rule) => rule.required().error('Alt metin a11y için zorunludur.'),
          }),
        ],
      }),
      defineField({
        name: 'noIndex',
        type: 'boolean',
        title: 'Arama motorlarından gizle',
        initialValue: false,
      }),
    ],
  });
  ```

- [ ] **Step 3.2** — Create `apps/studio/schemas/objects/address.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  export const address = defineType({
    name: 'address',
    type: 'object',
    title: 'Adres',
    fields: [
      defineField({
        name: 'street',
        type: 'localeString',
        title: 'Cadde ve numara',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'district',
        type: 'string',
        title: 'İlçe',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'city',
        type: 'string',
        title: 'İl',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'postalCode',
        type: 'string',
        title: 'Posta kodu',
      }),
      defineField({
        name: 'country',
        type: 'string',
        title: 'Ülke',
        initialValue: 'TR',
        options: { list: [{ title: 'Türkiye', value: 'TR' }] },
      }),
      defineField({
        name: 'googleMapsUrl',
        type: 'url',
        title: 'Google Haritalar bağlantısı',
      }),
      defineField({
        name: 'coordinates',
        type: 'object',
        title: 'Koordinatlar',
        fields: [
          defineField({ name: 'lat', type: 'number', title: 'Enlem' }),
          defineField({ name: 'lng', type: 'number', title: 'Boylam' }),
        ],
      }),
    ],
  });
  ```

- [ ] **Step 3.3** — Create `apps/studio/schemas/objects/openingHours.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  const DAYS = [
    { name: 'monday', title: 'Pazartesi' },
    { name: 'tuesday', title: 'Salı' },
    { name: 'wednesday', title: 'Çarşamba' },
    { name: 'thursday', title: 'Perşembe' },
    { name: 'friday', title: 'Cuma' },
    { name: 'saturday', title: 'Cumartesi' },
    { name: 'sunday', title: 'Pazar' },
  ] as const;

  const dayFields = DAYS.map((day) =>
    defineField({
      name: day.name,
      type: 'object',
      title: day.title,
      hidden: ({ parent }) => parent?.isAlwaysOpen === true,
      fields: [
        defineField({
          name: 'closed',
          type: 'boolean',
          title: 'Kapalı',
          initialValue: false,
        }),
        defineField({
          name: 'openTime',
          type: 'string',
          title: 'Açılış (HH:mm)',
          hidden: ({ parent }) => parent?.closed === true,
          validation: (rule) =>
            rule.custom((value) => {
              if (!value) return true;
              return /^([01]\d|2[0-3]):[0-5]\d$/.test(value as string)
                ? true
                : 'HH:mm formatında olmalı (örn. 09:30)';
            }),
        }),
        defineField({
          name: 'closeTime',
          type: 'string',
          title: 'Kapanış (HH:mm)',
          hidden: ({ parent }) => parent?.closed === true,
          validation: (rule) =>
            rule.custom((value) => {
              if (!value) return true;
              return /^([01]\d|2[0-3]):[0-5]\d$/.test(value as string)
                ? true
                : 'HH:mm formatında olmalı (örn. 18:00)';
            }),
        }),
      ],
    }),
  );

  export const openingHours = defineType({
    name: 'openingHours',
    type: 'object',
    title: 'Çalışma saatleri',
    fields: [
      defineField({
        name: 'isAlwaysOpen',
        type: 'boolean',
        title: '7/24 Açık',
        description: 'İşaretlendiğinde gün bazlı saatler yerine "TÜM GÜN" gösterilir.',
        initialValue: false,
      }),
      ...dayFields,
      defineField({
        name: 'emergencyNote',
        type: 'localeString',
        title: 'Acil not',
        description: 'Hafta sonu / mesai dışı için kısa not.',
      }),
    ],
  });
  ```

- [ ] **Step 3.4** — Create `apps/studio/schemas/objects/socialLinks.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  const social = (name: string, title: string, placeholder: string) =>
    defineField({
      name,
      type: 'url',
      title,
      description: placeholder,
      validation: (rule) => rule.uri({ scheme: ['http', 'https'], allowRelative: false }),
    });

  export const socialLinks = defineType({
    name: 'socialLinks',
    type: 'object',
    title: 'Sosyal medya',
    fields: [
      social('instagram', 'Instagram', 'https://instagram.com/...'),
      social('facebook', 'Facebook', 'https://facebook.com/...'),
      social('x', 'X (Twitter)', 'https://x.com/...'),
      social('youtube', 'YouTube', 'https://youtube.com/@...'),
      social('tiktok', 'TikTok', 'https://tiktok.com/@...'),
      defineField({
        name: 'whatsapp',
        type: 'string',
        title: 'WhatsApp telefon',
        description: 'E.164 formatında (örn. +905551112233)',
        validation: (rule) =>
          rule.custom((value) => {
            if (!value) return true;
            return /^\+[1-9]\d{6,14}$/.test(value as string)
              ? true
              : 'E.164 formatında olmalı (örn. +905551112233)';
          }),
      }),
    ],
  });
  ```

- [ ] **Step 3.5** — Create `apps/studio/schemas/objects/cta.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  export const cta = defineType({
    name: 'cta',
    type: 'object',
    title: 'Buton (CTA)',
    fields: [
      defineField({
        name: 'label',
        type: 'localeString',
        title: 'Buton metni',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'href',
        type: 'string',
        title: 'Bağlantı (URL veya /yol)',
        validation: (rule) =>
          rule.required().custom((value) => {
            if (typeof value !== 'string') return 'Bağlantı zorunlu';
            if (value.startsWith('/')) return true;
            if (/^https?:\/\//.test(value)) return true;
            if (/^mailto:/.test(value) || /^tel:/.test(value)) return true;
            return '"/", "http(s)://", "mailto:" veya "tel:" ile başlamalı';
          }),
      }),
      defineField({
        name: 'variant',
        type: 'string',
        title: 'Görsel stil',
        initialValue: 'primary',
        options: {
          list: [
            { title: 'Birincil', value: 'primary' },
            { title: 'İkincil', value: 'secondary' },
            { title: 'Hafif', value: 'ghost' },
          ],
          layout: 'radio',
        },
      }),
      defineField({
        name: 'newTab',
        type: 'boolean',
        title: 'Yeni sekmede aç',
        initialValue: false,
      }),
    ],
  });
  ```

- [ ] **Step 3.6** — Create `apps/studio/schemas/objects/contactInfo.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  const phoneRule = (rule: import('sanity').Rule) =>
    rule.custom((value) => {
      if (!value) return true;
      return /^\+[1-9]\d{6,14}$/.test(value as string)
        ? true
        : 'E.164 formatında olmalı (örn. +905551112233)';
    });

  export const contactInfo = defineType({
    name: 'contactInfo',
    type: 'object',
    title: 'İletişim bilgileri',
    fields: [
      defineField({
        name: 'primaryPhone',
        type: 'string',
        title: 'Ana telefon',
        validation: (rule) => phoneRule(rule.required()),
      }),
      defineField({
        name: 'emergencyPhone',
        type: 'string',
        title: 'Acil telefon (opsiyonel)',
        validation: phoneRule,
      }),
      defineField({
        name: 'whatsapp',
        type: 'string',
        title: 'WhatsApp',
        validation: phoneRule,
      }),
      defineField({
        name: 'email',
        type: 'string',
        title: 'E-posta',
        validation: (rule) => rule.required().email(),
      }),
      defineField({
        name: 'secondaryEmails',
        type: 'array',
        title: 'Ek e-postalar',
        of: [
          {
            type: 'string',
            validation: (rule) => rule.email(),
          },
        ],
      }),
    ],
  });
  ```

- [ ] **Step 3.7** — Create `apps/studio/schemas/objects/emergencyBanner.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  export const emergencyBanner = defineType({
    name: 'emergencyBanner',
    type: 'object',
    title: 'Acil durum banner',
    description: 'Site genelinde gösterilecek 7/24 acil banner. Devre dışı bırakılabilir.',
    fields: [
      defineField({
        name: 'enabled',
        type: 'boolean',
        title: 'Aktif',
        initialValue: false,
      }),
      defineField({
        name: 'text',
        type: 'localeString',
        title: 'Banner metni',
        description: 'Örn. "7/24 Acil Servis"',
        hidden: ({ parent }) => parent?.enabled !== true,
      }),
      defineField({
        name: 'phone',
        type: 'string',
        title: 'Telefon (tıklanabilir)',
        description: 'E.164 formatında.',
        hidden: ({ parent }) => parent?.enabled !== true,
        validation: (rule) =>
          rule.custom((value, ctx) => {
            const parent = ctx.parent as { enabled?: boolean } | undefined;
            if (!parent?.enabled) return true;
            if (!value) return 'Aktif banner için telefon zorunlu.';
            return /^\+[1-9]\d{6,14}$/.test(value as string)
              ? true
              : 'E.164 formatında olmalı (örn. +905551112233)';
          }),
      }),
      defineField({
        name: 'variant',
        type: 'string',
        title: 'Yerleşim',
        initialValue: 'top',
        options: {
          list: [
            { title: 'Üstte sabit', value: 'top' },
            { title: 'Yapışkan (sticky)', value: 'sticky' },
          ],
          layout: 'radio',
        },
      }),
    ],
  });
  ```

- [ ] **Step 3.8** — Update `apps/studio/schemas/index.ts`:

  ```ts
  // All schema types registered with the Studio. Imported by sanity.config.ts.

  import { address } from './objects/address';
  import { contactInfo } from './objects/contactInfo';
  import { cta } from './objects/cta';
  import { emergencyBanner } from './objects/emergencyBanner';
  import { localePortableText } from './objects/localePortableText';
  import { localeSlug } from './objects/localeSlug';
  import { localeString } from './objects/localeString';
  import { localeText } from './objects/localeText';
  import { openingHours } from './objects/openingHours';
  import { seo } from './objects/seo';
  import { socialLinks } from './objects/socialLinks';

  export const schemaTypes = [
    // Locale primitives (declared first; everything else depends on them).
    localeString,
    localeText,
    localeSlug,
    localePortableText,
    // Reusable objects.
    seo,
    address,
    openingHours,
    socialLinks,
    cta,
    contactInfo,
    emergencyBanner,
  ];
  ```

- [ ] **Step 3.9** — Verify and commit:

  ```bash
  pnpm --filter @vetkit/studio typecheck
  pnpm --filter @vetkit/studio lint
  pnpm --filter @vetkit/studio build
  git add apps/studio/schemas
  git commit -m "feat(studio): add reusable objects (seo, address, hours, social, cta, contact, emergency)"
  ```

---

## Task 4: siteSettings singleton + custom desk structure

**Files:**

- Create: `apps/studio/schemas/singletons/siteSettings.ts`
- Create: `apps/studio/structure/deskStructure.ts`
- Modify: `apps/studio/sanity.config.ts` (wire languageFilter + custom desk structure)
- Modify: `apps/studio/schemas/index.ts` (register siteSettings)

**Why:** `siteSettings` is the one document every client must have exactly one of. Singleton enforcement lives in the desk structure.

**Steps:**

- [ ] **Step 4.1** — Create `apps/studio/schemas/singletons/siteSettings.ts`:

  ```ts
  import { defineArrayMember, defineField, defineType } from 'sanity';

  export const siteSettings = defineType({
    name: 'siteSettings',
    type: 'document',
    title: 'Klinik Bilgileri',
    description:
      'Klinik adı, marka, iletişim, adres ve site geneli ayarlar. Tek bir kayıt olarak yönetilir.',
    fields: [
      // Identity
      defineField({
        name: 'clinicName',
        type: 'localeString',
        title: 'Klinik adı',
        validation: (rule) =>
          rule.required().custom((value) => {
            const tr = (value as { tr?: string } | undefined)?.tr;
            return tr ? true : 'Türkçe klinik adı zorunlu.';
          }),
      }),
      defineField({
        name: 'tagline',
        type: 'localeString',
        title: 'Slogan',
      }),
      defineField({
        name: 'logo',
        type: 'image',
        title: 'Logo',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'localeString',
            title: 'Alt metin',
            validation: (rule) => rule.required(),
          }),
        ],
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'brandColor',
        type: 'object',
        title: 'Marka rengi',
        fields: [
          defineField({
            name: 'hex',
            type: 'string',
            title: 'HEX kod (örn. #0F766E)',
            validation: (rule) =>
              rule.required().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
                name: 'HEX',
                invert: false,
              }),
          }),
          defineField({
            name: 'name',
            type: 'string',
            title: 'Renk adı (opsiyonel)',
          }),
        ],
      }),
      // Localization
      defineField({
        name: 'activeLocales',
        type: 'array',
        title: 'Aktif diller',
        of: [defineArrayMember({ type: 'string' })],
        options: {
          list: [
            { title: 'Türkçe', value: 'tr' },
            { title: 'English', value: 'en' },
          ],
        },
        initialValue: ['tr'],
        validation: (rule) => rule.required().min(1),
      }),
      defineField({
        name: 'defaultLocale',
        type: 'string',
        title: 'Varsayılan dil',
        initialValue: 'tr',
        options: {
          list: [
            { title: 'Türkçe', value: 'tr' },
            { title: 'English', value: 'en' },
          ],
          layout: 'radio',
        },
        validation: (rule) =>
          rule.required().custom((value, ctx) => {
            const active = (ctx.document?.activeLocales ?? []) as string[];
            if (active.length === 0) return true;
            return active.includes(value as string)
              ? true
              : 'Varsayılan dil, aktif diller arasında olmalı.';
          }),
      }),
      // Contact & address
      defineField({
        name: 'contact',
        type: 'contactInfo',
        title: 'İletişim',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'address',
        type: 'address',
        title: 'Adres',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'openingHours',
        type: 'openingHours',
        title: 'Çalışma saatleri',
        validation: (rule) => rule.required(),
      }),
      // Branding extras
      defineField({
        name: 'socialLinks',
        type: 'socialLinks',
        title: 'Sosyal medya',
      }),
      defineField({
        name: 'emergencyBanner',
        type: 'emergencyBanner',
        title: 'Acil banner',
      }),
      defineField({
        name: 'footerText',
        type: 'localeText',
        title: 'Footer metni',
      }),
      defineField({
        name: 'footerLinks',
        type: 'array',
        title: 'Footer butonları',
        of: [defineArrayMember({ type: 'cta' })],
      }),
      // SEO defaults
      defineField({
        name: 'defaultSeo',
        type: 'seo',
        title: 'Varsayılan SEO',
      }),
      // Feature flags
      defineField({
        name: 'vercelAnalyticsEnabled',
        type: 'boolean',
        title: 'Vercel Analytics aktif',
        description: 'Site üzerinde Vercel Analytics çalıştırılsın mı?',
        initialValue: false,
      }),
    ],
    preview: {
      select: { title: 'clinicName.tr' },
      prepare: ({ title }) => ({ title: title ?? 'Klinik Bilgileri' }),
    },
  });
  ```

- [ ] **Step 4.2** — Create `apps/studio/structure/deskStructure.ts`:

  ```ts
  import type { StructureBuilder, StructureResolver } from 'sanity/structure';

  const SITE_SETTINGS_ID = 'siteSettings';

  const siteSettingsItem = (S: StructureBuilder) =>
    S.listItem()
      .title('Klinik Bilgileri')
      .id(SITE_SETTINGS_ID)
      .child(
        S.editor().id(SITE_SETTINGS_ID).schemaType('siteSettings').documentId(SITE_SETTINGS_ID),
      );

  export const deskStructure: StructureResolver = (S) =>
    S.list()
      .title('İçerik')
      .items([siteSettingsItem(S), S.divider()]);
  ```

  > Document-type list items for `service`, `blogPost`, etc. land in Task 7 when we add the orderable-list wiring alongside the docs themselves. For now the desk shows the singleton at the top and a divider.

- [ ] **Step 4.3** — Replace `apps/studio/sanity.config.ts`:

  ```ts
  import { defineConfig } from 'sanity';
  import { languageFilter } from '@sanity/language-filter';
  import { visionTool } from '@sanity/vision';
  import { structureTool } from 'sanity/structure';

  import { schemaTypes } from './schemas';
  import { deskStructure } from './structure/deskStructure';

  // Per-client values come from .env at deploy time so we can run the same
  // Studio against any tenant's Sanity project.
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder';
  const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

  export default defineConfig({
    name: 'vetkit',
    title: process.env.SANITY_STUDIO_TITLE ?? 'vetkit Studio',
    projectId,
    dataset,
    plugins: [
      structureTool({ structure: deskStructure }),
      visionTool(),
      languageFilter({
        supportedLanguages: [
          { id: 'tr', title: 'Türkçe' },
          { id: 'en', title: 'English' },
        ],
        defaultLanguages: ['tr'],
        documentTypes: [
          'siteSettings',
          'service',
          'blogPost',
          'teamMember',
          'faq',
          'galleryImage',
          'page',
          'testimonial',
        ],
        filterField: (enclosingType, member, selectedLanguageIds) =>
          !enclosingType.options?.localized ||
          (typeof member.name === 'string' && selectedLanguageIds.includes(member.name)),
      }),
    ],
    schema: { types: schemaTypes },
  });
  ```

- [ ] **Step 4.4** — Update `apps/studio/schemas/index.ts` to include `siteSettings`:

  ```ts
  import { address } from './objects/address';
  import { contactInfo } from './objects/contactInfo';
  import { cta } from './objects/cta';
  import { emergencyBanner } from './objects/emergencyBanner';
  import { localePortableText } from './objects/localePortableText';
  import { localeSlug } from './objects/localeSlug';
  import { localeString } from './objects/localeString';
  import { localeText } from './objects/localeText';
  import { openingHours } from './objects/openingHours';
  import { seo } from './objects/seo';
  import { socialLinks } from './objects/socialLinks';
  import { siteSettings } from './singletons/siteSettings';

  export const schemaTypes = [
    localeString,
    localeText,
    localeSlug,
    localePortableText,
    seo,
    address,
    openingHours,
    socialLinks,
    cta,
    contactInfo,
    emergencyBanner,
    siteSettings,
  ];
  ```

- [ ] **Step 4.5** — Verify and commit:

  ```bash
  pnpm --filter @vetkit/studio typecheck
  pnpm --filter @vetkit/studio lint
  pnpm --filter @vetkit/studio build
  git add apps/studio/schemas apps/studio/structure apps/studio/sanity.config.ts
  git commit -m "feat(studio): add siteSettings singleton with custom desk structure and language filter"
  ```

---

## Task 5: service + blogPost document types

**Files:**

- Create: `apps/studio/schemas/documents/service.ts`
- Create: `apps/studio/schemas/documents/blogPost.ts`
- Modify: `apps/studio/schemas/index.ts`
- Modify: `apps/studio/structure/deskStructure.ts` (add list items)

**Why:** These two are the public-URL workhorses. Doing them in one task lets the desk-structure edit be a single change.

**Steps:**

- [ ] **Step 5.1** — Create `apps/studio/schemas/documents/service.ts`:

  ```ts
  import { defineArrayMember, defineField, defineType } from 'sanity';

  const PET_TYPES = [
    { title: 'Köpek', value: 'dog' },
    { title: 'Kedi', value: 'cat' },
    { title: 'Kuş', value: 'bird' },
    { title: 'Tavşan', value: 'rabbit' },
    { title: 'Egzotik', value: 'exotic' },
  ] as const;

  export const service = defineType({
    name: 'service',
    type: 'document',
    title: 'Hizmet',
    fields: [
      defineField({
        name: 'title',
        type: 'localeString',
        title: 'Hizmet adı',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'slug',
        type: 'localeSlug',
        title: 'URL kimliği',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'mainImage',
        type: 'image',
        title: 'Ana görsel',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'localeString',
            title: 'Alt metin',
            validation: (rule) => rule.required(),
          }),
        ],
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'icon',
        type: 'image',
        title: 'İkon (kart görselleri için, opsiyonel)',
        options: { hotspot: false },
      }),
      defineField({
        name: 'shortDescription',
        type: 'localeText',
        title: 'Kısa açıklama (kart için)',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'description',
        type: 'localePortableText',
        title: 'Detay açıklama',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'petTypes',
        type: 'array',
        title: 'Hangi hayvan türleri',
        of: [defineArrayMember({ type: 'string' })],
        options: { list: [...PET_TYPES] },
      }),
      defineField({
        name: 'serviceLocation',
        type: 'string',
        title: 'Hizmet yeri',
        initialValue: 'in-clinic',
        options: {
          list: [
            { title: 'Klinikte', value: 'in-clinic' },
            { title: 'Evde', value: 'home-call' },
            { title: 'Her ikisi', value: 'both' },
          ],
          layout: 'radio',
        },
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'emergencyAvailable',
        type: 'boolean',
        title: 'Acil olarak sunuluyor mu?',
        initialValue: false,
      }),
      defineField({
        name: 'relatedFAQs',
        type: 'array',
        title: 'İlgili SSS',
        of: [defineArrayMember({ type: 'reference', to: [{ type: 'faq' }] })],
      }),
      defineField({
        name: 'pricing',
        type: 'localeString',
        title: 'Fiyat bilgisi (opsiyonel)',
        description: 'Örn. "300 TL\'den başlayan fiyatlarla". Boş kalabilir.',
      }),
      defineField({
        name: 'seo',
        type: 'seo',
        title: 'SEO ayarları',
      }),
    ],
    preview: {
      select: {
        title: 'title.tr',
        media: 'mainImage',
      },
      prepare: ({ title, media }) => ({
        title: title ?? 'İsimsiz hizmet',
        media,
      }),
    },
  });
  ```

- [ ] **Step 5.2** — Create `apps/studio/schemas/documents/blogPost.ts`:

  ```ts
  import { defineArrayMember, defineField, defineType } from 'sanity';

  const CATEGORIES = [
    { title: 'Genel', value: 'genel' },
    { title: 'Beslenme', value: 'beslenme' },
    { title: 'Aşılama', value: 'asilama' },
    { title: 'Davranış', value: 'davranis' },
    { title: 'Acil', value: 'acil' },
  ] as const;

  export const blogPost = defineType({
    name: 'blogPost',
    type: 'document',
    title: 'Blog yazısı',
    fields: [
      defineField({
        name: 'title',
        type: 'localeString',
        title: 'Başlık',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'slug',
        type: 'localeSlug',
        title: 'URL kimliği',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'excerpt',
        type: 'localeText',
        title: 'Özet',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'body',
        type: 'localePortableText',
        title: 'İçerik',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'coverImage',
        type: 'image',
        title: 'Kapak görseli',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'localeString',
            title: 'Alt metin',
            validation: (rule) => rule.required(),
          }),
        ],
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'author',
        type: 'reference',
        title: 'Yazar',
        to: [{ type: 'teamMember' }],
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'publishedAt',
        type: 'datetime',
        title: 'Yayın tarihi',
        initialValue: () => new Date().toISOString(),
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'category',
        type: 'string',
        title: 'Kategori',
        options: { list: [...CATEGORIES], layout: 'dropdown' },
      }),
      defineField({
        name: 'tags',
        type: 'array',
        title: 'Etiketler',
        of: [defineArrayMember({ type: 'string' })],
        options: { layout: 'tags' },
      }),
      defineField({
        name: 'relatedServices',
        type: 'array',
        title: 'İlgili hizmetler',
        of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
      }),
      defineField({
        name: 'relatedPosts',
        type: 'array',
        title: 'İlgili blog yazıları',
        of: [defineArrayMember({ type: 'reference', to: [{ type: 'blogPost' }] })],
      }),
      defineField({
        name: 'seo',
        type: 'seo',
        title: 'SEO ayarları',
      }),
    ],
    orderings: [
      {
        title: 'Yayın tarihi (yeniden eskiye)',
        name: 'publishedAtDesc',
        by: [{ field: 'publishedAt', direction: 'desc' }],
      },
    ],
    preview: {
      select: {
        title: 'title.tr',
        media: 'coverImage',
        date: 'publishedAt',
      },
      prepare: ({ title, media, date }) => ({
        title: title ?? 'İsimsiz yazı',
        subtitle: date ? new Date(date as string).toLocaleDateString('tr-TR') : undefined,
        media,
      }),
    },
  });
  ```

  > Note: `blogPost.author` references `teamMember` which doesn't exist yet. Sanity tolerates this at schema-registration time — references resolve at runtime. The full typecheck will pass; build emits a "type teamMember is referenced but not registered" warning, but does not fail. (Studio dev would fail to render `blogPost` until `teamMember` exists — fine, since Studio dev isn't run until after Task 7.)
  >
  > If build does fail in a future Sanity version, swap Task 5 and Task 6 — implement `teamMember` first. We're picking 5→6 here because the doc-shape complexity of `service`+`blogPost` is the bigger lift and benefits from a fresh commit.

- [ ] **Step 5.3** — Update `apps/studio/schemas/index.ts`:

  ```ts
  import { blogPost } from './documents/blogPost';
  import { service } from './documents/service';
  import { address } from './objects/address';
  import { contactInfo } from './objects/contactInfo';
  import { cta } from './objects/cta';
  import { emergencyBanner } from './objects/emergencyBanner';
  import { localePortableText } from './objects/localePortableText';
  import { localeSlug } from './objects/localeSlug';
  import { localeString } from './objects/localeString';
  import { localeText } from './objects/localeText';
  import { openingHours } from './objects/openingHours';
  import { seo } from './objects/seo';
  import { socialLinks } from './objects/socialLinks';
  import { siteSettings } from './singletons/siteSettings';

  export const schemaTypes = [
    localeString,
    localeText,
    localeSlug,
    localePortableText,
    seo,
    address,
    openingHours,
    socialLinks,
    cta,
    contactInfo,
    emergencyBanner,
    siteSettings,
    service,
    blogPost,
  ];
  ```

- [ ] **Step 5.4** — Update `apps/studio/structure/deskStructure.ts` to add `service` and `blogPost`:

  ```ts
  import type { StructureBuilder, StructureResolver } from 'sanity/structure';

  const SITE_SETTINGS_ID = 'siteSettings';

  const siteSettingsItem = (S: StructureBuilder) =>
    S.listItem()
      .title('Klinik Bilgileri')
      .id(SITE_SETTINGS_ID)
      .child(
        S.editor().id(SITE_SETTINGS_ID).schemaType('siteSettings').documentId(SITE_SETTINGS_ID),
      );

  export const deskStructure: StructureResolver = (S) =>
    S.list()
      .title('İçerik')
      .items([
        siteSettingsItem(S),
        S.divider(),
        S.documentTypeListItem('service').title('Hizmetler'),
        S.documentTypeListItem('blogPost').title('Blog Yazıları'),
      ]);
  ```

- [ ] **Step 5.5** — Verify and commit:

  ```bash
  pnpm --filter @vetkit/studio typecheck
  pnpm --filter @vetkit/studio lint
  pnpm --filter @vetkit/studio build
  git add apps/studio/schemas apps/studio/structure
  git commit -m "feat(studio): add service and blogPost document types with seo"
  ```

---

## Task 6: teamMember, faq, galleryImage, page, testimonial

**Files:**

- Create: `apps/studio/schemas/documents/teamMember.ts`
- Create: `apps/studio/schemas/documents/faq.ts`
- Create: `apps/studio/schemas/documents/galleryImage.ts`
- Create: `apps/studio/schemas/documents/page.ts`
- Create: `apps/studio/schemas/documents/testimonial.ts`
- Modify: `apps/studio/schemas/index.ts`
- Modify: `apps/studio/structure/deskStructure.ts` (add list items + orderable lists)

**Why:** Five smaller doc types in one commit; they share the orderable-list pattern.

**Steps:**

- [ ] **Step 6.1** — Create `apps/studio/schemas/documents/teamMember.ts`:

  ```ts
  import { defineArrayMember, defineField, defineType } from 'sanity';

  const SPECIALTIES = [
    { title: 'Cerrahi', value: 'cerrahi' },
    { title: 'Dahiliye', value: 'dahiliye' },
    { title: 'Jinekoloji', value: 'jinekoloji' },
    { title: 'Cildiye', value: 'cildiye' },
    { title: 'Davranış', value: 'davranis' },
    { title: 'Acil', value: 'acil' },
  ] as const;

  export const teamMember = defineType({
    name: 'teamMember',
    type: 'document',
    title: 'Ekip üyesi',
    fields: [
      defineField({
        name: 'name',
        type: 'string',
        title: 'Ad Soyad',
        description: 'Özel isim; çevrilmez.',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'title',
        type: 'localeString',
        title: 'Unvan',
        description: 'Örn. "Veteriner Hekim" / "Veterinarian"',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'slug',
        type: 'slug',
        title: 'URL kimliği (opsiyonel)',
        options: { source: 'name', maxLength: 96 },
      }),
      defineField({
        name: 'photo',
        type: 'image',
        title: 'Fotoğraf',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'localeString',
            title: 'Alt metin',
            validation: (rule) => rule.required(),
          }),
        ],
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'credentials',
        type: 'array',
        title: 'Eğitim / sertifika',
        of: [defineArrayMember({ type: 'localeString' })],
      }),
      defineField({
        name: 'specialties',
        type: 'array',
        title: 'Uzmanlık alanları',
        of: [defineArrayMember({ type: 'string' })],
        options: { list: [...SPECIALTIES] },
      }),
      defineField({
        name: 'shortBio',
        type: 'localeText',
        title: 'Kısa biyografi (kart için)',
      }),
      defineField({
        name: 'bio',
        type: 'localePortableText',
        title: 'Detaylı biyografi',
      }),
      defineField({
        name: 'email',
        type: 'string',
        title: 'E-posta',
        validation: (rule) => rule.email(),
      }),
      defineField({
        name: 'phone',
        type: 'string',
        title: 'Telefon',
      }),
      defineField({
        name: 'socialLinks',
        type: 'socialLinks',
        title: 'Sosyal medya',
      }),
    ],
    preview: {
      select: { title: 'name', subtitle: 'title.tr', media: 'photo' },
    },
  });
  ```

- [ ] **Step 6.2** — Create `apps/studio/schemas/documents/faq.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  const FAQ_CATEGORIES = [
    { title: 'Genel', value: 'genel' },
    { title: 'Aşılama', value: 'asilama' },
    { title: 'Cerrahi', value: 'cerrahi' },
    { title: 'Beslenme', value: 'beslenme' },
    { title: 'Acil', value: 'acil' },
  ] as const;

  export const faq = defineType({
    name: 'faq',
    type: 'document',
    title: 'SSS',
    fields: [
      defineField({
        name: 'question',
        type: 'localeString',
        title: 'Soru',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'answer',
        type: 'localePortableText',
        title: 'Cevap',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'category',
        type: 'string',
        title: 'Kategori',
        options: { list: [...FAQ_CATEGORIES], layout: 'dropdown' },
      }),
    ],
    preview: {
      select: { title: 'question.tr', subtitle: 'category' },
    },
  });
  ```

- [ ] **Step 6.3** — Create `apps/studio/schemas/documents/galleryImage.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  const GALLERY_CATEGORIES = [
    { title: 'Klinik içi', value: 'klinik-ici' },
    { title: 'Tedavi', value: 'tedavi' },
    { title: 'Ekip', value: 'ekip' },
    { title: 'Hastalar', value: 'hastalar' },
  ] as const;

  export const galleryImage = defineType({
    name: 'galleryImage',
    type: 'document',
    title: 'Galeri görseli',
    fields: [
      defineField({
        name: 'image',
        type: 'image',
        title: 'Görsel',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'localeString',
            title: 'Alt metin',
            validation: (rule) => rule.required(),
          }),
        ],
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'caption',
        type: 'localeString',
        title: 'Başlık (opsiyonel)',
      }),
      defineField({
        name: 'category',
        type: 'string',
        title: 'Kategori',
        options: { list: [...GALLERY_CATEGORIES], layout: 'dropdown' },
      }),
    ],
    preview: {
      select: { title: 'caption.tr', subtitle: 'category', media: 'image' },
    },
  });
  ```

- [ ] **Step 6.4** — Create `apps/studio/schemas/documents/page.ts`:

  ```ts
  import { defineArrayMember, defineField, defineType } from 'sanity';

  export const page = defineType({
    name: 'page',
    type: 'document',
    title: 'Sayfa',
    description: 'Hakkımızda, KVKK, Çerez Politikası gibi tekil içerik sayfaları.',
    fields: [
      defineField({
        name: 'title',
        type: 'localeString',
        title: 'Sayfa başlığı',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'slug',
        type: 'localeSlug',
        title: 'URL kimliği',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'heroImage',
        type: 'image',
        title: 'Üst görsel (opsiyonel)',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'localeString',
            title: 'Alt metin',
            validation: (rule) =>
              rule.custom((value, ctx) => {
                const parent = ctx.parent as { asset?: unknown } | undefined;
                if (!parent?.asset) return true;
                const tr = (value as { tr?: string } | undefined)?.tr;
                return tr ? true : 'Görsel varsa alt metin zorunludur.';
              }),
          }),
        ],
      }),
      defineField({
        name: 'body',
        type: 'localePortableText',
        title: 'İçerik',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'featuredTeamMembers',
        type: 'array',
        title: 'Öne çıkan ekip üyeleri (opsiyonel)',
        of: [
          defineArrayMember({
            type: 'reference',
            to: [{ type: 'teamMember' }],
          }),
        ],
      }),
      defineField({
        name: 'ctaButtons',
        type: 'array',
        title: 'CTA butonları (opsiyonel)',
        of: [defineArrayMember({ type: 'cta' })],
      }),
      defineField({
        name: 'seo',
        type: 'seo',
        title: 'SEO ayarları',
      }),
    ],
    preview: {
      select: { title: 'title.tr', media: 'heroImage' },
    },
  });
  ```

- [ ] **Step 6.5** — Create `apps/studio/schemas/documents/testimonial.ts`:

  ```ts
  import { defineField, defineType } from 'sanity';

  export const testimonial = defineType({
    name: 'testimonial',
    type: 'document',
    title: 'Görüş',
    fields: [
      defineField({
        name: 'authorName',
        type: 'string',
        title: 'Yazan kişi',
        description: 'Özel isim; çevrilmez.',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'authorPhoto',
        type: 'image',
        title: 'Fotoğraf (opsiyonel)',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'localeString',
            title: 'Alt metin',
            validation: (rule) =>
              rule.custom((value, ctx) => {
                const parent = ctx.parent as { asset?: unknown } | undefined;
                if (!parent?.asset) return true;
                const tr = (value as { tr?: string } | undefined)?.tr;
                return tr ? true : 'Fotoğraf varsa alt metin zorunludur.';
              }),
          }),
        ],
      }),
      defineField({
        name: 'content',
        type: 'localePortableText',
        title: 'Yorum',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'rating',
        type: 'number',
        title: 'Puan (1-5)',
        validation: (rule) => rule.min(1).max(5).integer(),
      }),
      defineField({
        name: 'source',
        type: 'string',
        title: 'Kaynak',
        initialValue: 'manual',
        options: {
          list: [
            { title: 'Manuel', value: 'manual' },
            { title: 'Google', value: 'google' },
            { title: 'Trustmary', value: 'trustmary' },
          ],
          layout: 'radio',
        },
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'sourceUrl',
        type: 'url',
        title: 'Kaynak bağlantısı (opsiyonel)',
      }),
      defineField({
        name: 'publishedAt',
        type: 'datetime',
        title: 'Tarih',
      }),
      defineField({
        name: 'featured',
        type: 'boolean',
        title: 'Anasayfada öne çıkar',
        initialValue: false,
      }),
    ],
    preview: {
      select: {
        title: 'authorName',
        subtitle: 'source',
        media: 'authorPhoto',
      },
    },
  });
  ```

- [ ] **Step 6.6** — Update `apps/studio/schemas/index.ts`:

  ```ts
  import { blogPost } from './documents/blogPost';
  import { faq } from './documents/faq';
  import { galleryImage } from './documents/galleryImage';
  import { page } from './documents/page';
  import { service } from './documents/service';
  import { teamMember } from './documents/teamMember';
  import { testimonial } from './documents/testimonial';
  import { address } from './objects/address';
  import { contactInfo } from './objects/contactInfo';
  import { cta } from './objects/cta';
  import { emergencyBanner } from './objects/emergencyBanner';
  import { localePortableText } from './objects/localePortableText';
  import { localeSlug } from './objects/localeSlug';
  import { localeString } from './objects/localeString';
  import { localeText } from './objects/localeText';
  import { openingHours } from './objects/openingHours';
  import { seo } from './objects/seo';
  import { socialLinks } from './objects/socialLinks';
  import { siteSettings } from './singletons/siteSettings';

  export const schemaTypes = [
    // Locale primitives.
    localeString,
    localeText,
    localeSlug,
    localePortableText,
    // Reusable objects.
    seo,
    address,
    openingHours,
    socialLinks,
    cta,
    contactInfo,
    emergencyBanner,
    // Singletons.
    siteSettings,
    // Documents.
    service,
    blogPost,
    teamMember,
    faq,
    galleryImage,
    page,
    testimonial,
  ];
  ```

- [ ] **Step 6.7** — Update `apps/studio/structure/deskStructure.ts` with orderable lists for `service`, `teamMember`, `faq`, `galleryImage`, `testimonial`:

  ```ts
  import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
  import type { StructureBuilder, StructureResolver } from 'sanity/structure';

  const SITE_SETTINGS_ID = 'siteSettings';

  const siteSettingsItem = (S: StructureBuilder) =>
    S.listItem()
      .title('Klinik Bilgileri')
      .id(SITE_SETTINGS_ID)
      .child(
        S.editor().id(SITE_SETTINGS_ID).schemaType('siteSettings').documentId(SITE_SETTINGS_ID),
      );

  export const deskStructure: StructureResolver = (S, context) =>
    S.list()
      .title('İçerik')
      .items([
        siteSettingsItem(S),
        S.divider(),
        orderableDocumentListDeskItem({
          type: 'service',
          title: 'Hizmetler',
          S,
          context,
        }),
        S.documentTypeListItem('blogPost').title('Blog Yazıları'),
        orderableDocumentListDeskItem({
          type: 'teamMember',
          title: 'Ekip',
          S,
          context,
        }),
        orderableDocumentListDeskItem({
          type: 'faq',
          title: 'Sıkça Sorulan Sorular',
          S,
          context,
        }),
        orderableDocumentListDeskItem({
          type: 'galleryImage',
          title: 'Galeri',
          S,
          context,
        }),
        orderableDocumentListDeskItem({
          type: 'testimonial',
          title: 'Görüşler',
          S,
          context,
        }),
        S.documentTypeListItem('page').title('Sayfalar'),
      ]);
  ```

  > If `orderableDocumentListDeskItem` type signature differs in the installed `@sanity/orderable-document-list@1.5.1` (e.g. expects a different `context` shape), check the package's README and adjust. The function name and basic usage are stable; only the `context` parameter shape has shifted across versions.

- [ ] **Step 6.8** — Verify and commit:

  ```bash
  pnpm --filter @vetkit/studio typecheck
  pnpm --filter @vetkit/studio lint
  pnpm --filter @vetkit/studio build
  git add apps/studio/schemas apps/studio/structure
  git commit -m "feat(studio): add teamMember faq galleryImage page testimonial doc types"
  ```

---

## Task 7: Document the schema in `project-documentation/SCHEMA.md`

**Files:**

- Create: `project-documentation/SCHEMA.md`

**Why:** CLAUDE.md §11 requires a documented schema. Captures the Phase 1 contract so a future contributor (or codegen consumer) has one place to find it.

**Steps:**

- [ ] **Step 7.1** — Create `project-documentation/SCHEMA.md` with the following structure. Keep it short — link to the spec and source files rather than duplicating field-by-field:

  ```markdown
  # Schema — Phase 1

  > **Source of truth:** [`apps/studio/schemas/`](../apps/studio/schemas/). This file summarises the contract for fast onboarding; the schema files themselves are authoritative.
  >
  > **Design rationale:** [`specs/2026-05-26-sanity-schema-design.md`](./specs/2026-05-26-sanity-schema-design.md).

  ## Locale primitives

  Custom object types that wrap a value in a per-locale shape `{ tr, en }`.

  - `localeString` — short single-line text per locale.
  - `localeText` — multi-line text per locale.
  - `localeSlug` — URL slug per locale; auto-generates from `title[locale]` with Turkish→ASCII normalization.
  - `localePortableText` — rich text per locale; marks limited to `strong`/`em`/`link`, block styles limited to `normal`/`h2`/`h3`/`blockquote`.

  Editor-side locale filtering is provided by `@sanity/language-filter`; types marked with `options.localized: true` are filtered when the editor switches locale.

  ## Reusable objects

  - `seo` — `metaTitle?`, `metaDescription?`, `ogImage?` (alt required), `noIndex?`.
  - `address` — street, district, city, postalCode, country (default `TR`), googleMapsUrl?, coordinates?.
  - `openingHours` — `isAlwaysOpen` shortcut + per-day open/close fields + `emergencyNote?`.
  - `socialLinks` — instagram, facebook, x, youtube, tiktok URLs + whatsapp phone (E.164).
  - `cta` — label (localeString) + href + variant (primary/secondary/ghost) + newTab.
  - `contactInfo` — primaryPhone, emergencyPhone?, whatsapp?, email, secondaryEmails?.
  - `emergencyBanner` — enabled + text + phone + variant (top/sticky). Lives inside `siteSettings`.

  ## Documents

  | Type           | Public URL                  | Singleton? | Orderable?                  |
  | -------------- | --------------------------- | ---------- | --------------------------- |
  | `siteSettings` | —                           | ✓          | —                           |
  | `service`      | `/hizmetler/[slug]`         | —          | ✓                           |
  | `blogPost`     | `/blog/[slug]`              | —          | — (sorted by `publishedAt`) |
  | `teamMember`   | `/ekip/[slug]` (optional)   | —          | ✓                           |
  | `faq`          | `/sss` (aggregated)         | —          | ✓                           |
  | `galleryImage` | `/galeri` (aggregated)      | —          | ✓                           |
  | `page`         | `/[slug]`                   | —          | —                           |
  | `testimonial`  | aggregated on home/iletisim | —          | ✓                           |

  ### Required `seo` object on:

  - `service`, `blogPost`, `page` (every public-URL document).

  ### Validation rules of note

  - Slugs are kebab-case and unique within doc type, per locale.
  - Phone numbers must be E.164 (`+<country><number>`).
  - Image `alt` is `localeString` and required on every image that has an asset.
  - `siteSettings.defaultLocale` must be one of `activeLocales`.

  ## Out of scope (Phase 1)

  Mirrored from the design spec §10: no Google Reviews ingest, no document-level i18n, no `product`/`vaccinationSchedule`/multi-location doc types, no `service.responsibleVets`.
  ```

- [ ] **Step 7.2** — Commit:

  ```bash
  git add project-documentation/SCHEMA.md
  git commit -m "docs(schema): document phase 1 schema in project-documentation/SCHEMA.md"
  ```

---

## Task 8: Final docs update + cleanup

**Files:**

- Modify: `project-documentation/plan.md` — check Chunk 4, remove OD-1.
- Modify: `CLAUDE.md` §12 — append the decision-log rows from spec §13.
- Modify: `project-documentation/execution-map.md` — set Chunk 5 as active.
- Modify: `project-documentation/last-point.md` — snapshot the session.
- Delete: `project-documentation/working-notes/2026-05-21-chunk-4-brainstorm.md`.

**Why:** Operational docs must reflect that Chunk 4 shipped and Chunk 5 is next. The brainstorm doc has done its job; delete per CLAUDE.md anti-pattern about stale WIPs.

**Steps:**

- [ ] **Step 8.1** — Edit `project-documentation/plan.md`:
  - In §1 ("Phase 1 — MVP" → "Feature work (open)"): change `[ ] Full Sanity schema — all doc types + reusable objects (Chunk 4)` to `[x] ...`.
  - In §2 ("Phase 1 ordered backlog"): change the row for Chunk 4 from `4` to `✓ 4`, append "Shipped 2026-05-26 (commits `...`)." to the Notes column (commit hashes filled at execution time).
  - In §3 ("Open decisions"): delete the OD-1 row.

- [ ] **Step 8.2** — Edit `CLAUDE.md` §12 (Decision log table). Append five new rows for 2026-05-26 per the spec §13 (Sanity v5, field-level i18n, generic `page` doc with optional featured fields, `testimonial` Phase 1 inclusion, drop `service.responsibleVets`, plus "Resolves OD-1"). Each row: date, decision, rationale (one sentence), section reference (5, 3, etc.).

- [ ] **Step 8.3** — Replace `project-documentation/execution-map.md` §1 with Chunk 5 ("Sanity Studio Turkish localization + custom desk structure polish"). Use `updating-execution-map` skill conventions: single active chunk, testable Done-when criteria, dependency on Chunk 4 (now satisfied), open decisions affecting Chunk 5 (none new — Studio i18n strings are an implementation detail).

  Suggested Goal line: "Polish the Studio UX: surface Turkish UI strings throughout the desk structure beyond the already-Turkish titles, audit empty/edit states, and finalize the orderable list ergonomics that landed alongside Chunk 4."

  Suggested Done-when: (a) `apps/studio/structure/deskStructure.ts` uses `i18n.title` consistently; (b) `studio.config` exposes a Turkish locale bundle for the Studio chrome (Sanity Studio i18n config); (c) Studio dev manually verified: every doc type shows Turkish list label, every field shows Turkish description.

- [ ] **Step 8.4** — Replace `project-documentation/last-point.md` snapshot. Use the `writing-last-point` skill conventions:
  - **Last commit on main:** the docs(execution-map) commit you're about to write (compute after committing this docs update, or use `git log -1` after Step 8.6 to fill in).
  - **What's running:** add "Sanity v5 Studio with 8 doc types + 11 reusable objects + singleton + language-filter + orderable lists. `pnpm --filter @vetkit/studio build` clean."
  - **What was done in this session:** bullet list of the 8 commits from this chunk.
  - **What is NOT yet set up:** cross off "Sanity schema (Chunk 4)" — replace with "Studio i18n polish (Chunk 5)" pending.
  - **Open decisions:** OD-1 resolved; OD-3 (CI), OD-4 (Studio hostname) still open. Chunk 4 micro-decisions all resolved 2026-05-26.
  - **Heads-up for next session:** Chunk 5 is Studio Turkish polish; read execution-map.md.

- [ ] **Step 8.5** — Delete the brainstorm working-note:

  ```bash
  git rm project-documentation/working-notes/2026-05-21-chunk-4-brainstorm.md
  ```

- [ ] **Step 8.6** — Stage and commit. Three logically distinct commits per the `writing-commits` skill (one topic per commit):

  ```bash
  git add CLAUDE.md
  git commit -m "docs(claude): log chunk 4 decisions and resolve od-1"

  git add project-documentation/plan.md
  git commit -m "docs(plan): mark chunk 4 done and clear od-1"

  git add project-documentation/execution-map.md project-documentation/last-point.md project-documentation/working-notes/2026-05-21-chunk-4-brainstorm.md
  git commit -m "docs(project): set chunk 5 active, refresh last-point, drop chunk 4 working notes"
  ```

  > Splitting the docs into three commits is intentional — `writing-commits` favors topical splits. If repo conventions tighten later (e.g. one combined docs commit per chunk), revisit then.

- [ ] **Step 8.7** — Final whole-monorepo verification:

  ```bash
  pnpm typecheck
  pnpm lint
  pnpm --filter @vetkit/studio build
  pnpm --filter @vetkit/web build
  ```

  All four must pass. If any fail, **do not declare the chunk done** — fix the failure first (creating a small follow-up commit) before updating downstream state.

- [ ] **Step 8.8** — Optional but recommended: open Studio dev (`pnpm --filter @vetkit/studio dev`) against a scratch dataset and tick off §11 of the spec verification list. If a scratch dataset isn't wired up yet, log this as a follow-up Chunk-5 todo in `last-point.md` rather than blocking the merge.

---

## Self-review checklist (executor — verify before declaring done)

- All eight document types from spec §5 implemented (`siteSettings`, `service`, `blogPost`, `teamMember`, `faq`, `galleryImage`, `page`, `testimonial`).
- All eleven reusable objects implemented (four locale primitives + seven non-locale objects).
- `siteSettings` is reachable from the Turkish desk structure and not creatable from "+ Create new".
- `@sanity/language-filter` is wired with TR + EN.
- Orderable lists work for `service`, `teamMember`, `faq`, `galleryImage`, `testimonial`.
- Every public-URL doc carries a `seo` field.
- Every image carries a `localeString` `alt` (required when an asset is present).
- Portable Text respects the §5 mark/style restrictions (no `h1`).
- `pnpm typecheck`, `pnpm lint`, `pnpm --filter @vetkit/studio build`, `pnpm --filter @vetkit/web build` all pass.
- Decision-log entries appended to `CLAUDE.md` §12.
- Working-notes brainstorm deleted from git.
- `plan.md`, `execution-map.md`, `last-point.md` reflect Chunk 4 done and Chunk 5 next.
