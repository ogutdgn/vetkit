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
          // Plain required (not conditional-on-asset) so typegen emits
          // `alt: string` and heroImage stays assignable to the template
          // contract's SanityImageWithAlt. heroImage itself is optional, so
          // this only bites when an editor actually adds one.
          validation: (rule) => rule.required(),
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
