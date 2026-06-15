// Typed Supabase client factories. R1 ships the two non-session clients:
//   - createAnonClient(): low-privilege, RLS-enforced (public site + browser-safe).
//   - createServiceRoleClient(): SERVER ONLY, bypasses RLS (seeding, webhooks).
// The cookie-bound @supabase/ssr server/browser clients (admin auth, R2) build
// on these conventions but live in apps/admin, not here.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[@vetkit/db] Missing required environment variable: ${name}`);
  }
  return value;
}

export type VetkitClient = SupabaseClient<Database>;

/**
 * Low-privilege client using the publishable (legacy: anon) key. Safe to ship to
 * the browser — Row-Level Security is the access boundary, not the key.
 */
export function createAnonClient(): VetkitClient {
  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  );
}

/**
 * Service-role client. SERVER ONLY — it bypasses RLS entirely. Never import this
 * into client/browser code or expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 */
export function createServiceRoleClient(): VetkitClient {
  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
