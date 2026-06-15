import { getTenantContext } from '@/lib/tenant-db';

import { ServiceForm } from '../service-form';
import type { ServiceFormInput } from '../schema';

const EMPTY: ServiceFormInput = {
  title: '',
  slug: '',
  shortDescription: '',
  description: null,
  petTypes: [],
  serviceLocation: 'in-clinic',
  emergencyAvailable: false,
  pricing: '',
  metaTitle: '',
  metaDescription: '',
  noIndex: false,
  status: 'draft',
  mainImageMediaId: null,
};

export default async function NewServicePage() {
  await getTenantContext(); // gate + ensure an active tenant
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">Yeni hizmet</h1>
      <ServiceForm id={null} defaults={EMPTY} initialImageUrl={null} />
    </div>
  );
}
