-- vetkit R1 — Row-Level Security + GRANTs (the load-bearing security layer).
-- Pattern (per the R1 research brief §2):
--   * RLS enabled on every table -> deny-by-default.
--   * Separate policy PER operation, each with an explicit `to <role>` clause.
--   * anon (public site): SELECT published-only (or true for always-live config).
--   * authenticated (admin): full CRUD where the row's tenant is one the user
--     belongs to, OR the user is a platform admin.
--   * Helper calls wrapped as `(select private.fn())` -> evaluated once per
--     statement (initPlan), not per row.
--   * GRANTs are explicit because the project has "auto-expose new tables" OFF.

grant usage on schema public to anon, authenticated;

-- ===========================================================================
-- Standard content tables: anon reads PUBLISHED rows; members/admins do CRUD.
-- ===========================================================================

-- services -------------------------------------------------------------------
alter table public.services enable row level security;
create policy services_anon_read_published on public.services
  for select to anon using (status = 'published');
create policy services_member_select on public.services
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy services_member_insert on public.services
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy services_member_update on public.services
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy services_member_delete on public.services
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;

-- blog_posts -----------------------------------------------------------------
alter table public.blog_posts enable row level security;
create policy blog_posts_anon_read_published on public.blog_posts
  for select to anon using (status = 'published');
create policy blog_posts_member_select on public.blog_posts
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy blog_posts_member_insert on public.blog_posts
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy blog_posts_member_update on public.blog_posts
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy blog_posts_member_delete on public.blog_posts
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;

-- team_members ---------------------------------------------------------------
alter table public.team_members enable row level security;
create policy team_members_anon_read_published on public.team_members
  for select to anon using (status = 'published');
create policy team_members_member_select on public.team_members
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy team_members_member_insert on public.team_members
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy team_members_member_update on public.team_members
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy team_members_member_delete on public.team_members
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.team_members to anon;
grant select, insert, update, delete on public.team_members to authenticated;

-- faqs -----------------------------------------------------------------------
alter table public.faqs enable row level security;
create policy faqs_anon_read_published on public.faqs
  for select to anon using (status = 'published');
create policy faqs_member_select on public.faqs
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy faqs_member_insert on public.faqs
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy faqs_member_update on public.faqs
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy faqs_member_delete on public.faqs
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.faqs to anon;
grant select, insert, update, delete on public.faqs to authenticated;

-- gallery_images -------------------------------------------------------------
alter table public.gallery_images enable row level security;
create policy gallery_images_anon_read_published on public.gallery_images
  for select to anon using (status = 'published');
create policy gallery_images_member_select on public.gallery_images
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy gallery_images_member_insert on public.gallery_images
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy gallery_images_member_update on public.gallery_images
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy gallery_images_member_delete on public.gallery_images
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.gallery_images to anon;
grant select, insert, update, delete on public.gallery_images to authenticated;

-- pages ----------------------------------------------------------------------
alter table public.pages enable row level security;
create policy pages_anon_read_published on public.pages
  for select to anon using (status = 'published');
create policy pages_member_select on public.pages
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy pages_member_insert on public.pages
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy pages_member_update on public.pages
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy pages_member_delete on public.pages
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.pages to anon;
grant select, insert, update, delete on public.pages to authenticated;

-- testimonials ---------------------------------------------------------------
alter table public.testimonials enable row level security;
create policy testimonials_anon_read_published on public.testimonials
  for select to anon using (status = 'published');
create policy testimonials_member_select on public.testimonials
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy testimonials_member_insert on public.testimonials
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy testimonials_member_update on public.testimonials
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy testimonials_member_delete on public.testimonials
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;

-- ===========================================================================
-- Always-live config: anon reads ALL rows (no draft state); members/admins CRUD.
-- ===========================================================================

-- site_settings (singleton per tenant) --------------------------------------
alter table public.site_settings enable row level security;
create policy site_settings_anon_read on public.site_settings
  for select to anon using (true);
create policy site_settings_member_select on public.site_settings
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy site_settings_member_insert on public.site_settings
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy site_settings_member_update on public.site_settings
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy site_settings_member_delete on public.site_settings
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;

