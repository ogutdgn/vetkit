-- vetkit R1 — base + tenancy + identity + RLS helpers.
-- Implements: project-documentation/specs/2026-06-14-supabase-data-model.md (§2 tenancy)
--             + the R1 research brief (security-definer helpers, search_path hardening).
-- Shared single Supabase project; every content row is isolated by tenant_id + RLS.

-- ---------------------------------------------------------------------------
-- Private schema for security-definer helpers. NOT exposed via the Data API
-- (PostgREST only serves `public`), so functions here never become RPC endpoints.
-- ---------------------------------------------------------------------------
create schema if not exists private;

-- Generic updated_at trigger (invoker; empty search_path satisfies the
-- function_search_path_mutable advisor — now() lives in pg_catalog, always in path).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- tenants — one row per clinic. `slug` is the build-time TENANT binding for
-- the public site; FKs cascade so deleting a tenant removes all its content.
-- ---------------------------------------------------------------------------
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  primary_domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger tenants_set_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

-- profiles — app-readable mirror of auth.users (display name for the admin UI).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- memberships — a clinic user belongs to one (or more) tenants with a role.
-- Phase 1: clinic users are single-tenant in practice; the model is multi-tenant-safe.
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);
create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_tenant_id_idx on public.memberships (tenant_id);

-- platform_admins — super-admins; see/manage every tenant (the admin tenant switcher).
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS helpers (security definer). They read tables that THEMSELVES have RLS;
-- a policy querying those tables directly would recurse (42P17). Running as the
-- definer (owner) bypasses the inner RLS — the standard escape hatch.
-- `set search_path = ''` + fully-qualified names close the privilege-escalation
-- hole. Wrap calls as `(select private.fn())` in policies for per-statement eval.
-- ---------------------------------------------------------------------------
create or replace function private.auth_tenant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.tenant_id
  from public.memberships m
  where m.user_id = (select auth.uid())
$$;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = (select auth.uid())
  )
$$;

-- The querying roles need schema USAGE to reference the helpers inside policies.
-- (EXECUTE is granted to PUBLIC by default on function creation.) USAGE on
-- `private` does NOT expose anything via PostgREST (it serves `public` only).
grant usage on schema private to anon, authenticated;
grant execute on function private.auth_tenant_ids() to anon, authenticated;
grant execute on function private.is_platform_admin() to anon, authenticated;

-- Auto-provision a profiles row when an auth user is created, so the mirror
-- stays in sync without app code (the admin UI reads display names from it).
-- security definer (empty search_path) is required to write public.profiles
-- from the auth.users trigger context. A trigger-returning function is not
-- exposed by PostgREST, so living in public is safe.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
