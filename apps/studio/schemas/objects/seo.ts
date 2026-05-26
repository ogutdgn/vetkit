import { defineField, defineType } from 'sanity';

export const seo = defineType({
  name: 'seo',
  type: 'object',
  title: 'SEO ayarları',
  description: 'Sayfa için arama motoru ve sosyal medya önizleme bilgileri.',
  fields: [
    defineField({
      name: 'metaTitle',
      type: 'localeString',
      title: 'Meta başlık',
      description: 'Boş bırakılırsa sayfa başlığı kullanılır.',
    }),
    defineField({
      name: 'metaDescription',
      type: 'localeText',
      title: 'Meta açıklama',
      description: 'Boş bırakılırsa içerikten otomatik üretilir. 155 karakter önerilir.',
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      title: 'Sosyal medya görseli',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'localeString',
          title: 'Alternatif metin',
          validation: (rule) => rule.required().error('Alt metin a11y için zorunludur.'),
        }),
      ],
    }),
    defineField({
      name: 'noIndex',
      type: 'boolean',
      title: 'Arama motorlarından gizle',
      initialValue: false,
    }),
  ],
});