-- hero_slides ----------------------------------------------------------------
alter table public.hero_slides enable row level security;
create policy hero_slides_anon_read on public.hero_slides
  for select to anon using (true);
create policy hero_slides_member_select on public.hero_slides
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy hero_slides_member_insert on public.hero_slides
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy hero_slides_member_update on public.hero_slides
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy hero_slides_member_delete on public.hero_slides
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.hero_slides to anon;
grant select, insert, update, delete on public.hero_slides to authenticated;

-- media (public marketing images) --------------------------------------------
alter table public.media enable row level security;
create policy media_anon_read on public.media
  for select to anon using (true);
create policy media_member_select on public.media
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy media_member_insert on public.media
  for insert to authenticated
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy media_member_update on public.media
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy media_member_delete on public.media
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.media to anon;
grant select, insert, update, delete on public.media to authenticated;

-- ===========================================================================
-- submissions (leads): anon INSERTs (the public form), never anon SELECT.
-- ===========================================================================
alter table public.submissions enable row level security;
alter table public.submissions force row level security;
create policy submissions_anon_insert on public.submissions
  for insert to anon with check (tenant_id is not null);
create policy submissions_member_select on public.submissions
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy submissions_member_update on public.submissions
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy submissions_member_delete on public.submissions
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant insert on public.submissions to anon;
grant select, update, delete on public.submissions to authenticated;

-- ===========================================================================
-- Junctions: anon reads rows whose OWNING parent is published; members/admins
-- CRUD by the denormalized tenant_id.
-- ===========================================================================

-- service_related_faqs (parent: service, child: faq) -------------------------
alter table public.service_related_faqs enable row level security;
-- anon: visible only when BOTH the owning service and the referenced faq are published.
create policy service_related_faqs_anon_read on public.service_related_faqs
  for select to anon
  using (
    exists (select 1 from public.services s where s.id = service_related_faqs.service_id and s.status = 'published')
    and exists (select 1 from public.faqs f where f.id = service_related_faqs.faq_id and f.status = 'published')
  );
