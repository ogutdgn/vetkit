import { tiptapDocSchema } from '@vetkit/db';
import { z } from 'zod';

// Shared by the form (zodResolver) and the server action (safeParse) so the two
// sides validate identically. Zod 4 API.
export const serviceFormSchema = z.object({
  title: z.string().min(1, { error: 'Başlık zorunlu' }).max(120),
  slug: z
    .string()
    .max(96)
    .regex(/^[a-z0-9-]*$/, { error: 'Yalnızca küçük harf, rakam ve tire' })
    .optional()
    .default(''),
  shortDescription: z.string().max(280).optional().default(''),
  description: tiptapDocSchema.nullable().default(null),
  petTypes: z.array(z.string()).optional().default([]),
  serviceLocation: z.enum(['in-clinic', 'home-call', 'both']).default('in-clinic'),
  emergencyAvailable: z.boolean().optional().default(false),
  pricing: z.string().max(120).optional().default(''),
  metaTitle: z.string().max(120).optional().default(''),
  metaDescription: z.string().max(320).optional().default(''),
  noIndex: z.boolean().optional().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
  mainImageMediaId: z.uuid().nullable().optional().default(null),
});

export type ServiceFormInput = z.input<typeof serviceFormSchema>;
export type ServiceFormValues = z.output<typeof serviceFormSchema>;

export const PET_TYPES = [
  { value: 'dog', label: 'Köpek' },
  { value: 'cat', label: 'Kedi' },
  { value: 'bird', label: 'Kuş' },
  { value: 'rabbit', label: 'Tavşan' },
  { value: 'exotic', label: 'Egzotik' },
] as const;
