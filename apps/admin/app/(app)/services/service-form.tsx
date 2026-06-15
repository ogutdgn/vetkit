'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { JSONContent } from '@tiptap/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';

import { RichTextField } from '@/components/editor/rich-text-field';
import { MediaPicker } from '@/components/media/media-picker';
import { turkishSlugify } from '@/lib/slug';

import { upsertService, type ActionState } from './actions';
import {
  PET_TYPES,
  serviceFormSchema,
  type ServiceFormInput,
  type ServiceFormValues,
} from './schema';

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';
const labelClass = 'block text-sm font-medium text-slate-700';

export function ServiceForm({
  id,
  defaults,
  initialImageUrl,
}: {
  id: string | null;
  defaults: ServiceFormInput;
  initialImageUrl: string | null;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInput, unknown, ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: defaults,
  });

  const onValid: SubmitHandler<ServiceFormValues> = async (values) => {
    const res: ActionState = await upsertService(id, values);
    if (res.ok) {
      router.push('/services');
      router.refresh();
      return;
    }
    for (const [field, msgs] of Object.entries(res.fieldErrors ?? {})) {
      if (msgs?.[0])
        setError(field as keyof ServiceFormInput, { type: 'server', message: msgs[0] });
    }
    if (res.formError) setError('root', { message: res.formError });
  };

  return (
    <form onSubmit={(e) => void handleSubmit(onValid)(e)} className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <label htmlFor="title" className={labelClass}>
          Başlık
        </label>
        <input id="title" className={fieldClass} {...register('title')} />
        {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="slug" className={labelClass}>
          URL kimliği (slug)
        </label>
        <div className="flex gap-2">
          <input
            id="slug"
            className={fieldClass}
            placeholder="kedi-asilamasi"
            {...register('slug')}
          />
          <button
            type="button"
            onClick={() =>
              setValue('slug', turkishSlugify(getValues('title')), { shouldValidate: true })
            }
            className="shrink-0 rounded-md border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50"
          >
            Başlıktan üret
          </button>
        </div>
        {errors.slug ? <p className="text-sm text-red-600">{errors.slug.message}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="shortDescription" className={labelClass}>
          Kısa açıklama (kart için)
        </label>
        <textarea
          id="shortDescription"
          rows={3}
          className={fieldClass}
          {...register('shortDescription')}
        />
      </div>

      <div className="space-y-1">
        <span className={labelClass}>Ana görsel</span>
        <Controller
          name="mainImageMediaId"
          control={control}
          render={({ field }) => (
            <MediaPicker
              value={field.value ?? null}
              initialUrl={initialImageUrl}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="space-y-1">
        <span className={labelClass}>Detay açıklama</span>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextField
              value={(field.value as JSONContent | null) ?? null}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className={labelClass}>Hayvan türleri</legend>
        <div className="flex flex-wrap gap-3">
          {PET_TYPES.map((pt) => (
            <label key={pt.value} className="flex items-center gap-1.5 text-sm text-slate-700">
              <input type="checkbox" value={pt.value} {...register('petTypes')} />
              {pt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="serviceLocation" className={labelClass}>
            Hizmet yeri
          </label>
          <select id="serviceLocation" className={fieldClass} {...register('serviceLocation')}>
            <option value="in-clinic">Klinikte</option>
            <option value="home-call">Evde</option>
            <option value="both">Her ikisi</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="pricing" className={labelClass}>
            Fiyat bilgisi (opsiyonel)
          </label>
          <input id="pricing" className={fieldClass} {...register('pricing')} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" {...register('emergencyAvailable')} /> Acil olarak sunuluyor
      </label>

      <fieldset className="space-y-3 rounded-md border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium text-slate-500">SEO</legend>
        <div className="space-y-1">
          <label htmlFor="metaTitle" className={labelClass}>
            Meta başlık
          </label>
          <input id="metaTitle" className={fieldClass} {...register('metaTitle')} />
        </div>
        <div className="space-y-1">
          <label htmlFor="metaDescription" className={labelClass}>
            Meta açıklama
          </label>
          <textarea
            id="metaDescription"
            rows={2}
            className={fieldClass}
            {...register('metaDescription')}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register('noIndex')} /> Arama motorlarından gizle
        </label>
      </fieldset>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="space-y-1">
          <label htmlFor="status" className={labelClass}>
            Durum
          </label>
          <select id="status" className={fieldClass} {...register('status')}>
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/services" className="text-sm text-slate-500 hover:text-slate-900">
            İptal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </div>

      {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
    </form>
  );
}