create policy service_related_faqs_member_select on public.service_related_faqs
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
-- member writes: tenant_id must be the user's AND both referenced rows must live in that same tenant
-- (RLS backstops the app's "tenant_id equals both parents" invariant — no cross-tenant wiring).
create policy service_related_faqs_member_insert on public.service_related_faqs
  for insert to authenticated
  with check (
    (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
    and exists (select 1 from public.services s where s.id = service_related_faqs.service_id and s.tenant_id = service_related_faqs.tenant_id)
    and exists (select 1 from public.faqs f where f.id = service_related_faqs.faq_id and f.tenant_id = service_related_faqs.tenant_id)
  );
create policy service_related_faqs_member_update on public.service_related_faqs
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (
    (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
    and exists (select 1 from public.services s where s.id = service_related_faqs.service_id and s.tenant_id = service_related_faqs.tenant_id)
    and exists (select 1 from public.faqs f where f.id = service_related_faqs.faq_id and f.tenant_id = service_related_faqs.tenant_id)
  );
create policy service_related_faqs_member_delete on public.service_related_faqs
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.service_related_faqs to anon;
grant select, insert, update, delete on public.service_related_faqs to authenticated;

-- blog_post_related_services (parent: blog_post, child: service) -------------
alter table public.blog_post_related_services enable row level security;
create policy blog_post_related_services_anon_read on public.blog_post_related_services
  for select to anon
  using (
    exists (select 1 from public.blog_posts b where b.id = blog_post_related_services.blog_post_id and b.status = 'published')
    and exists (select 1 from public.services s where s.id = blog_post_related_services.service_id and s.status = 'published')
  );
create policy blog_post_related_services_member_select on public.blog_post_related_services
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy blog_post_related_services_member_insert on public.blog_post_related_services
  for insert to authenticated
  with check (
    (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
    and exists (select 1 from public.blog_posts b where b.id = blog_post_related_services.blog_post_id and b.tenant_id = blog_post_related_services.tenant_id)
    and exists (select 1 from public.services s where s.id = blog_post_related_services.service_id and s.tenant_id = blog_post_related_services.tenant_id)
  );
create policy blog_post_related_services_member_update on public.blog_post_related_services
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (
    (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
    and exists (select 1 from public.blog_posts b where b.id = blog_post_related_services.blog_post_id and b.tenant_id = blog_post_related_services.tenant_id)
    and exists (select 1 from public.services s where s.id = blog_post_related_services.service_id and s.tenant_id = blog_post_related_services.tenant_id)
  );
create policy blog_post_related_services_member_delete on public.blog_post_related_services
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.blog_post_related_services to anon;
grant select, insert, update, delete on public.blog_post_related_services to authenticated;

-- blog_post_related_posts (parent: blog_post_id, child: related_post_id) -----
alter table public.blog_post_related_posts enable row level security;
create policy blog_post_related_posts_anon_read on public.blog_post_related_posts
  for select to anon
  using (
    exists (select 1 from public.blog_posts b where b.id = blog_post_related_posts.blog_post_id and b.status = 'published')
    and exists (select 1 from public.blog_posts r where r.id = blog_post_related_posts.related_post_id and r.status = 'published')
  );
create policy blog_post_related_posts_member_select on public.blog_post_related_posts
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy blog_post_related_posts_member_insert on public.blog_post_related_posts
  for insert to authenticated
  with check (
    (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
    and exists (select 1 from public.blog_posts b where b.id = blog_post_related_posts.blog_post_id and b.tenant_id = blog_post_related_posts.tenant_id)
    and exists (select 1 from public.blog_posts r where r.id = blog_post_related_posts.related_post_id and r.tenant_id = blog_post_related_posts.tenant_id)
  );
create policy blog_post_related_posts_member_update on public.blog_post_related_posts
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (
    (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
    and exists (select 1 from public.blog_posts b where b.id = blog_post_related_posts.blog_post_id and b.tenant_id = blog_post_related_posts.tenant_id)
    and exists (select 1 from public.blog_posts r where r.id = blog_post_related_posts.related_post_id and r.tenant_id = blog_post_related_posts.tenant_id)
  );
create policy blog_post_related_posts_member_delete on public.blog_post_related_posts
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.blog_post_related_posts to anon;
grant select, insert, update, delete on public.blog_post_related_posts to authenticated;

-- page_featured_team_members (parent: page, child: team_member) --------------
alter table public.page_featured_team_members enable row level security;
create policy page_featured_team_members_anon_read on public.page_featured_team_members
  for select to anon
  using (
    exists (select 1 from public.pages p where p.id = page_featured_team_members.page_id and p.status = 'published')
    and exists (select 1 from public.team_members tm where tm.id = page_featured_team_members.team_member_id and tm.status = 'published')
  );
create policy page_featured_team_members_member_select on public.page_featured_team_members
  for select to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy page_featured_team_members_member_insert on public.page_featured_team_members
  for insert to authenticated
  with check (
    (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
    and exists (select 1 from public.pages p where p.id = page_featured_team_members.page_id and p.tenant_id = page_featured_team_members.tenant_id)
    and exists (select 1 from public.team_members tm where tm.id = page_featured_team_members.team_member_id and tm.tenant_id = page_featured_team_members.tenant_id)
  );
create policy page_featured_team_members_member_update on public.page_featured_team_members
  for update to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
  with check (
    (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()))
    and exists (select 1 from public.pages p where p.id = page_featured_team_members.page_id and p.tenant_id = page_featured_team_members.tenant_id)
    and exists (select 1 from public.team_members tm where tm.id = page_featured_team_members.team_member_id and tm.tenant_id = page_featured_team_members.tenant_id)
  );
create policy page_featured_team_members_member_delete on public.page_featured_team_members
  for delete to authenticated
  using (tenant_id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
grant select on public.page_featured_team_members to anon;
grant select, insert, update, delete on public.page_featured_team_members to authenticated;

-- ===========================================================================
-- Identity tables: members see their own scope; platform admins manage all.
-- No anon access at all.
-- ===========================================================================

-- tenants --------------------------------------------------------------------
alter table public.tenants enable row level security;
create policy tenants_member_select on public.tenants
  for select to authenticated
  using (id in (select private.auth_tenant_ids()) or (select private.is_platform_admin()));
create policy tenants_admin_insert on public.tenants
  for insert to authenticated with check ((select private.is_platform_admin()));
create policy tenants_admin_update on public.tenants
  for update to authenticated
  using ((select private.is_platform_admin()))
  with check ((select private.is_platform_admin()));
create policy tenants_admin_delete on public.tenants
  for delete to authenticated using ((select private.is_platform_admin()));
grant select, insert, update, delete on public.tenants to authenticated;

-- memberships ----------------------------------------------------------------
alter table public.memberships enable row level security;
alter table public.memberships force row level security;
create policy memberships_self_or_admin_select on public.memberships
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_platform_admin()));
create policy memberships_admin_insert on public.memberships
  for insert to authenticated with check ((select private.is_platform_admin()));
create policy memberships_admin_update on public.memberships
  for update to authenticated
  using ((select private.is_platform_admin()))
  with check ((select private.is_platform_admin()));
create policy memberships_admin_delete on public.memberships
  for delete to authenticated using ((select private.is_platform_admin()));
grant select, insert, update, delete on public.memberships to authenticated;

-- platform_admins ------------------------------------------------------------
alter table public.platform_admins enable row level security;
alter table public.platform_admins force row level security;
create policy platform_admins_self_or_admin_select on public.platform_admins
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_platform_admin()));
create policy platform_admins_admin_insert on public.platform_admins
  for insert to authenticated with check ((select private.is_platform_admin()));
create policy platform_admins_admin_delete on public.platform_admins
  for delete to authenticated using ((select private.is_platform_admin()));
grant select, insert, delete on public.platform_admins to authenticated;

-- profiles -------------------------------------------------------------------
alter table public.profiles enable row level security;
create policy profiles_self_or_admin_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_platform_admin()));
create policy profiles_self_insert on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
grant select, insert, update on public.profiles to authenticated;

-- ===========================================================================
-- Storage: public bucket `media`. Public-URL downloads are open (public bucket
-- flag), but list() goes through storage.objects SELECT RLS — so the admin
-- media library needs an explicit authenticated SELECT policy, tenant-scoped by
-- the first path segment. Writes are likewise scoped by that segment.
-- (Read isolation for downloads depends on bucket.public=true — never put
-- anything sensitive in this bucket.)
-- ===========================================================================
create policy media_objects_member_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media'
    and (
      (select private.is_platform_admin())
      or (storage.foldername(name))[1] in (
        select t.id::text from public.tenants t
        where t.id in (select private.auth_tenant_ids())
      )
    )
  );
create policy media_objects_member_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (
      (select private.is_platform_admin())
      or (storage.foldername(name))[1] in (
        select t.id::text from public.tenants t
        where t.id in (select private.auth_tenant_ids())
      )
    )
  );
