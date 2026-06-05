import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { defineArrayMember, defineField, defineType } from 'sanity';

import { turkishSlugify } from '../../lib/slug';

const SPECIALTIES = [
  { title: 'Cerrahi', value: 'cerrahi' },
  { title: 'Dahiliye', value: 'dahiliye' },
  { title: 'Jinekoloji', value: 'jinekoloji' },
  { title: 'Cildiye', value: 'cildiye' },
  { title: 'Davranış', value: 'davranis' },
  { title: 'Acil', value: 'acil' },
] as const;

export const teamMember = defineType({
  name: 'teamMember',
  type: 'document',
  title: 'Ekip üyesi',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'teamMember' }),
    defineField({
      name: 'name',
      type: 'string',
      title: 'Ad Soyad',
      description: 'Ekip üyesinin tam adı.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Unvan',
      description: 'Örn. "Veteriner Hekim"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL kimliği (opsiyonel)',
      description: 'URL adresinde görünecek kısa kimlik (örn. ayse-yilmaz).',
      options: { source: 'name', slugify: turkishSlugify, maxLength: 96 },
    }),
    defineField({
      name: 'photo',
      type: 'image',
      title: 'Fotoğraf',
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
      name: 'credentials',
      type: 'array',
      title: 'Eğitim / sertifika',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'specialties',
      type: 'array',
      title: 'Uzmanlık alanları',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: [...SPECIALTIES] },
    }),
    defineField({
      name: 'shortBio',
      type: 'text',
      title: 'Kısa biyografi (kart için)',
      rows: 4,
    }),
    defineField({
      name: 'bio',
      type: 'blockContent',
      title: 'Detaylı biyografi',
    }),
    defineField({
      name: 'email',
      type: 'string',
      title: 'E-posta',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'phone',
      type: 'string',
      title: 'Telefon',
    }),
    defineField({
      name: 'socialLinks',
      type: 'socialLinks',
      title: 'Sosyal medya',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'title', media: 'photo' },
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
