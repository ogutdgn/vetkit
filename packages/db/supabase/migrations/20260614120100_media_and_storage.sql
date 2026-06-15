-- vetkit R1 — media table + public Storage bucket.
-- Replaces Sanity assets + hotspot: images are rows in `media` (alt/dims/focal)
-- whose `bucket_path` points at an object in the public `media` Storage bucket.
-- Storage RLS policies live in the RLS-and-grants migration alongside table policies.

create table public.media (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  bucket_path text not null,
  alt text,
  width integer,
  height integer,
  mime text,
  -- hotspot replacement: applied client-side as CSS object-position
  -- (Storage transforms are resize-only — no art-direction crop).
  focal_x real,
  focal_y real,
  created_at timestamptz not null default now()
);
create index media_tenant_id_idx on public.media (tenant_id);

-- One public-read bucket; objects are namespaced by tenant: media/<tenantId>/<...>.
-- Public buckets are read-open; writes are denied until granted by the storage
-- policies (RLS migration). Storage metadata lives in Postgres, so this is
-- migration-safe (the config.toml seed path is dev-only).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
