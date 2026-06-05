import { trTRLocale } from '@sanity/locale-tr-tr';
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
    // Studio chrome translated into Turkish. Editors can still switch back to
    // English via the language switcher; the bundle just adds Turkish to the
    // list (Sanity v5 has no defineConfig-level "force locale" hook).
    trTRLocale(),
  ],
  schema: { types: schemaTypes },
});
