import { defineField, defineType } from 'sanity';

export const heroSlide = defineType({
  name: 'heroSlide',
  type: 'object',
  title: 'Slayt',
  description: 'Anasayfa üst alanındaki kayan görsellerden biri.',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      title: 'Arka plan görseli',
      description: 'Geniş, yatay bir fotoğraf seçin (önerilen en az 1600 piksel genişlik).',
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
      name: 'heading',
      type: 'string',
      title: 'Başlık',
      description: 'Örn. "7/24 Acil Teşhis ve Tedavi"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      type: 'string',
      title: 'Üst başlık (opsiyonel)',
      description: 'Başlığın üzerinde küçük yazı. Örn. "Ankara\'da Veteriner Kliniği"',
    }),
    defineField({
      name: 'cta',
      type: 'cta',
      title: 'Buton (opsiyonel)',
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare: (selection) => {
      const { title, media } = selection as { title?: string; media?: unknown };
      return { title: title ?? 'İsimsiz slayt', media: media as never };
    },
  },
});
