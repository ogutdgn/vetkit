import { draftMode } from 'next/headers';
import type { ClientReturn, QueryParams } from 'next-sanity';

import { client, draftClient } from './client';

interface SanityFetchOptions<QueryString extends string> {
  query: QueryString;
  params?: QueryParams;
  /**
   * Cache tags per the OD-5 convention — build them with ./tags.ts. The
   * revalidation webhook (Chunk 13) busts exactly these.
   */
  tags: string[];
}

/**
 * The single fetch path for all Sanity content in apps/web.
 *
 * - Regular visitors: CDN client, published perspective, response cached by
 *   Next with the given tags (`next: { tags }`).
 * - Draft mode (Next 16 `draftMode()` is async): token client, drafts
 *   perspective, never cached.
 *
 * Queries built with `defineQuery` return typed results via `ClientReturn`
 * once typegen has run.
 */
export async function sanityFetch<QueryString extends string>({
  query,
  params = {},
  tags,
}: SanityFetchOptions<QueryString>): Promise<ClientReturn<QueryString>> {
  const { isEnabled: isDraftMode } = await draftMode();

  if (isDraftMode) {
    if (!process.env.SANITY_API_READ_TOKEN) {
      throw new Error(
        'Draft mode requires SANITY_API_READ_TOKEN — set it in apps/web/.env.local (see .env.example).',
      );
    }
    return draftClient.fetch(query, params, { cache: 'no-store' });
  }

  return client.fetch(query, params, { next: { tags } });
}
