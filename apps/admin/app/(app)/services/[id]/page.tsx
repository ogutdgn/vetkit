import { notFound } from 'next/navigation';

import { deleteService } from '../actions';
import { ServiceForm } from '../service-form';
import type { ServiceFormInput } from '../schema';
import { getTenantContext } from '@/lib/tenant-db';

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, tenant } = await getTenantContext();

  const { data: s } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenant.id)
    .maybeSingle();
  if (!s) notFound();

  let initialImageUrl: string | null = null;
  if (s.main_image_media_id) {
    const { data: m } = await supabase
      .from('media')
      .select('bucket_path')
      .eq('id', s.main_image_media_id)
      .maybeSingle();
    if (m) {
      initialImageUrl = supabase.storage.from('media').getPublicUrl(m.bucket_path).data.publicUrl;
    }
  }

  const defaults: ServiceFormInput = {
    title: s.title,
    slug: s.slug,
    shortDescription: s.short_description ?? '',
    description: s.description,
    petTypes: s.pet_types,
    serviceLocation: s.service_location as ServiceFormInput['serviceLocation'],
    emergencyAvailable: s.emergency_available,
    pricing: s.pricing ?? '',
    metaTitle: s.meta_title ?? '',
    metaDescription: s.meta_description ?? '',
    noIndex: s.no_index,
    status: s.status as ServiceFormInput['status'],
    mainImageMediaId: s.main_image_media_id,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Hizmeti düzenle</h1>
        <form action={deleteService.bind(null, id)}>
          <button
            type="submit"
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Sil
          </button>
        </form>
      </div>
      <ServiceForm id={id} defaults={defaults} initialImageUrl={initialImageUrl} />
    </div>
  );
}
