import { cookies } from 'next/headers';
import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';

export const ACTIVE_TENANT_COOKIE = 'vetkit_active_tenant';

export interface TenantRef {
  id: string;
  name: string;
  slug: string;
}

export interface Actor {
  userId: string;
  email: string | null;
  fullName: string | null;
  isSuperAdmin: boolean;
  /** The tenant whose content this session is currently acting on. */
  activeTenant: TenantRef | null;
  /** Tenants the actor may act on — all of them for a super-admin. */
  availableTenants: TenantRef[];
}

/**
 * Resolve the signed-in actor from the verified JWT claims + RLS-scoped lookups.
 * Cached per request so the protected layout and the page share one resolution.
 * Returns null when there is no valid session.
 */
export const getActor = cache(async (): Promise<Actor | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const userId = claims.sub;
  const email = typeof claims.email === 'string' ? claims.email : null;

  const [adminRes, membershipsRes, profileRes] = await Promise.all([
    supabase.from('platform_admins').select('user_id').maybeSingle(),
    supabase.from('memberships').select('tenant_id, role'),
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
  ]);

  const isSuperAdmin = Boolean(adminRes.data);
  const fullName = profileRes.data?.full_name ?? null;

  // Super-admin may act on every tenant; a clinic user only on its memberships.
  // RLS enforces this too, but resolving the list drives the tenant switcher.
  let availableTenants: TenantRef[] = [];
  if (isSuperAdmin) {
    const { data: tenants } = await supabase.from('tenants').select('id, name, slug').order('name');
    availableTenants = tenants ?? [];
  } else {
    const ids = (membershipsRes.data ?? []).map((m) => m.tenant_id);
    if (ids.length > 0) {
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .in('id', ids)
        .order('name');
      availableTenants = tenants ?? [];
    }
  }

  const cookieStore = await cookies();
  const wanted = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;
  const activeTenant = availableTenants.find((t) => t.id === wanted) ?? availableTenants[0] ?? null;

  return { userId, email, fullName, isSuperAdmin, activeTenant, availableTenants };
});
