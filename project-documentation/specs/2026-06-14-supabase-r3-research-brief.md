# R3 Research Brief — Admin Content CRUD (forms + draft/publish + Tiptap + Storage uploads + ordering)

> **Scope:** `apps/admin` content CRUD for the 9 content types. Consolidates R3 research into an implementation-ready brief. Companion to [`2026-06-14-supabase-data-model.md`](2026-06-14-supabase-data-model.md). Where a fact is **not web-confirmed**, it is marked `[codebase]` (verified against the repo this session) or `[unverified]`.
>
> **Already in the repo (verified this session — do not re-create):** `apps/admin/lib/slug.ts` (`turkishSlugify` already ported), `apps/admin/lib/tenant-db.ts` (`getTenantContext`), `apps/admin/lib/auth.ts` (`getActor`), `apps/admin/lib/supabase/{server,client}.ts`, and `apps/admin/app/(app)/services/page.tsx` (list view). R3 adds the **forms, server actions, editor, upload, and ordering** on top of these.

---

## 1. Packages + versions to install in `apps/admin`

Already present `[codebase]`: `@supabase/ssr@^0.12.0`, `@supabase/supabase-js@^2.108.1`, `@vetkit/db (workspace:*)`, `next@16.2.4`, `react/react-dom@^19.2.4`.

Add (web-confirmed current versions, June 2026):

```bash
pnpm --filter @vetkit/admin add \
  react-hook-form@^7.79 \
  zod@^4 \
  @hookform/resolvers@^5.4 \
  @tiptap/react@^3 \
  @tiptap/pm@^3 \
  @tiptap/starter-kit@^3
```

Exact current versions resolved: `react-hook-form@7.79.0`, `zod@4.4.3`, `@hookform/resolvers@5.4.0`, `@tiptap/react@3.26.1`, `@tiptap/pm@3.26.1`, `@tiptap/starter-kit@3.26.1`.

**For the public-site renderer (R4 — install in `apps/web`, not admin):** one JSON→HTML renderer, **pick exactly one**:

```bash
# Recommended (no DOM, RSC-friendly):
pnpm --filter @vetkit/web add @tiptap/static-renderer@^3 @tiptap/starter-kit@^3 @tiptap/pm@^3
# OR the mature virtual-DOM path:
# pnpm --filter @vetkit/web add @tiptap/html@^3 @tiptap/starter-kit@^3 @tiptap/pm@^3
```

**Notes:**

- `@tiptap/pm` is a required peer (the ProseMirror bundle). Install it even though you never import it directly, or Tiptap fails to resolve `prosemirror-*` internals.
- **Do NOT** add `@tiptap/extension-link` — the **Link mark is bundled inside StarterKit v3**. Adding it separately triggers a "duplicate extension named link" warning. Only add it if you later need a standalone custom link UI.
- `zod@4` is imported as bare `import { z } from 'zod'` — that IS Zod 4. **Never** import `zod/v4` in app code (mixing subpaths creates two Zod instances and breaks `instanceof` in the resolver).

---

## 2. Tiptap editor (SSR-safe, restricted ruleset, controlled JSON) + public-site render

### 2.1 Decision: store **JSON** (not HTML)

`[codebase]` The schema stores rich text as **`jsonb`** — `services.description`, `faqs.answer`, `blog_posts.body`, `team_members.bio`, `pages.body`, `testimonials.content` are all `jsonb` with the `TiptapDoc` Zod shape (`packages/db/src/database.types.ts` narrows them; `tiptapDocSchema` validates them). So the editor must emit and consume **`editor.getJSON()` / `content: storedJson`**, store as `jsonb`, and the public site renders that JSON server-side.

> The RHF research example used `getHTML()`; **override it to `getJSON()`** to match the `jsonb` columns. The `Controller` value type becomes `JSONContent`, not `string`.

### 2.2 Restricted ruleset (matches the legacy Portable-Text rules: h2/h3, blockquote, lists, strong/em/link, **no h1**)

