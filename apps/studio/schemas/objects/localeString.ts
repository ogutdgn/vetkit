import { defineField, defineType } from 'sanity';

export const localeString = defineType({
  name: 'localeString',
  type: 'object',
  title: 'Çok dilli kısa metin',
  description: 'Türkçe ve İngilizce için ayrı kısa metin alanı.',
  fields: [
    defineField({ name: 'tr', type: 'string', title: 'Türkçe' }),
    defineField({ name: 'en', type: 'string', title: 'English' }),
  ],
});
