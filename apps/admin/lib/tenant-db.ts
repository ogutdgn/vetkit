import { redirect } from 'next/navigation';

import { getActor, type Actor, type TenantRef } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export interface TenantContext {
  supabase: ServerClient;
  actor: Actor;
  /** The tenant whose content the session is acting on. */
  tenant: TenantRef;
}

/**
 * Server-side context for content pages/actions: the cookie-bound Supabase
 * client + the resolved actor + the active tenant. Redirects to /login when
 * there is no session, or to the dashboard when the actor has no tenant to act
 * on. Writes are scoped by `tenant.id`; RLS enforces it regardless.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!actor.activeTenant) redirect('/');
  const supabase = await createClient();
  return { supabase, actor, tenant: actor.activeTenant };
}
