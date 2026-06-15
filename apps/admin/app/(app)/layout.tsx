import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { TenantSwitcher } from '@/components/tenant-switcher';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from '@/components/user-menu';
import { getActor } from '@/lib/auth';

// The proxy gates unauthenticated requests; this re-checks server-side and
// resolves the actor for the shell.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const actor = await getActor();
  if (!actor) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <TenantSwitcher
            tenants={actor.availableTenants}
            active={actor.activeTenant}
            isSuper={actor.isSuperAdmin}
          />
          <UserMenu
            name={actor.fullName ?? actor.email ?? 'Kullanıcı'}
            isSuper={actor.isSuperAdmin}
          />
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
