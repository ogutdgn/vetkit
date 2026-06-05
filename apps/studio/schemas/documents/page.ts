import { defineArrayMember, defineField, defineType } from 'sanity';

import { turkishSlugify } from '../../lib/slug';

export const page = defineType({
  name: 'page',
  type: 'document',
  title: 'Sayfa',
  description: 'Hakkımızda, KVKK, Çerez Politikası gibi tekil içerik sayfaları.',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Sayfa başlığı',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL kimliği',
      description: 'URL adresinde görünecek kısa kimlik (örn. hakkimizda).',
      options: { source: 'title', slugify: turkishSlugify, maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Üst görsel (opsiyonel)',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt metin',
          validation: (rule) =>
            rule.custom((value, ctx) => {
              const parent = ctx.parent as { asset?: unknown } | undefined;
              if (!parent?.asset) return true;
              return value ? true : 'Görsel varsa alt metin zorunludur.';
            }),
        }),
      ],
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      title: 'İçerik',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuredTeamMembers',
      type: 'array',
      title: 'Öne çıkan ekip üyeleri (opsiyonel)',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'teamMember' }],
        }),
      ],
    }),
    defineField({
      name: 'ctaButtons',
      type: 'array',
      title: 'CTA butonları (opsiyonel)',
      of: [defineArrayMember({ type: 'cta' })],
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO ayarları',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'heroImage' },
    prepare: (selection) => {
      const { title, media } = selection as {
        title?: string;
        media?: unknown;
      };
      return {
        title: title ?? 'İsimsiz sayfa',
        media: media as never,
      };
    },
  },
});
