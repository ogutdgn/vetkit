// Bootstrap the FIRST platform super-admin + the client tenants. The RLS write
// policies require an existing platform_admin, so this cold-start insert can
// only run with the service-role key (which bypasses RLS). Idempotent.
//
// Usage (from packages/db, with apps/web/.env.local loaded into the env):
//   SUPER_ADMIN_EMAIL=you@example.com SUPER_ADMIN_PASSWORD=... node scripts/bootstrap-superadmin.mjs
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SUPER_ADMIN_EMAIL;
const password = process.env.SUPER_ADMIN_PASSWORD;
const fullName = process.env.SUPER_ADMIN_NAME || 'Süper Yönetici';

if (!URL || !SERVICE || !email || !password) {
  console.error(
    'Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD',
  );
  process.exit(1);
}

const svc = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TENANTS = [
  { slug: 'gigi', name: 'Gigi Veteriner' },
  { slug: 'ovapark', name: 'Ovapark Veteriner' },
];

async function main() {
  const { error: tErr } = await svc.from('tenants').upsert(TENANTS, { onConflict: 'slug' });
  if (tErr) throw tErr;
  console.log(`tenants ensured: ${TENANTS.map((t) => t.slug).join(', ')}`);

  const { data: list, error: lErr } = await svc.auth.admin.listUsers({ perPage: 1000 });
  if (lErr) throw lErr;

  let userId;
  const existing = list.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  if (existing) {
    userId = existing.id;
    const { error } = await svc.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    console.log(`super-admin user updated: ${email}`);
  } else {
    const { data: created, error } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    userId = created.user.id;
    console.log(`super-admin user created: ${email}`);
  }

  const { error: paErr } = await svc
    .from('platform_admins')
    .upsert({ user_id: userId }, { onConflict: 'user_id' });
  if (paErr) throw paErr;

  await svc.from('profiles').upsert({ id: userId, full_name: fullName }, { onConflict: 'id' });

  console.log(`\nDONE — ${email} is a platform super-admin (user ${userId}).`);
}

main().catch((e) => {
  console.error('FAILED:', e.message || e);
  process.exit(1);
});
