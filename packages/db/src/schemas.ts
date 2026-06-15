// Zod schemas for the jsonb value-objects (spec §3). These are the single
// source of truth for both (a) the compile-time jsonb override in
// database.types.ts (via z.infer) and (b) runtime validation at the admin write
// boundary (R3). Kept to stable core Zod so they hold across versions; richer
// format validators (email/url/phone/HH:mm) are added with the admin forms in R3.

import { z } from 'zod';

export const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(['primary', 'secondary', 'ghost']).optional(),
  newTab: z.boolean().optional(),
});
export type Cta = z.infer<typeof ctaSchema>;

export const contactSchema = z.object({
  primaryPhone: z.string(),
  emergencyPhone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string(),
  secondaryEmails: z.array(z.string()).optional(),
});
export type Contact = z.infer<typeof contactSchema>;

export const coordinatesSchema = z.object({ lat: z.number(), lng: z.number() });
export type Coordinates = z.infer<typeof coordinatesSchema>;

export const addressSchema = z.object({
  street: z.string(),
  district: z.string(),
  city: z.string(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  coordinates: coordinatesSchema.optional(),
});
export type Address = z.infer<typeof addressSchema>;

export const dayHoursSchema = z.object({
  closed: z.boolean().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});
export type DayHours = z.infer<typeof dayHoursSchema>;

export const openingHoursSchema = z.object({
  isAlwaysOpen: z.boolean().optional(),
  monday: dayHoursSchema.optional(),
  tuesday: dayHoursSchema.optional(),
  wednesday: dayHoursSchema.optional(),
  thursday: dayHoursSchema.optional(),
  friday: dayHoursSchema.optional(),
  saturday: dayHoursSchema.optional(),
  sunday: dayHoursSchema.optional(),
  emergencyNote: z.string().optional(),
});
export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const socialLinksSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  x: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
  whatsapp: z.string().optional(),
});
export type SocialLinks = z.infer<typeof socialLinksSchema>;

export const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  noIndex: z.boolean().optional(),
});
export type Seo = z.infer<typeof seoSchema>;

export const emergencyBannerSchema = z.object({
  enabled: z.boolean(),
  text: z.string().optional(),
  phone: z.string().optional(),
  variant: z.enum(['top', 'sticky']).optional(),
});
export type EmergencyBanner = z.infer<typeof emergencyBannerSchema>;

// Tiptap document (rich text). Loose for now — full node/mark validation lives
// with the editor config in R3; here it only needs to describe the jsonb shape.
export const tiptapDocSchema = z.object({
  type: z.string(),
  content: z.array(z.unknown()).optional(),
});
export type TiptapDoc = z.infer<typeof tiptapDocSchema>;
