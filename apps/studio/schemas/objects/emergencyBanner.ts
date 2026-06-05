import { defineField, defineType } from 'sanity';

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

export const emergencyBanner = defineType({
  name: 'emergencyBanner',
  type: 'object',
  title: 'Acil durum banner',
  description: 'Site genelinde gösterilecek 7/24 acil banner. Devre dışı bırakılabilir.',
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      title: 'Aktif',
      initialValue: false,
    }),
    defineField({
      name: 'text',
      type: 'string',
      title: 'Banner metni',
      description: 'Örn. "7/24 Acil Servis"',
      hidden: ({ parent }) => (parent as { enabled?: boolean } | undefined)?.enabled !== true,
    }),
    defineField({
      name: 'phone',
      type: 'string',
      title: 'Telefon (tıklanabilir)',
      description: 'E.164 formatında.',
      hidden: ({ parent }) => (parent as { enabled?: boolean } | undefined)?.enabled !== true,
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const parent = ctx.parent as { enabled?: boolean } | undefined;
          if (!parent?.enabled) return true;
          if (!value) return 'Aktif banner için telefon zorunlu.';
          return PHONE_PATTERN.test(value) ? true : 'E.164 formatında olmalı (örn. +905551112233)';
        }),
    }),
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Yerleşim',
      initialValue: 'top',
      options: {
        list: [
          { title: 'Üstte sabit', value: 'top' },
          { title: 'Yapışkan (sticky)', value: 'sticky' },
        ],
        layout: 'radio',
      },
    }),
  ],
});
