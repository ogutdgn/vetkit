import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminShell } from '@/components/admin-shell';
import { getActor } from '@/lib/auth';

// The proxy already gates unauthenticated requests; this re-checks server-side
// (defense in depth) and resolves the actor for the shell + pages.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const actor = await getActor();
  if (!actor) {
    redirect('/login');
  }
  return <AdminShell actor={actor}>{children}</AdminShell>;
}
