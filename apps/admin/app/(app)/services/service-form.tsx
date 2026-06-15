'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import type { JSONContent } from '@tiptap/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';

import { RichTextField } from '@/components/editor/rich-text-field';
import { MediaPicker } from '@/components/media/media-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { turkishSlugify } from '@/lib/slug';
import { cn } from '@/lib/utils';

import { upsertService, type ActionState } from './actions';
import {
  PET_TYPES,
  serviceFormSchema,
  type ServiceFormInput,
  type ServiceFormValues,
} from './schema';

const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';
const errorClass = 'text-sm text-destructive';

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
    resolver: standardSchemaResolver(serviceFormSchema),
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
      <Card>
        <CardHeader>
          <CardTitle>Temel bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input id="title" {...register('title')} />
            {errors.title ? <p className={errorClass}>{errors.title.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL kimliği (slug)</Label>
            <div className="flex gap-2">
              <Input id="slug" placeholder="kedi-asilamasi" {...register('slug')} />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setValue('slug', turkishSlugify(getValues('title')), { shouldValidate: true })
                }
              >
                Başlıktan üret
              </Button>
            </div>
            {errors.slug ? <p className={errorClass}>{errors.slug.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Kısa açıklama (kart için)</Label>
            <Textarea id="shortDescription" rows={3} {...register('shortDescription')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Görsel ve açıklama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ana görsel</Label>
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
          <div className="space-y-2">
            <Label>Detay açıklama</Label>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ayrıntılar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Hayvan türleri</Label>
            <div className="flex flex-wrap gap-3">
              {PET_TYPES.map((pt) => (
                <label key={pt.value} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    value={pt.value}
                    className="size-4 accent-primary"
                    {...register('petTypes')}
                  />
                  {pt.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serviceLocation">Hizmet yeri</Label>
              <select id="serviceLocation" className={selectClass} {...register('serviceLocation')}>
                <option value="in-clinic">Klinikte</option>
                <option value="home-call">Evde</option>
                <option value="both">Her ikisi</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing">Fiyat bilgisi (opsiyonel)</Label>
              <Input id="pricing" {...register('pricing')} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register('emergencyAvailable')}
            />
            Acil olarak sunuluyor
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta başlık</Label>
            <Input id="metaTitle" {...register('metaTitle')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta açıklama</Label>
            <Textarea id="metaDescription" rows={2} {...register('metaDescription')} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-primary" {...register('noIndex')} />
            Arama motorlarından gizle
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Durum</Label>
          <select id="status" className={cn(selectClass, 'w-40')} {...register('status')}>
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/services" className={buttonVariants({ variant: 'ghost' })}>
            İptal
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {errors.root ? <p className={errorClass}>{errors.root.message}</p> : null}
    </form>
  );
}
