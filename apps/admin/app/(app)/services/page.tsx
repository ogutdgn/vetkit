import Link from 'next/link';

import { getTenantContext } from '@/lib/tenant-db';

const LOCATION_LABELS: Record<string, string> = {
  'in-clinic': 'Klinikte',
  'home-call': 'Evde',
  both: 'Her ikisi',
};

function StatusBadge({ status }: { status: string }) {
  const published = status === 'published';
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {published ? 'Yayında' : 'Taslak'}
    </span>
  );
}

export default async function ServicesPage() {
  const { supabase, tenant } = await getTenantContext();
  const { data: services, error } = await supabase
    .from('services')
    .select('id, title, slug, status, service_location, sort_order')
    .eq('tenant_id', tenant.id)
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Hizmetler</h1>
          <p className="text-sm text-slate-500">{tenant.name}</p>
        </div>
        <Link
          href="/services/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Yeni hizmet
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-red-600">Yüklenemedi: {error.message}</p>
      ) : !services || services.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Henüz hizmet eklenmemiş. “Yeni hizmet” ile başlayın.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 font-medium">Başlık</th>
              <th className="py-2 font-medium">Durum</th>
              <th className="py-2 font-medium">Yer</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3">
                  <Link
                    href={`/services/${s.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {s.title}
                  </Link>
                  <span className="ml-2 text-xs text-slate-400">/{s.slug}</span>
                </td>
                <td className="py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="py-3 text-slate-600">
                  {LOCATION_LABELS[s.service_location] ?? s.service_location}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/services/${s.id}`}
                    className="text-sm text-slate-500 hover:text-slate-900"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
