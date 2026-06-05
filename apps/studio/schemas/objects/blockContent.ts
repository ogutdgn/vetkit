import { defineArrayMember, defineField, defineType } from 'sanity';

// Rich text rules per CLAUDE.md §5: marks strong/em/link, styles
// normal/h2/h3/blockquote — h1 is deliberately absent (the page title is
// already the h1).
export const blockContent = defineType({
  name: 'blockContent',
  type: 'array',
  title: 'Zengin metin',
  of: [
    defineArrayMember({
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
    }),
  ],
});
