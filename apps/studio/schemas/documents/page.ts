import { defineArrayMember, defineField, defineType } from 'sanity';

export const page = defineType({
  name: 'page',
  type: 'document',
  title: 'Sayfa',
  description: 'Hakkımızda, KVKK, Çerez Politikası gibi tekil içerik sayfaları.',
  fields: [
    defineField({
      name: 'title',
      type: 'localeString',
      title: 'Sayfa başlığı',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'localeSlug',
      title: 'URL kimliği',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Üst görsel (opsiyonel)',
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
              return tr ? true : 'Görsel varsa alt metin zorunludur.';
            }),
        }),
      ],
    }),
    defineField({
      name: 'body',
      type: 'localePortableText',
      title: 'İçerik',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuredTeamMembers',
      type: 'array',
      title: 'Öne çıkan ekip üyeleri (opsiyonel)',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'teamMember' }],
        }),
      ],
    }),
    defineField({
      name: 'ctaButtons',
      type: 'array',
      title: 'CTA butonları (opsiyonel)',
      of: [defineArrayMember({ type: 'cta' })],
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO ayarları',
    }),
  ],
  preview: {
    select: { title: 'title.tr', media: 'heroImage' },
    prepare: (selection) => {
      const { title, media } = selection as {
        title?: string;
        media?: unknown;
      };
      return {
        title: title ?? 'İsimsiz sayfa',
        media: media as never,
      };
    },
  },
});
