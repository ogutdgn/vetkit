import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { defineField, defineType } from 'sanity';

const FAQ_CATEGORIES = [
  { title: 'Genel', value: 'genel' },
  { title: 'Aşılama', value: 'asilama' },
  { title: 'Cerrahi', value: 'cerrahi' },
  { title: 'Beslenme', value: 'beslenme' },
  { title: 'Acil', value: 'acil' },
] as const;

export const faq = defineType({
  name: 'faq',
  type: 'document',
  title: 'SSS',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'faq' }),
    defineField({
      name: 'question',
      type: 'string',
      title: 'Soru',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      type: 'blockContent',
      title: 'Cevap',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Kategori',
      options: { list: [...FAQ_CATEGORIES], layout: 'dropdown' },
    }),
  ],
  preview: {
    select: { title: 'question', subtitle: 'category' },
    prepare: (selection) => {
      const { title, subtitle } = selection as {
        title?: string;
        subtitle?: string;
      };
      return {
        title: title ?? 'İsimsiz soru',
        subtitle,
      };
    },
  },
});
