import { defineField, defineType } from 'sanity';

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

const social = (name: string, title: string, placeholder: string) =>
  defineField({
    name,
    type: 'url',
    title,
    description: placeholder,
    validation: (rule) => rule.uri({ scheme: ['http', 'https'], allowRelative: false }),
  });

export const socialLinks = defineType({
  name: 'socialLinks',
  type: 'object',
  title: 'Sosyal medya',
  fields: [
    social('instagram', 'Instagram', 'https://instagram.com/...'),
    social('facebook', 'Facebook', 'https://facebook.com/...'),
    social('x', 'X (Twitter)', 'https://x.com/...'),
    social('youtube', 'YouTube', 'https://youtube.com/@...'),
    social('tiktok', 'TikTok', 'https://tiktok.com/@...'),
    defineField({
      name: 'whatsapp',
      type: 'string',
      title: 'WhatsApp telefon',
      description: 'E.164 formatında (örn. +905551112233)',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          return PHONE_PATTERN.test(value) ? true : 'E.164 formatında olmalı (örn. +905551112233)';
        }),
    }),
  ],
});