```ts
// apps/admin/lib/editor/extensions.ts — single source of truth, imported by BOTH
// the editor and (re-exported for) the public renderer so schemas match exactly.
import StarterKit from '@tiptap/starter-kit';

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] }, // drops h1 from input rules/shortcuts/commands -> SEO rule kept
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    // keep: blockquote, bulletList, orderedList, bold, italic
    link: {
      openOnClick: false, // editor: click places cursor, not navigate
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
    },
  }),
];
```

### 2.3 The editor component (`'use client'`, SSR-safe, controlled JSON in/out)

```tsx
// apps/admin/components/editor/rich-text-field.tsx
'use client';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { editorExtensions } from '@/lib/editor/extensions';

export function RichTextField({
  value,
  onChange,
  onBlur,
}: {
  value: JSONContent | null;
  onChange: (doc: JSONContent) => void;
  onBlur?: () => void;
}) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: value ?? '', // seed once from stored JSON; do NOT re-feed each render
    immediatelyRender: false, // REQUIRED in Next App Router — else "SSR detected" throw + hydration mismatch
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    onBlur: onBlur ? () => onBlur() : undefined,
  });

  const s = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor && {
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isH2: editor.isActive('heading', { level: 2 }),
        isH3: editor.isActive('heading', { level: 3 }),
        isQuote: editor.isActive('blockquote'),
        isBullet: editor.isActive('bulletList'),
        isOrdered: editor.isActive('orderedList'),
        isLink: editor.isActive('link'),
      },
  });

  if (!editor) return null; // with immediatelyRender:false the first render is editor === null

  return (
    <div>
      <div className="toolbar">
        <button
          type="button"
          data-active={s?.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          data-active={s?.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          data-active={s?.isH2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          data-active={s?.isH3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          data-active={s?.isQuote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </button>
        <button
          type="button"
          data-active={s?.isBullet}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </button>
        <button
          type="button"
          data-active={s?.isOrdered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>
        {/* link toggle needs a small URL prompt UI — set/unset via .setLink({href})/.unsetLink() */}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
```

**Web-confirmed facts behind this:**

- `immediatelyRender: false` is **mandatory** in Next App Router; without it Tiptap throws `SSR has been detected, please set immediatelyRender explicitly to false`.
- React 19 StrictMode double-mount needs **no workaround** beyond `immediatelyRender: false` (Tiptap v3 delays unmount 2 ticks internally).
- `useEditorState` is a real v3 hook; use it so toolbar `isActive` reads don't re-render the whole editor subtree on every transaction.
- Render `null` until `editor` is truthy.

### 2.4 Public-site render (R4 — render stored JSON to HTML server-side, **never mount an editor**)

Pass the **identical** configured extension array so the schema matches and no unexpected nodes slip through.

```ts
// Recommended: pure JS, no DOM — ideal for RSC
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import { editorExtensions } from '@/lib/editor/extensions'; // same array as the admin
const html = renderToHTMLString({ extensions: editorExtensions, content: storedJson });

// Alternative (mature, virtual-DOM, server or browser):
// import { generateHTML } from '@tiptap/html';
// const html = generateHTML(storedJson, editorExtensions);
```

`@tiptap/static-renderer` also offers `renderToReactElement` if the template prefers React nodes over an HTML string + `dangerouslySetInnerHTML` — **open decision (see §8)**.

---

## 3. RHF + Zod 4 + server-action form pattern (Tiptap `Controller` + file input)

### 3.1 Zod 3 → 4 changes that affect this work (web-confirmed)

| Zod 3                                | Zod 4                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `z.string().email()/.url()/.uuid()`  | **top-level** `z.email()` / `z.url()` / `z.uuid()` / `z.iso.datetime()`                  |
| `{ message: '...' }`                 | `{ error: '...' }` (string or fn; `message` deprecated but still works)                  |
| `z.nativeEnum()`                     | `z.enum()` (takes literal arrays AND native enums)                                       |
| `error.flatten()` / `error.format()` | standalone `z.flattenError(err)` → `{ formErrors, fieldErrors }` / `z.treeifyError(err)` |

- `@hookform/resolvers@5` infers **both** input and output from the schema. With `coerce`/`transform`/`default`, annotate `useForm<z.input<S>, Ctx, z.output<S>>` or you get confusing TS errors.
- The `#12816` "ZodError thrown instead of captured" bug was **Zod-4-beta + resolver-5.0.1 only** — does **not** apply to current stable `5.4.0` + `zod 4.4.3`. Do not downgrade.