create policy media_objects_member_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media'
    and (
      (select private.is_platform_admin())
      or (storage.foldername(name))[1] in (
        select t.id::text from public.tenants t
        where t.id in (select private.auth_tenant_ids())
      )
    )
  );
create policy media_objects_member_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and (
      (select private.is_platform_admin())
      or (storage.foldername(name))[1] in (
        select t.id::text from public.tenants t
        where t.id in (select private.auth_tenant_ids())
      )
    )
  );

-- ===========================================================================
-- service_role grants. "Auto-expose new tables" is OFF, which ALSO withholds
-- service_role's automatic grants. service_role is NOT a superuser — it only
-- carries BYPASSRLS, so it still needs table privileges + schema usage to reach
-- anything. Server-only paths that depend on this: the contact-form submissions
-- insert (R6), admin provisioning, and bootstrapping the FIRST platform_admin
-- (the RLS write policies require an existing admin, so the cold-start insert
-- can only come from the service-role key).
-- ===========================================================================
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage on schema private to service_role;
grant execute on function private.auth_tenant_ids() to service_role;
grant execute on function private.is_platform_admin() to service_role;

-- NOTE (residual, accepted for R1): submissions_anon_insert lets the anon role
-- write a lead into ANY tenant by setting tenant_id (the FK only guarantees the
-- tenant exists). Pure SQL RLS can't know which site the request came from.
-- R6 should move the contact form to a server route using the service-role key
-- (set tenant_id from the build's TENANT_ID) and then DROP the anon insert here.
