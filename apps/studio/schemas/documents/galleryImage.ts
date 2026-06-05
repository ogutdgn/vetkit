import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { defineField, defineType } from 'sanity';

const GALLERY_CATEGORIES = [
  { title: 'Klinik içi', value: 'klinik-ici' },
  { title: 'Tedavi', value: 'tedavi' },
  { title: 'Ekip', value: 'ekip' },
  { title: 'Hastalar', value: 'hastalar' },
] as const;

export const galleryImage = defineType({
  name: 'galleryImage',
  type: 'document',
  title: 'Galeri görseli',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'galleryImage' }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Görsel',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt metin',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      type: 'string',
      title: 'Başlık (opsiyonel)',
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Kategori',
      options: { list: [...GALLERY_CATEGORIES], layout: 'dropdown' },
    }),
  ],
  preview: {
    select: { title: 'caption', subtitle: 'category', media: 'image' },
    prepare: (selection) => {
      const { title, subtitle, media } = selection as {
        title?: string;
        subtitle?: string;
        media?: unknown;
      };
      return {
        title: title ?? 'İsimsiz görsel',
        subtitle,
        media: media as never,
      };
    },
  },
});
