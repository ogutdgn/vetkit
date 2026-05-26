import { defineArrayMember, defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  type: 'document',
  title: 'Klinik Bilgileri',
  description:
    'Klinik adı, marka, iletişim, adres ve site geneli ayarlar. Tek bir kayıt olarak yönetilir.',
  fields: [
    // Identity
    defineField({
      name: 'clinicName',
      type: 'localeString',
      title: 'Klinik adı',
      validation: (rule) =>
        rule.required().custom((value) => {
          const tr = (value as { tr?: string } | undefined)?.tr;
          return tr ? true : 'Türkçe klinik adı zorunlu.';
        }),
    }),
    defineField({
      name: 'tagline',
      type: 'localeString',
      title: 'Slogan',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Logo',
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
      name: 'brandColor',
      type: 'object',
      title: 'Marka rengi',
      fields: [
        defineField({
          name: 'hex',
          type: 'string',
          title: 'HEX kod (örn. #0F766E)',
          validation: (rule) =>
            rule.required().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { name: 'HEX' }),
        }),
        defineField({
          name: 'name',
          type: 'string',
          title: 'Renk adı (opsiyonel)',
        }),
      ],
    }),

    // Localization
    defineField({
      name: 'activeLocales',
      type: 'array',
      title: 'Aktif diller',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Türkçe', value: 'tr' },
          { title: 'English', value: 'en' },
        ],
      },
      initialValue: ['tr'],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'defaultLocale',
      type: 'string',
      title: 'Varsayılan dil',
      initialValue: 'tr',
      options: {
        list: [
          { title: 'Türkçe', value: 'tr' },
          { title: 'English', value: 'en' },
        ],
        layout: 'radio',
      },
      validation: (rule) =>
        rule.required().custom((value, ctx) => {
          const active = (ctx.document?.activeLocales ?? []) as string[];
          if (active.length === 0) return true;
          return active.includes(value!) ? true : 'Varsayılan dil, aktif diller arasında olmalı.';
        }),
    }),

    // Contact & address
    defineField({
      name: 'contact',
      type: 'contactInfo',
      title: 'İletişim',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      type: 'address',
      title: 'Adres',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'openingHours',
      type: 'openingHours',
      title: 'Çalışma saatleri',
      validation: (rule) => rule.required(),
    }),

    // Branding extras
    defineField({
      name: 'socialLinks',
      type: 'socialLinks',
      title: 'Sosyal medya',
    }),
    defineField({
      name: 'emergencyBanner',
      type: 'emergencyBanner',
      title: 'Acil banner',
    }),
    defineField({
      name: 'footerText',
      type: 'localeText',
      title: 'Footer metni',
    }),
    defineField({
      name: 'footerLinks',
      type: 'array',
      title: 'Footer butonları',
      of: [defineArrayMember({ type: 'cta' })],
    }),

    // SEO defaults
    defineField({
      name: 'defaultSeo',
      type: 'seo',
      title: 'Varsayılan SEO',
    }),

    // Feature flags
    defineField({
      name: 'vercelAnalyticsEnabled',
      type: 'boolean',
      title: 'Vercel Analytics aktif',
      description: 'Site üzerinde Vercel Analytics çalıştırılsın mı?',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'clinicName.tr' },
    prepare: ({ title }) => ({
      title: (title as string | undefined) ?? 'Klinik Bilgileri',
    }),
  },
});
