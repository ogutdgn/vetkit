import type { ReactNode } from 'react';

import { signOut, switchTenant } from '@/app/(app)/actions';
import { SidebarNav } from '@/components/sidebar-nav';
import type { Actor } from '@/lib/auth';

export function AdminShell({ actor, children }: { actor: Actor; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-900">vetkit yönetim</span>
            {actor.isSuperAdmin ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                süper yönetici
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {actor.availableTenants.length > 1 ? (
              <form action={switchTenant} className="flex items-center gap-2">
                <label htmlFor="tenantId" className="sr-only">
                  Klinik seç
                </label>
                <select
                  id="tenantId"
                  name="tenantId"
                  defaultValue={actor.activeTenant?.id ?? ''}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  {actor.availableTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Değiştir
                </button>
              </form>
            ) : actor.activeTenant ? (
              <span className="text-sm text-slate-600">{actor.activeTenant.name}</span>
            ) : null}

            <span className="text-sm text-slate-500">{actor.fullName ?? actor.email}</span>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="w-44 shrink-0">
          <SidebarNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
