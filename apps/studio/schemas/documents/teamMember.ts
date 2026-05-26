import { defineArrayMember, defineField, defineType } from 'sanity';

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
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Ad Soyad',
      description: 'Özel isim; çevrilmez.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'localeString',
      title: 'Unvan',
      description: 'Örn. "Veteriner Hekim" / "Veterinarian"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL kimliği (opsiyonel)',
      options: { source: 'name', maxLength: 96 },
    }),
    defineField({
      name: 'photo',
      type: 'image',
      title: 'Fotoğraf',
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
      name: 'credentials',
      type: 'array',
      title: 'Eğitim / sertifika',
      of: [defineArrayMember({ type: 'localeString' })],
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
      type: 'localeText',
      title: 'Kısa biyografi (kart için)',
    }),
    defineField({
      name: 'bio',
      type: 'localePortableText',
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
    select: { title: 'name', subtitle: 'title.tr', media: 'photo' },
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
