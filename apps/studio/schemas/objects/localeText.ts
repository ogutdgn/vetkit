import { defineField, defineType } from 'sanity';

export const localeText = defineType({
  name: 'localeText',
  type: 'object',
  title: 'Çok dilli uzun metin',
  description: 'Türkçe ve İngilizce için ayrı uzun metin alanı.',
  fields: [
    defineField({ name: 'tr', type: 'text', title: 'Türkçe', rows: 4 }),
    defineField({ name: 'en', type: 'text', title: 'English', rows: 4 }),
  ],
});
