-- vetkit R1 — cross-tenant RLS leak test (the gating safety net for the shared DB).
-- Proves: a clinic user reads/writes ONLY its tenant (read, insert, update);
-- anon reads only published rows, can submit a lead but cannot read leads or
-- write content; a platform admin sees & writes every tenant; an authenticated
-- non-member sees nothing.
--
-- Runner: `supabase test db` (pgTAP, single rolled-back transaction). Requires
-- the basejump test helpers in the test DB — see the full bootstrap chain in
-- packages/db/README.md ("Run the leak test"). create extension only works once
-- the dbdev / supabase-dbdev / basejump packages are installed.
create extension if not exists "basejump-supabase_test_helpers";

begin;
select plan(16);

-- RLS is enabled on EVERY table in public (schema-wide; catches a future table
-- shipped without `enable row level security`).
select tests.rls_enabled('public');

-- ---------------------------------------------------------------------------
-- Seed as the superuser test role (BYPASSRLS) so we can plant both tenants.
-- ---------------------------------------------------------------------------
insert into public.tenants (id, slug, name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tenant-a', 'Tenant A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'tenant-b', 'Tenant B');

select tests.create_supabase_user('a-owner@test.com');
select tests.create_supabase_user('super@test.com');
select tests.create_supabase_user('nobody@test.com');

insert into public.memberships (user_id, tenant_id, role)
values (tests.get_supabase_uid('a-owner@test.com'),
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner');

insert into public.platform_admins (user_id)
values (tests.get_supabase_uid('super@test.com'));

-- Tenant A: one published + one draft service. Tenant B: one published service + a faq + a junction.
insert into public.services (tenant_id, title, slug, status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A Published', 'a-published', 'published'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A Draft',     'a-draft',     'draft');
insert into public.services (id, tenant_id, title, slug, status) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B Published', 'b-published', 'published');
insert into public.faqs (id, tenant_id, question, status) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B FAQ?', 'published');
insert into public.service_related_faqs (tenant_id, service_id, faq_id) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'dddddddd-dddd-dddd-dddd-dddddddddddd');

insert into public.submissions (tenant_id, name, message)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Lead B', 'merhaba');

-- ===========================================================================
-- (A) Tenant A clinic user — scoped to tenant A only.
-- ===========================================================================
select tests.authenticate_as('a-owner@test.com');

select results_eq(
  $$ select count(*) from public.services where tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  array[2::bigint],
  'A user sees both of tenant A''s services (incl. the draft)'
);
select results_eq(
  $$ select count(*) from public.services where tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  array[0::bigint],
  'A user sees ZERO of tenant B''s services (cross-tenant READ leak)'
);
select throws_ok(
  $$ insert into public.services (tenant_id, title, slug)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Injected', 'injected-b') $$,
  '42501', null,
  'A user CANNOT insert into tenant B (cross-tenant INSERT leak)'
);
select results_eq(
  $$ with u as (
       update public.services set title = 'hijacked'
       where tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' returning 1
     ) select count(*) from u $$,
  array[0::bigint],
  'A user''s UPDATE of tenant B services affects 0 rows (cross-tenant UPDATE leak)'
);
select results_eq(
  $$ select count(*) from public.submissions where tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  array[0::bigint],
  'A user sees ZERO of tenant B''s submissions'
);
select results_eq(
  $$ select count(*) from public.service_related_faqs where tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  array[0::bigint],
  'A user sees ZERO of tenant B''s junction rows'
);

-- ===========================================================================
-- (B) Anonymous public visitor.
-- ===========================================================================
select tests.clear_authentication();

select results_eq(
  $$ select count(*) from public.services where status <> 'published' $$,
  array[0::bigint],
  'anon sees zero non-published services'
);
select results_eq(
  $$ select count(*) from public.services $$,
  array[2::bigint],
  'anon sees exactly the 2 published services (published-only at the DB layer)'
);
-- anon has no SELECT grant on submissions, so the grant check raises 42501
-- BEFORE RLS — assert the throw, not emptiness.
select throws_ok(
  $$ select 1 from public.submissions $$,
  '42501', null,
  'anon cannot read any submissions (no select grant)'
);
select throws_ok(
  $$ insert into public.services (tenant_id, title, slug)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Anon Inject', 'anon-x') $$,
  '42501', null,
  'anon cannot write content tables'
);
select lives_ok(
  $$ insert into public.submissions (tenant_id, name, message)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lead A', 'merhaba') $$,
  'anon CAN submit a lead (the public contact-form path works)'
);
select throws_ok(
  $$ insert into public.submissions (name, message) values ('Orphan', 'x') $$,
  '23502', null,
  'anon cannot submit a lead without a tenant_id'
);

-- ===========================================================================
-- (C) Platform admin — sees and writes every tenant.
-- ===========================================================================
select tests.authenticate_as('super@test.com');

select results_eq(
  $$ select count(distinct tenant_id) from public.services $$,
  array[2::bigint],
  'platform admin sees services across both tenants'
);
select lives_ok(
  $$ insert into public.services (tenant_id, title, slug, status)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Admin In B', 'admin-b', 'published') $$,
  'platform admin can write into any tenant'
);

-- ===========================================================================
-- (D) Authenticated user with NO membership — sees nothing (isolates the
-- member predicate from is_platform_admin / anon).
-- ===========================================================================
select tests.authenticate_as('nobody@test.com');
select is_empty(
  $$ select 1 from public.services $$,
  'an authenticated non-member sees zero services'
);

select * from finish();
rollback;
