'use server';

import type { Json } from '@vetkit/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { turkishSlugify } from '@/lib/slug';
import { getTenantContext } from '@/lib/tenant-db';

import { serviceFormSchema } from './schema';

export interface ActionState {
  ok: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
}

export async function upsertService(id: string | null, input: unknown): Promise<ActionState> {
  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, tenant } = await getTenantContext();
  const v = parsed.data;
  const slug = turkishSlugify(v.slug || v.title);

  // published_at: stamp on first publish, then preserve it.
  let publishedAt: string | null = null;
  if (id) {
    const { data: existing } = await supabase
      .from('services')
      .select('published_at')
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .maybeSingle();
    publishedAt =
      existing?.published_at ?? (v.status === 'published' ? new Date().toISOString() : null);
  } else if (v.status === 'published') {
    publishedAt = new Date().toISOString();
  }

  const row = {
    tenant_id: tenant.id,
    title: v.title,
    slug,
    short_description: v.shortDescription || null,
    description: (v.description ?? null) as Json | null,
    pet_types: v.petTypes,
    service_location: v.serviceLocation,
    emergency_available: v.emergencyAvailable,
    pricing: v.pricing || null,
    meta_title: v.metaTitle || null,
    meta_description: v.metaDescription || null,
    no_index: v.noIndex,
    status: v.status,
    published_at: publishedAt,
    main_image_media_id: v.mainImageMediaId ?? null,
  };

  const { error } = id
    ? await supabase.from('services').update(row).eq('id', id).eq('tenant_id', tenant.id)
    : await supabase.from('services').insert(row);

  if (error) {
    if (error.code === '23505') {
      return { ok: false, fieldErrors: { slug: ['Bu slug zaten kullanılıyor.'] } };
    }
    return { ok: false, formError: error.message };
  }

  revalidatePath('/services');
  return { ok: true };
}

export async function deleteService(id: string): Promise<void> {
  const { supabase, tenant } = await getTenantContext();
  await supabase.from('services').delete().eq('id', id).eq('tenant_id', tenant.id);
  revalidatePath('/services');
}
