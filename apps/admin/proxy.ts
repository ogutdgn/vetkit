import { type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

// Next 16 proxy (the renamed middleware). Runs on every matched request to
// refresh the Supabase session and gate unauthenticated access.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
