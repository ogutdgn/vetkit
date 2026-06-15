'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ACTIVE_TENANT_COOKIE, getActor } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function switchTenant(formData: FormData): Promise<void> {
  const tenantIdRaw = formData.get('tenantId');
  const tenantId = typeof tenantIdRaw === 'string' ? tenantIdRaw : '';

  // Only allow switching to a tenant the actor may act on (RLS-backed list).
  const actor = await getActor();
  const allowed = actor?.availableTenants.some((t) => t.id === tenantId);
  if (!allowed) {
    redirect('/');
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect('/');
}
