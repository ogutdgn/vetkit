import { defineField, defineType } from 'sanity';

export const testimonial = defineType({
  name: 'testimonial',
  type: 'document',
  title: 'Görüş',
  fields: [
    defineField({
      name: 'authorName',
      type: 'string',
      title: 'Yazan kişi',
      description: 'Özel isim; çevrilmez.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorPhoto',
      type: 'image',
      title: 'Fotoğraf (opsiyonel)',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'localeString',
          title: 'Alt metin',
          validation: (rule) =>
            rule.custom((value, ctx) => {
              const parent = ctx.parent as { asset?: unknown } | undefined;
              if (!parent?.asset) return true;
              const tr = (value as { tr?: string } | undefined)?.tr;
              return tr ? true : 'Fotoğraf varsa alt metin zorunludur.';
            }),
        }),
      ],
    }),
    defineField({
      name: 'content',
      type: 'localePortableText',
      title: 'Yorum',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      title: 'Puan (1-5)',
      validation: (rule) => rule.min(1).max(5).integer(),
    }),
    defineField({
      name: 'source',
      type: 'string',
      title: 'Kaynak',
      initialValue: 'manual',
      options: {
        list: [
          { title: 'Manuel', value: 'manual' },
          { title: 'Google', value: 'google' },
          { title: 'Trustmary', value: 'trustmary' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceUrl',
      type: 'url',
      title: 'Kaynak bağlantısı (opsiyonel)',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Tarih',
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Anasayfada öne çıkar',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'authorName',
      subtitle: 'source',
      media: 'authorPhoto',
    },
    prepare: (selection) => {
      const { title, subtitle, media } = selection as {
        title?: string;
        subtitle?: string;
        media?: unknown;
      };
      return {
        title: title ?? 'İsimsiz',
        subtitle,
        media: media as never,
      };
    },
  },
});