### 3.2 One shared schema (client `zodResolver` + server `safeParse`)

```ts
// apps/admin/app/(app)/services/schema.ts — shared by the form and the action
import { z } from 'zod';
import { tiptapDocSchema } from '@vetkit/db'; // re-exported from packages/db/src/schemas

export const serviceFormSchema = z.object({
  title: z.string().min(1, { error: 'Başlık zorunlu' }).max(120),
  slug: z
    .string()
    .min(1, { error: 'Slug zorunlu' })
    .regex(/^[a-z0-9-]+$/, { error: 'Yalnızca a-z, 0-9, -' })
    .max(96),
  shortDescription: z.string().max(280).optional(),
  description: tiptapDocSchema.nullable(), // jsonb Tiptap doc
  petTypes: z.array(z.string()).default([]),
  serviceLocation: z.enum(['in-clinic', 'home-call', 'both']).default('in-clinic'),
  emergencyAvailable: z.boolean().default(false),
  pricing: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  noIndex: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
  mainImageMediaId: z.uuid().nullable().optional(),
  iconMediaId: z.uuid().nullable().optional(),
  ogImageId: z.uuid().nullable().optional(),
});
export type ServiceFormInput = z.input<typeof serviceFormSchema>;
export type ServiceFormOutput = z.output<typeof serviceFormSchema>;
```

### 3.3 Server action (`getTenantContext` → validate → RLS-scoped write → revalidate)

```ts
// apps/admin/app/(app)/services/actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getTenantContext } from '@/lib/tenant-db';
import { turkishSlugify } from '@/lib/slug';
import { serviceFormSchema } from './schema';

export type ActionState = {
  ok: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export async function upsertService(id: string | null, input: unknown): Promise<ActionState> {
  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const { supabase, tenant } = await getTenantContext(); // redirects if no session/tenant
  const v = parsed.data;
  const slug = turkishSlugify(v.slug || v.title);

  // published_at: stamp the first time status flips to 'published'.
  const row = {
    tenant_id: tenant.id,
    title: v.title,
    slug,
    short_description: v.shortDescription ?? null,
    description: v.description, // jsonb
    pet_types: v.petTypes,
    service_location: v.serviceLocation,
    emergency_available: v.emergencyAvailable,
    pricing: v.pricing ?? null,
    meta_title: v.metaTitle ?? null,
    meta_description: v.metaDescription ?? null,
    no_index: v.noIndex,
    status: v.status,
    published_at: v.status === 'published' ? new Date().toISOString() : null,
    main_image_media_id: v.mainImageMediaId ?? null,
    icon_media_id: v.iconMediaId ?? null,
    og_image_id: v.ogImageId ?? null,
  };

  const q = id
    ? supabase.from('services').update(row).eq('id', id).eq('tenant_id', tenant.id)
    : supabase.from('services').insert(row);
  const { error } = await q;

  if (error) {
    // unique (tenant_id, slug) violation -> Postgres code 23505
    if (error.code === '23505')
      return { ok: false, fieldErrors: { slug: ['Bu slug zaten kullanılıyor'] } };
    return { ok: false, formError: error.message };
  }
  revalidatePath('/services');
  return { ok: true };
}
```

