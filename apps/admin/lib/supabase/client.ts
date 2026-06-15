import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@vetkit/db/types';

// Browser client (Client Components). Low-privilege publishable key — RLS is the
// access boundary. Don't hold this in a module global; create per use.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
