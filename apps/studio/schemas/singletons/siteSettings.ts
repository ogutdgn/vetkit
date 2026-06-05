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
      type: 'string',
      title: 'Klinik adı',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      type: 'string',
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
          type: 'string',
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
      type: 'text',
      title: 'Footer metni',
      rows: 4,
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
    select: { title: 'clinicName' },
    prepare: ({ title }) => ({
      title: (title as string | undefined) ?? 'Klinik Bilgileri',
    }),
  },
});
