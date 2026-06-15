'use server';

import { getTenantContext } from '@/lib/tenant-db';

export interface UploadResult {
  ok: boolean;
  mediaId?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Upload an image to the tenant-namespaced Storage path, insert a `media` row,
 * and return its id + public URL. The cookie-bound client runs as the
 * authenticated user, so the storage + media RLS policies scope it to the
 * active tenant. Files are uploaded here (never through RHF/the content form).
 */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Dosya seçilmedi.' };
  }

  const altRaw = formData.get('alt');
  const alt = typeof altRaw === 'string' && altRaw.trim() ? altRaw.trim() : null;
  const w = Number(formData.get('width'));
  const h = Number(formData.get('height'));
  const width = Number.isFinite(w) && w > 0 ? Math.round(w) : null;
  const height = Number.isFinite(h) && h > 0 ? Math.round(h) : null;

  const { supabase, tenant } = await getTenantContext();

  const ext = (file.name.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'bin';
  // The first path segment MUST be the tenant id — the storage RLS policy
  // checks (storage.foldername(name))[1] against the caller's tenants.
  const path = `${tenant.id}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
    cacheControl: '3600',
  });
  if (error) return { ok: false, error: error.message };

  const { data: row, error: insErr } = await supabase
    .from('media')
    .insert({
      tenant_id: tenant.id,
      bucket_path: data.path,
      alt,
      width,
      height,
      mime: file.type || null,
    })
    .select('id')
    .single();
  if (insErr) return { ok: false, error: insErr.message };

  const { data: pub } = supabase.storage.from('media').getPublicUrl(data.path);
  return { ok: true, mediaId: row.id, publicUrl: pub.publicUrl };
}
