import { defineArrayMember, defineField, defineType } from 'sanity';

const PET_TYPES = [
  { title: 'Köpek', value: 'dog' },
  { title: 'Kedi', value: 'cat' },
  { title: 'Kuş', value: 'bird' },
  { title: 'Tavşan', value: 'rabbit' },
  { title: 'Egzotik', value: 'exotic' },
] as const;

export const service = defineType({
  name: 'service',
  type: 'document',
  title: 'Hizmet',
  fields: [
    defineField({
      name: 'title',
      type: 'localeString',
      title: 'Hizmet adı',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'localeSlug',
      title: 'URL kimliği',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Ana görsel',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'localeString',
          title: 'Alt metin',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      type: 'image',
      title: 'İkon (kart görselleri için, opsiyonel)',
      options: { hotspot: false },
    }),
    defineField({
      name: 'shortDescription',
      type: 'localeText',
      title: 'Kısa açıklama (kart için)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'localePortableText',
      title: 'Detay açıklama',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'petTypes',
      type: 'array',
      title: 'Hangi hayvan türleri',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: [...PET_TYPES] },
    }),
    defineField({
      name: 'serviceLocation',
      type: 'string',
      title: 'Hizmet yeri',
      initialValue: 'in-clinic',
      options: {
        list: [
          { title: 'Klinikte', value: 'in-clinic' },
          { title: 'Evde', value: 'home-call' },
          { title: 'Her ikisi', value: 'both' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'emergencyAvailable',
      type: 'boolean',
      title: 'Acil olarak sunuluyor mu?',
      initialValue: false,
    }),
    defineField({
      name: 'relatedFAQs',
      type: 'array',
      title: 'İlgili SSS',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faq' }] })],
    }),
    defineField({
      name: 'pricing',
      type: 'localeString',
      title: 'Fiyat bilgisi (opsiyonel)',
      description: 'Örn. "300 TL\'den başlayan fiyatlarla". Boş kalabilir.',
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO ayarları',
    }),
  ],
  preview: {
    select: {
      title: 'title.tr',
      media: 'mainImage',
    },
    prepare: (selection) => {
      const { title, media } = selection as {
        title?: string;
        media?: unknown;
      };
      return {
        title: title ?? 'İsimsiz hizmet',
        media: media as never,
      };
    },
  },
});
