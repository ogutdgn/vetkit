import { defineArrayMember, defineField, defineType } from 'sanity';

const blockContent = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'Başlık 2', value: 'h2' },
    { title: 'Başlık 3', value: 'h3' },
    { title: 'Alıntı', value: 'blockquote' },
  ],
  lists: [
    { title: 'Madde', value: 'bullet' },
    { title: 'Numaralı', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Kalın', value: 'strong' },
      { title: 'Vurgu', value: 'em' },
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Bağlantı',
        fields: [
          defineField({
            name: 'href',
            type: 'url',
            title: 'Bağlantı adresi',
            validation: (rule) =>
              rule.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
          }),
          defineField({
            name: 'newTab',
            type: 'boolean',
            title: 'Yeni sekmede aç',
            initialValue: false,
          }),
        ],
      },
    ],
  },
});

export const localePortableText = defineType({
  name: 'localePortableText',
  type: 'object',
  title: 'Çok dilli zengin metin',
  description: 'Türkçe ve İngilizce için ayrı zengin metin alanı.',
  fields: [
    defineField({
      name: 'tr',
      type: 'array',
      title: 'Türkçe',
      of: [blockContent],
    }),
    defineField({
      name: 'en',
      type: 'array',
      title: 'English',
      of: [blockContent],
    }),
  ],
});