> `[codebase]` Tenant scoping is enforced two ways: the explicit `.eq('tenant_id', tenant.id)` AND RLS on the cookie-bound client. **Never** use a service-role client here — it bypasses RLS and silently breaks tenant isolation (the spec's cross-tenant leak test should catch it).

### 3.4 The form (Tiptap via `Controller`, server-side errors mapped back)

```tsx
// apps/admin/app/(app)/services/service-form.tsx
'use client';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceFormSchema, type ServiceFormInput, type ServiceFormOutput } from './schema';
import { upsertService } from './actions';
import { RichTextField } from '@/components/editor/rich-text-field';

export function ServiceForm({ id, defaults }: { id: string | null; defaults: ServiceFormInput }) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInput, unknown, ServiceFormOutput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: defaults,
  });

  const onSubmit: SubmitHandler<ServiceFormOutput> = async (values) => {
    const res = await upsertService(id, values);
    if (!res.ok) {
      for (const [field, msgs] of Object.entries(res.fieldErrors ?? {}))
        if (msgs?.[0])
          setError(field as keyof ServiceFormInput, { type: 'server', message: msgs[0] });
      if (res.formError) setError('root.server', { message: res.formError });
    }
    // on ok: router.push('/services') or rely on revalidatePath + a redirect in the action
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <p>{errors.title.message}</p>}
      <input {...register('slug')} />
      {errors.slug && <p>{errors.slug.message}</p>}
      <select {...register('serviceLocation')}>
        <option value="in-clinic">Klinikte</option>
        <option value="home-call">Evde</option>
        <option value="both">Her ikisi</option>
      </select>
      <label>
        <input type="checkbox" {...register('emergencyAvailable')} /> Acil
      </label>
      <select {...register('status')}>
        <option value="draft">Taslak</option>
        <option value="published">Yayında</option>
      </select>
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <RichTextField value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
        )}
      />
      {errors.root?.server && <p>{errors.root.server.message}</p>}
      <button disabled={isSubmitting}>Kaydet</button>
    </form>
  );
}
```

**File-input note (web-confirmed):** `<input type=file>` cannot be a controlled RHF value, and client `File` objects don't survive Server-Action serialization unless sent via `FormData`. **Recommended for this project:** do **not** route files through RHF/the action at all — upload to Storage from a client component and pass only the resulting `media.id` (uuid) through RHF as `mainImageMediaId` etc. (see §4). Use a media-picker component, not a raw file field, in the form.

---

## 4. Storage upload flow (server action, tenant path, `media` row insert, public URL)

`[codebase]` The `media` bucket is **public** (`storage.buckets … public=true`), objects are namespaced `media/<tenantId>/...`, and storage RLS (`20260614120300_rls_and_grants.sql`) gates member INSERT/UPDATE/DELETE with `bucket_id = 'media' AND (storage.foldername(name))[1] in (<caller's tenant_ids>)`. `public.media` columns `[codebase]`: `id, tenant_id, bucket_path, alt, width, height, mime, focal_x, focal_y, created_at`.

### 4.1 Upload server action (cookie-bound client → upload → insert `media` row, same client)

```ts
// apps/admin/app/(app)/media/actions.ts
'use server';
import { getTenantContext } from '@/lib/tenant-db';

export async function uploadMedia(
  formData: FormData,
): Promise<{ ok: boolean; mediaId?: string; error?: string }> {
  const { supabase, tenant } = await getTenantContext();
  const file = formData.get('file') as File | null;
  if (!file) return { ok: false, error: 'Dosya yok' };

  const alt = (formData.get('alt') as string | null) ?? null;
  const width = Number(formData.get('width')) || null; // measured client-side before submit
  const height = Number(formData.get('height')) || null;

  const path = `${tenant.id}/${crypto.randomUUID()}.webp`; // tenant segment is folder[1]
  const { data, error } = await supabase.storage
    .from('media')
    .upload(path, file, { contentType: file.type, upsert: false, cacheControl: '3600' });
  if (error) return { ok: false, error: error.message };

  const { data: row, error: insErr } = await supabase
    .from('media')
    .insert({ tenant_id: tenant.id, bucket_path: data.path, alt, width, height, mime: file.type })
    .select('id')
    .single();
  if (insErr) return { ok: false, error: insErr.message };

  return { ok: true, mediaId: row.id };
}
```

**Web-confirmed upload facts:**

- `upload(path, fileBody, options?)` resolves to `{ data: { id, path, fullPath }, error }`. Store **`data.path`** in `media.bucket_path`.
- `fileBody` accepts `File` directly from `formData.get(name) as File` in a server action — no conversion.
- `options`: `{ cacheControl?, contentType?, upsert?, metadata?, headers?, duplex? }`. Default `contentType` is `text/plain;charset=UTF-8` and `cacheControl` is `'3600'` — **always pass `contentType` for images** (a `File` auto-sets it; raw bytes do not).
- `upsert` defaults to `false`; re-upload to the same path → 400 "already exists". Use a UUID/content-hash filename to avoid collisions (the docs advise against overwriting due to CDN caching).
- `(storage.foldername(name))` is a **1-indexed** Postgres array — tenant segment is `[1]`. Writing `[0]` in a policy silently denies everything.

### 4.2 Serving + transforms

- `getPublicUrl(path)` is **synchronous**: `const { data } = supabase.storage.from('media').getPublicUrl(bucket_path); data.publicUrl`.
- `getPublicUrl` does **not** verify existence or enforce RLS — it just string-builds a URL. The bucket is public, so URLs are world-readable; this is consistent with the data model's "public read of published content" intent. **`[unverified]` for this project:** unpublished images live in the same public bucket and are therefore URL-guessable — confirm in §8 whether that's acceptable or whether private images need `createSignedUrl` + a private bucket.
- The `transform` resize option (`width/height/resize/quality`) on `getPublicUrl` is **Pro-plan-and-above only**. Do not rely on it on Free/Hobby. Strategy: capture real `width`/`height` at upload and resize with `next/image`. `[codebase]` The schema deliberately uses `focal_x/focal_y` as CSS `object-position` (not Storage crop), confirming a no-Storage-transform assumption.
- **Dimensions are not returned by Storage** — measure before insert: client-side `createImageBitmap(file)` (untrusted, smaller server) or server-side `sharp` (adds a dep + node runtime). **Open decision (§8).**

---

## 5. `turkishSlugify` + what `@vetkit/db` exports for typed mutations

### 5.1 `turkishSlugify` — already ported `[codebase]`

`apps/admin/lib/slug.ts` already contains the verbatim port (Turkish char map ç/ğ/ı/İ/ö/ş/ü → ascii, `normalize('NFKD')` diacritic strip, lowercase, `[^a-z0-9]+ → -`, trim hyphens, `.slice(0, 96)`). Import it; do not re-create. The 96-char cap matches `services.slug` usage and is consistent across studio/admin.

### 5.2 `@vetkit/db` exports `[codebase]`

```ts
// from packages/db/src/index.ts
export * from './client'; // createAnonClient, createServiceRoleClient (NOT for admin RLS writes)
export * from './schemas'; // ctaSchema, contactSchema, coordinatesSchema, addressSchema,
// dayHoursSchema, openingHoursSchema, socialLinksSchema, seoSchema,
// emergencyBannerSchema, tiptapDocSchema (+ inferred types Cta, Seo, TiptapDoc, …)
export type { Database, Tables, TablesInsert, TablesUpdate, Enums, Json } from './database.types';
```

For typed mutations:

- **Reads:** `Tables<'services'>` — jsonb columns are **narrowed** (e.g. `description: TiptapDoc | null`).
- **Writes:** `TablesInsert<'services'>` / `TablesUpdate<'services'>` — jsonb columns stay **`Json`-loose**; validate at the write boundary with the Zod schemas (`tiptapDocSchema` for rich text).
- **Enums:** `Enums<'…'>` (note `status`/`service_location` are DB `check` constraints in these tables, expressed as string unions in generated types — `[unverified]` whether they surface as named PG enums in `Enums<>`; treat them as the literal unions in the Zod schema regardless).

---

## 6. Content table columns + enums (the 9 CRUD types) `[codebase]`

From `packages/db/supabase/migrations/20260614120200_content_tables.sql`. Common to publishable docs: `id`, `tenant_id`, `status text check ('draft','published') default 'draft'`, `published_at timestamptz`, `sort_order int default 0`, `created_at`, `updated_at` (trigger `set_updated_at`).

| Type                                                     | Slug? (unique `(tenant_id, slug)`) | Rich text (`jsonb`) | Type-specific columns / enums                                                                                                                                                                                                                       |
| -------------------------------------------------------- | ---------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **services**                                             | yes                                | `description`       | `short_description`, `main_image_media_id`, `icon_media_id`, `pet_types text[]`, `service_location ('in-clinic'\|'home-call'\|'both')`, `emergency_available`, `pricing`, `meta_title/description`, `og_image_id`, `no_index`                       |
| **faqs**                                                 | no                                 | `answer`            | `question`, `category ('genel'\|'asilama'\|'cerrahi'\|'beslenme'\|'acil')`                                                                                                                                                                          |
| **blog_posts**                                           | yes                                | `body`              | `excerpt`, `cover_image_media_id`, `author_id → team_members`, `category ('genel'\|'beslenme'\|'asilama'\|'davranis'\|'acil')`, `tags text[]`, `meta_title/description`, `og_image_id`, `no_index`. **`published_at` doubles as the display date.** |
| **team_members**                                         | `[unverified]`\*                   | `bio`               | `social_links jsonb` (SocialLinks) — \*full columns not read this session; confirm before form                                                                                                                                                      |
| **gallery_images**                                       | no                                 | —                   | `media_id`, `caption`, `category ('klinik-ici'\|'tedavi'\|'ekip'\|'hastalar')`                                                                                                                                                                      |
| **pages**                                                | yes                                | `body`              | `hero_image_media_id`, `cta_buttons jsonb` (Cta[]), `meta_title/description`, `og_image_id`, `no_index`                                                                                                                                             |
| **testimonials**                                         | no                                 | `content`           | `author_name`, `author_photo_media_id`, `rating int (1–5)`, `source ('manual'\|'google'\|'trustmary')`, `source_url`, `featured`                                                                                                                    |
| **site_settings** (singleton)                            | n/a                                | —                   | jsonb value-objects: `contact`, `address`, `opening_hours`, `social_links`, `emergency_banner`, `footer_links (Cta[])`, `default_seo` — validate each with its `@vetkit/db` Zod schema                                                              |
| **submissions** (leads, read/triage only — not authored) | no                                 | —                   | `name`, `phone`, `email`, `message`, `pet_type`, `source`, `status ('new'\|'read'\|'archived')`, `meta jsonb` (no `sort_order`/`updated_at`)                                                                                                        |

**Full `services` column list** (the R3 reference type, 20 cols): `id, tenant_id, title, slug, main_image_media_id, icon_media_id, short_description, description(jsonb), pet_types(text[]), service_location, emergency_available, pricing, meta_title, meta_description, og_image_id, no_index, status, published_at, sort_order, created_at, updated_at`. Unique index `services_tenant_slug_key (tenant_id, slug)`.

**Ordered relationships (junction tables, `position int`):** `service_related_faqs`, `blog_post_related_services` — both carry a denormalized `tenant_id` and order by `position`. Drag-reorder writes update `position`.

### Draft/publish + ordering conventions

- **Publish** = `status: 'published'` and stamp `published_at` on first publish (already-set `published_at` should be preserved on re-save — `[unverified]` exact rule; standardize in the action).
- **Ordering** = `sort_order` per type (and `position` on junctions). Reorder via a server action that updates `sort_order` for the moved rows; list views already `.order('sort_order')` `[codebase]`.

---

## 7. Recommended file structure — reusable resource pattern across the 9 types

A per-resource folder under `app/(app)/<resource>/`, each following the same shape so all 9 types share one mental model. Shared primitives live in `lib/` and `components/`.

```
apps/admin/
├─ lib/
│  ├─ slug.ts                         # [exists] turkishSlugify
│  ├─ tenant-db.ts                    # [exists] getTenantContext
│  ├─ auth.ts                         # [exists] getActor
│  ├─ supabase/{server,client,proxy}.ts  # [exists]
│  └─ editor/
│     └─ extensions.ts                # NEW — single editorExtensions array (admin + web import this)
├─ components/
│  ├─ editor/rich-text-field.tsx      # NEW — 'use client' Tiptap field (controlled JSON)
│  ├─ form/                           # NEW — shared field wrappers (TextField, SelectField,
│  │                                  #       StatusField draft/published, SortableList)
│  └─ media/media-picker.tsx          # NEW — 'use client' upload + pick → emits media.id
├─ app/(app)/
│  ├─ services/
│  │  ├─ page.tsx                     # [exists] list (order by sort_order)
│  │  ├─ schema.ts                    # NEW — shared zod schema (client + action)
│  │  ├─ actions.ts                   # NEW — upsert / delete / reorder / setStatus
│  │  ├─ service-form.tsx             # NEW — 'use client' RHF form
│  │  ├─ new/page.tsx                 # NEW — renders <ServiceForm id={null} defaults={…}/>
│  │  └─ [id]/page.tsx                # NEW — loads row, renders <ServiceForm id={id} …/>
│  ├─ blog/ | faqs/ | team/ | gallery/ | pages/ | testimonials/
│  │                                  # same 6-file shape as services/
│  ├─ settings/                       # site_settings singleton — one form, no list/new
│  └─ submissions/                    # leads — list + status triage only (no create form)
```

**Resource pattern (the repeated unit, 9× minus singleton/leads variations):**

1. `schema.ts` — one Zod 4 object, shared by form (`zodResolver`) and action (`safeParse`).
2. `actions.ts` — `'use server'`: `getTenantContext()` → `safeParse` → RLS-scoped insert/update with explicit `.eq('tenant_id', tenant.id)` → `revalidatePath`. Plus `deleteX`, `reorderX` (writes `sort_order`), `setStatus`.
3. `<resource>-form.tsx` — `'use client'` RHF form with `<Controller>` around `RichTextField` for jsonb fields and `<MediaPicker>` for image FKs.
4. `page.tsx` (list, exists for services) / `new/page.tsx` / `[id]/page.tsx`.

`site_settings` is the singleton variant (no list/new/[id]; one form, one row keyed by tenant). `submissions` is the read-only variant (list + status update, no authoring form).

> `[unverified]` Whether to extract a generic `createResource<T>()` factory now or keep per-resource files. Recommendation: **start explicit per-resource** (services first as the template), extract shared `<form>` field components and the action skeleton only once 2–3 resources confirm the shape — avoids premature abstraction (CLAUDE.md anti-pattern #1).

---

## 8. Open decisions to resolve before/while building

1. **Public render output (R4):** `renderToHTMLString` (+ `dangerouslySetInnerHTML`) vs `renderToReactElement` from `@tiptap/static-renderer`. Recommendation: HTML string is simplest; React elements give finer per-node styling control.
2. **Media bucket privacy:** bucket is currently **public** `[codebase]`, so _unpublished_ images are URL-guessable. Confirm acceptable, or move unpublished assets to a private bucket + `createSignedUrl`. The data-model "Option A published-only read" covers DB rows, **not** storage objects.
3. **Image dimensions source:** client `createImageBitmap` (untrusted, lean server) vs server `sharp` (trusted, +dep, node runtime).
4. **Supabase plan:** Pro determines whether on-the-fly `transform` resize exists; otherwise thumbnails come from `next/image`. The schema's `focal_x/focal_y` already assumes no Storage crop.
5. **Slug entry UX:** auto-generate from title via `turkishSlugify` with a manual-override field, vs manual-only with validation. Recommendation: auto-generate, allow override, slugify the override server-side too.
6. **`published_at` re-save rule:** stamp on first publish only and preserve thereafter, or restamp each publish. Standardize in the shared action.
7. **`tiptapDocSchema` strictness:** currently loose (`{ type, content?[] }`) `[codebase]`. Decide whether R3 tightens node/mark validation to the restricted ruleset, or keeps it loose and trusts the editor.
8. **Media fields on first create:** allow services/blog/pages to save with null image FKs initially (recommended — they're nullable FKs), media attached later via the picker.

---

## Quick reference — fact confidence

- **Web-confirmed:** all package versions; Tiptap `immediatelyRender:false` requirement, StarterKit v3 contents + bundled Link, `heading.levels` restriction, `getJSON`/`useEditorState`, `static-renderer`/`@tiptap/html` render paths, React 19 StrictMode handling; Zod 3→4 breaking changes, resolver-5 input/output inference, `#12816` scope; Supabase `upload` signature/body/options, `foldername` 1-indexing, `getPublicUrl` sync + transform-is-Pro-only, server-client cookie `getAll/setAll`.
- **`[codebase]` (verified this repo, not web):** jsonb storage of rich text; `services` (and the other 8 types') columns + enums + unique indexes; `media` columns + public bucket + storage RLS `foldername[1]`; existing `turkishSlugify`, `getTenantContext`, `getActor`, server/browser clients, services list page; `@vetkit/db` exports.
- **`[unverified]`:** `team_members` full column set; whether check-constraint enums surface in `Enums<>`; exact `published_at` re-save rule; unpublished-media URL-guessability acceptability; generic-factory vs per-resource choice.
