import { defineField, defineType } from 'sanity';

const DAYS = [
  { name: 'monday', title: 'Pazartesi' },
  { name: 'tuesday', title: 'Salı' },
  { name: 'wednesday', title: 'Çarşamba' },
  { name: 'thursday', title: 'Perşembe' },
  { name: 'friday', title: 'Cuma' },
  { name: 'saturday', title: 'Cumartesi' },
  { name: 'sunday', title: 'Pazar' },
] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const dayFields = DAYS.map((day) =>
  defineField({
    name: day.name,
    type: 'object',
    title: day.title,
    hidden: ({ parent }) =>
      (parent as { isAlwaysOpen?: boolean } | undefined)?.isAlwaysOpen === true,
    fields: [
      defineField({
        name: 'closed',
        type: 'boolean',
        title: 'Kapalı',
        initialValue: false,
      }),
      defineField({
        name: 'openTime',
        type: 'string',
        title: 'Açılış (HH:mm)',
        hidden: ({ parent }) => (parent as { closed?: boolean } | undefined)?.closed === true,
        validation: (rule) =>
          rule.custom((value) => {
            if (!value) return true;
            return TIME_PATTERN.test(value) ? true : 'HH:mm formatında olmalı (örn. 09:30)';
          }),
      }),
      defineField({
        name: 'closeTime',
        type: 'string',
        title: 'Kapanış (HH:mm)',
        hidden: ({ parent }) => (parent as { closed?: boolean } | undefined)?.closed === true,
        validation: (rule) =>
          rule.custom((value) => {
            if (!value) return true;
            return TIME_PATTERN.test(value) ? true : 'HH:mm formatında olmalı (örn. 18:00)';
          }),
      }),
    ],
  }),
);

export const openingHours = defineType({
  name: 'openingHours',
  type: 'object',
  title: 'Çalışma saatleri',
  fields: [
    defineField({
      name: 'isAlwaysOpen',
      type: 'boolean',
      title: '7/24 Açık',
      description: 'İşaretlendiğinde gün bazlı saatler yerine "TÜM GÜN" gösterilir.',
      initialValue: false,
    }),
    ...dayFields,
    defineField({
      name: 'emergencyNote',
      type: 'localeString',
      title: 'Acil not',
      description: 'Hafta sonu / mesai dışı için kısa not.',
    }),
  ],
});
