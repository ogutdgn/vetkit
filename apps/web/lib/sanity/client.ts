import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

if (!projectId) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID — set it in apps/web/.env.local (see .env.example).',
  );
}

/** Pinned Sanity API version (vYYYY-MM-DD). Bump deliberately, never implicitly. */
export const apiVersion = '2026-06-01';

/**
 * Public, CDN-cached client for published content. Regular page fetches go
 * through this via `sanityFetch` (./live.ts), which attaches the cache tags
 * from ./tags.ts so the revalidation webhook (Chunk 13) can bust selectively.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
});

/**
 * Draft-aware client for Next.js draft mode. Bypasses the CDN and reads
 * unpublished drafts with the read token. Selected by `sanityFetch` when
 * `draftMode()` is enabled — never used for regular visitors.
 */
export const draftClient = client.withConfig({
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'drafts',
});
