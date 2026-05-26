import { languageFilter } from '@sanity/language-filter';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from './schemas';
import { deskStructure } from './structure/deskStructure';

// Per-client values come from .env at deploy time so we can run the same
// Studio against any tenant's Sanity project.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineConfig({
  name: 'vetkit',
  title: process.env.SANITY_STUDIO_TITLE ?? 'vetkit Studio',
  projectId,
  dataset,
  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
    languageFilter({
      supportedLanguages: [
        { id: 'tr', title: 'Türkçe' },
        { id: 'en', title: 'English' },
      ],
      defaultLanguages: ['tr'],
      documentTypes: [
        'siteSettings',
        'service',
        'blogPost',
        'teamMember',
        'faq',
        'galleryImage',
        'page',
        'testimonial',
      ],
      // We treat any object type whose `name` begins with "locale" as a
      // locale-aware container (localeString, localeText, localeSlug,
      // localePortableText). Sanity v5's strict ObjectOptions rejects custom
      // keys, so a name-prefix check is the cleanest alternative to a
      // hand-tagged `options.localized` flag.
      filterField: (enclosingType, member, selectedLanguageIds) =>
        !enclosingType.name.startsWith('locale') ||
        (typeof member.name === 'string' && selectedLanguageIds.includes(member.name)),
    }),
  ],
  schema: { types: schemaTypes },
});
