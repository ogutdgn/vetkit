import { defineField, defineType } from 'sanity';

export const address = defineType({
  name: 'address',
  type: 'object',
  title: 'Adres',
  fields: [
    defineField({
      name: 'street',
      type: 'string',
      title: 'Cadde ve numara',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'district',
      type: 'string',
      title: 'İlçe',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'city',
      type: 'string',
      title: 'İl',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'postalCode',
      type: 'string',
      title: 'Posta kodu',
    }),
    defineField({
      name: 'country',
      type: 'string',
      title: 'Ülke',
      initialValue: 'TR',
      options: { list: [{ title: 'Türkiye', value: 'TR' }] },
    }),
    defineField({
      name: 'googleMapsUrl',
      type: 'url',
      title: 'Google Haritalar bağlantısı',
    }),
    defineField({
      name: 'coordinates',
      type: 'object',
      title: 'Koordinatlar',
      fields: [
        defineField({ name: 'lat', type: 'number', title: 'Enlem' }),
        defineField({ name: 'lng', type: 'number', title: 'Boylam' }),
      ],
    }),
  ],
});
