import { defineField, defineType } from 'sanity';

import { defaultSlugify, turkishSlugify } from '../../lib/locale';

function readTitle(doc: Record<string, unknown>, locale: 'tr' | 'en'): string {
  const title = doc.title as { tr?: string; en?: string } | undefined;
  return title?.[locale] ?? '';
}

export const localeSlug = defineType({
  name: 'localeSlug',
  type: 'object',
  title: 'Çok dilli URL kimliği',
  description: 'Türkçe ve İngilizce için ayrı URL slug.',
  fields: [
    defineField({
      name: 'tr',
      type: 'slug',
      title: 'Türkçe slug',
      options: {
        source: (doc) => readTitle(doc as Record<string, unknown>, 'tr'),
        slugify: turkishSlugify,
        maxLength: 96,
      },
    }),
    defineField({
      name: 'en',
      type: 'slug',
      title: 'English slug',
      options: {
        source: (doc) => readTitle(doc as Record<string, unknown>, 'en'),
        slugify: defaultSlugify,
        maxLength: 96,
      },
    }),
  ],
});
