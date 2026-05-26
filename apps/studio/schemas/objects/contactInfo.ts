import { defineField, defineType } from 'sanity';

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

const phoneValidator = (value: unknown): true | string => {
  if (!value) return true;
  return PHONE_PATTERN.test(value as string)
    ? true
    : 'E.164 formatında olmalı (örn. +905551112233)';
};

export const contactInfo = defineType({
  name: 'contactInfo',
  type: 'object',
  title: 'İletişim bilgileri',
  fields: [
    defineField({
      name: 'primaryPhone',
      type: 'string',
      title: 'Ana telefon',
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value && !PHONE_PATTERN.test(value)
              ? 'E.164 formatında olmalı (örn. +905551112233)'
              : true,
          ),
    }),
    defineField({
      name: 'emergencyPhone',
      type: 'string',
      title: 'Acil telefon (opsiyonel)',
      validation: (rule) => rule.custom(phoneValidator),
    }),
    defineField({
      name: 'whatsapp',
      type: 'string',
      title: 'WhatsApp',
      validation: (rule) => rule.custom(phoneValidator),
    }),
    defineField({
      name: 'email',
      type: 'string',
      title: 'E-posta',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'secondaryEmails',
      type: 'array',
      title: 'Ek e-postalar',
      of: [
        {
          type: 'string',
          validation: (rule) => rule.email(),
        },
      ],
    }),
  ],
});
