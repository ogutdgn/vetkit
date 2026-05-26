import { defineArrayMember, defineField, defineType } from 'sanity';

const CATEGORIES = [
  { title: 'Genel', value: 'genel' },
  { title: 'Beslenme', value: 'beslenme' },
  { title: 'Aşılama', value: 'asilama' },
  { title: 'Davranış', value: 'davranis' },
  { title: 'Acil', value: 'acil' },
] as const;

export const blogPost = defineType({
  name: 'blogPost',
  type: 'document',
  title: 'Blog yazısı',
  fields: [
    defineField({
      name: 'title',
      type: 'localeString',
      title: 'Başlık',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'localeSlug',
      title: 'URL kimliği',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'localeText',
      title: 'Özet',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'localePortableText',
      title: 'İçerik',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      title: 'Kapak görseli',
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
      name: 'author',
      type: 'reference',
      title: 'Yazar',
      to: [{ type: 'teamMember' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Yayın tarihi',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Kategori',
      options: { list: [...CATEGORIES], layout: 'dropdown' },
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Etiketler',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'relatedServices',
      type: 'array',
      title: 'İlgili hizmetler',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
    }),
    defineField({
      name: 'relatedPosts',
      type: 'array',
      title: 'İlgili blog yazıları',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'blogPost' }] })],
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO ayarları',
    }),
  ],
  orderings: [
    {
      title: 'Yayın tarihi (yeniden eskiye)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title.tr',
      media: 'coverImage',
      date: 'publishedAt',
    },
    prepare: (selection) => {
      const { title, media, date } = selection as {
        title?: string;
        media?: unknown;
        date?: string;
      };
      return {
        title: title ?? 'İsimsiz yazı',
        subtitle: date ? new Date(date).toLocaleDateString('tr-TR') : undefined,
        media: media as never,
      };
    },
  },
});
