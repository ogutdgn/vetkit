import { defineField, defineType } from 'sanity';

export const cta = defineType({
  name: 'cta',
  type: 'object',
  title: 'Buton (CTA)',
  fields: [
    defineField({
      name: 'label',
      type: 'localeString',
      title: 'Buton metni',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      type: 'string',
      title: 'Bağlantı (URL veya /yol)',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (typeof value !== 'string') return 'Bağlantı zorunlu';
          if (value.startsWith('/')) return true;
          if (/^https?:\/\//.test(value)) return true;
          if (value.startsWith('mailto:') || value.startsWith('tel:')) return true;
          return '"/", "http(s)://", "mailto:" veya "tel:" ile başlamalı';
        }),
    }),
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Görsel stil',
      initialValue: 'primary',
      options: {
        list: [
          { title: 'Birincil', value: 'primary' },
          { title: 'İkincil', value: 'secondary' },
          { title: 'Hafif', value: 'ghost' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'newTab',
      type: 'boolean',
      title: 'Yeni sekmede aç',
      initialValue: false,
    }),
  ],
});
