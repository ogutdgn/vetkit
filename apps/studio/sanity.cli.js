import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  typegen: {
    path: '../web/{app,components,lib,templates,types}/**/*.{ts,tsx}',
    schema: '../../packages/sanity-types/schema.json',
    generates: '../../packages/sanity-types/generated.ts',
  },
});
