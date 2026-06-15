-- vetkit R1 — content tables (faithful Postgres superset of the Sanity model).
-- Conventions (spec §3): tenant_id FK, status draft/published, published_at,
-- sort_order (replaces orderRank), timestamps + updated_at trigger. Rich text
-- (Sanity Portable Text) -> jsonb holding Tiptap JSON. Cohesive value-objects
-- (contact/address/hours/social/cta/seo) -> jsonb (typed via Zod at the app
-- boundary). SEO -> flat columns so og_image can be a real FK to media.
-- RLS + grants are applied in the next migration.

-- team_members — defined first; blog_posts.author_id references it.
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  title text not null,
  slug text,
  photo_media_id uuid references public.media (id) on delete set null,
  credentials text[] not null default '{}',
  specialties text[] not null default '{}',
  short_bio text,
  bio jsonb, -- Tiptap
  email text,
  phone text,
  social_links jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index team_members_tenant_id_idx on public.team_members (tenant_id);
create unique index team_members_tenant_slug_key
  on public.team_members (tenant_id, slug) where slug is not null;
create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

-- site_settings — singleton per tenant (always-live config; no draft/publish).
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants (id) on delete cascade,
  clinic_name text not null,
  tagline text,
  logo_media_id uuid references public.media (id) on delete set null,
  brand_color_hex text,
  brand_color_name text,
  contact jsonb,
  address jsonb,
  opening_hours jsonb,
  social_links jsonb,
  emergency_banner jsonb,
  footer_text text,
  footer_links jsonb,
  default_seo jsonb,
  vercel_analytics_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- hero_slides — always-live homepage carousel config.
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  media_id uuid references public.media (id) on delete set null,
  heading text not null,
  subheading text,
  cta jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hero_slides_tenant_id_idx on public.hero_slides (tenant_id);
create trigger hero_slides_set_updated_at
  before update on public.hero_slides
  for each row execute function public.set_updated_at();

-- services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  title text not null,
  slug text not null,
  main_image_media_id uuid references public.media (id) on delete set null,
  icon_media_id uuid references public.media (id) on delete set null,
  short_description text,
  description jsonb, -- Tiptap
  pet_types text[] not null default '{}',
  service_location text not null default 'in-clinic'
    check (service_location in ('in-clinic', 'home-call', 'both')),
  emergency_available boolean not null default false,
  pricing text,
  meta_title text,
  meta_description text,
  og_image_id uuid references public.media (id) on delete set null,
  no_index boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_tenant_id_idx on public.services (tenant_id);
create unique index services_tenant_slug_key on public.services (tenant_id, slug);
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- faqs
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  question text not null,
  answer jsonb, -- Tiptap
  category text check (category in ('genel', 'asilama', 'cerrahi', 'beslenme', 'acil')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index faqs_tenant_id_idx on public.faqs (tenant_id);
create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- blog_posts (published_at doubles as the display date AND the publish stamp)
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text,
  body jsonb, -- Tiptap
  cover_image_media_id uuid references public.media (id) on delete set null,
  author_id uuid references public.team_members (id) on delete set null,
  published_at timestamptz,
  category text check (category in ('genel', 'beslenme', 'asilama', 'davranis', 'acil')),
  tags text[] not null default '{}',
  meta_title text,
  meta_description text,
  og_image_id uuid references public.media (id) on delete set null,
  no_index boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index blog_posts_tenant_id_idx on public.blog_posts (tenant_id);
create index blog_posts_author_id_idx on public.blog_posts (author_id);
create unique index blog_posts_tenant_slug_key on public.blog_posts (tenant_id, slug);
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- gallery_images
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  media_id uuid references public.media (id) on delete set null,
  caption text,
  category text check (category in ('klinik-ici', 'tedavi', 'ekip', 'hastalar')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gallery_images_tenant_id_idx on public.gallery_images (tenant_id);
create trigger gallery_images_set_updated_at
  before update on public.gallery_images
  for each row execute function public.set_updated_at();

-- pages (generic content pages, e.g. hakkimizda)
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  title text not null,
  slug text not null,
  hero_image_media_id uuid references public.media (id) on delete set null,
  body jsonb, -- Tiptap
  cta_buttons jsonb,
  meta_title text,
  meta_description text,
  og_image_id uuid references public.media (id) on delete set null,
  no_index boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pages_tenant_id_idx on public.pages (tenant_id);
create unique index pages_tenant_slug_key on public.pages (tenant_id, slug);
create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- testimonials (schema-present; not yet rendered on the public site)
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  author_name text not null,
  author_photo_media_id uuid references public.media (id) on delete set null,
  content jsonb, -- Tiptap
  rating integer check (rating between 1 and 5),
  source text not null default 'manual' check (source in ('manual', 'google', 'trustmary')),
  source_url text,
  published_at timestamptz,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index testimonials_tenant_id_idx on public.testimonials (tenant_id);
create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- submissions (contact form -> leads; persisted AND emailed via Resend)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  message text not null,
  pet_type text,
  source text not null default 'contact_form',
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  meta jsonb,
  created_at timestamptz not null default now()
);
create index submissions_tenant_status_idx on public.submissions (tenant_id, status);

-- ---------------------------------------------------------------------------
-- Ordered relationships (Sanity arrays-of-references). Junctions carry a
-- denormalized tenant_id for uniform/fast RLS (app keeps it equal to both
-- parents). `position` preserves editor order. FKs cascade on delete.
-- ---------------------------------------------------------------------------
create table public.service_related_faqs (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  faq_id uuid not null references public.faqs (id) on delete cascade,
  position integer not null default 0,
  primary key (service_id, faq_id)
);
create index service_related_faqs_tenant_id_idx on public.service_related_faqs (tenant_id);
create index service_related_faqs_faq_id_idx on public.service_related_faqs (faq_id);

create table public.blog_post_related_services (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  blog_post_id uuid not null references public.blog_posts (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  position integer not null default 0,
  primary key (blog_post_id, service_id)
);
create index blog_post_related_services_tenant_id_idx on public.blog_post_related_services (tenant_id);
create index blog_post_related_services_service_id_idx on public.blog_post_related_services (service_id);

create table public.blog_post_related_posts (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  blog_post_id uuid not null references public.blog_posts (id) on delete cascade,
  related_post_id uuid not null references public.blog_posts (id) on delete cascade,
  position integer not null default 0,
  primary key (blog_post_id, related_post_id),
  check (blog_post_id <> related_post_id)
);
create index blog_post_related_posts_tenant_id_idx on public.blog_post_related_posts (tenant_id);
create index blog_post_related_posts_related_post_id_idx on public.blog_post_related_posts (related_post_id);

create table public.page_featured_team_members (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  page_id uuid not null references public.pages (id) on delete cascade,
  team_member_id uuid not null references public.team_members (id) on delete cascade,
  position integer not null default 0,
  primary key (page_id, team_member_id)
);
create index page_featured_team_members_tenant_id_idx on public.page_featured_team_members (tenant_id);
create index page_featured_team_members_team_member_id_idx on public.page_featured_team_members (team_member_id);
