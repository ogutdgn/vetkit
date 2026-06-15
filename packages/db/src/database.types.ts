// The Database type the app consumes: the generated types with the jsonb
// value-object columns narrowed from the broad `Json` to the Zod shapes in
// ./schemas (z.infer). Regenerating database-generated.types.ts never touches
// this file. Row is narrowed (reads get precise types); Insert/Update stay
// `Json`-loose and are validated at the write boundary with the same Zod schemas.

import type { MergeDeep } from 'type-fest';

import type { Database as DatabaseGenerated, Json } from './database-generated.types';
import type {
  Address,
  Cta,
  Contact,
  EmergencyBanner,
  OpeningHours,
  Seo,
  SocialLinks,
  TiptapDoc,
} from './schemas';

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        site_settings: {
          Row: {
            contact: Contact | null;
            address: Address | null;
            opening_hours: OpeningHours | null;
            social_links: SocialLinks | null;
            emergency_banner: EmergencyBanner | null;
            footer_links: Cta[] | null;
            default_seo: Seo | null;
          };
        };
        hero_slides: { Row: { cta: Cta | null } };
        services: { Row: { description: TiptapDoc | null } };
        faqs: { Row: { answer: TiptapDoc | null } };
        blog_posts: { Row: { body: TiptapDoc | null } };
        team_members: { Row: { bio: TiptapDoc | null; social_links: SocialLinks | null } };
        pages: { Row: { body: TiptapDoc | null; cta_buttons: Cta[] | null } };
        testimonials: { Row: { content: TiptapDoc | null } };
      };
    };
  }
>;

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T] extends {
  Row: infer R;
}
  ? R
  : never;

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T] extends { Insert: infer I } ? I : never;

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T] extends { Update: infer U } ? U : never;

export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];

export type { Json };
