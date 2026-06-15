import { getActor } from '@/lib/auth';

export default async function DashboardPage() {
  // Cached within the request — shares the layout's resolution.
  const actor = await getActor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Hoş geldiniz</h1>
        <p className="mt-1 text-sm text-slate-500">
          {actor?.isSuperAdmin
            ? 'Tüm kliniklerin içeriğini buradan yönetebilirsiniz.'
            : 'Kliniğinizin içeriğini buradan yönetebilirsiniz.'}
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Aktif klinik
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">
            {actor?.activeTenant?.name ?? '—'}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Rol</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">
            {actor?.isSuperAdmin ? 'Süper yönetici' : 'Klinik kullanıcısı'}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Erişim</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">
            {actor?.availableTenants.length ?? 0} klinik
          </dd>
        </div>
      </dl>

      <p className="text-sm text-slate-400">İçerik yönetimi (R3) yakında.</p>
    </div>
  );
}
