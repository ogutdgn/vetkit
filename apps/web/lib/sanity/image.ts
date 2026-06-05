import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';

import { client } from './client';

const builder = createImageUrlBuilder(client);

/**
 * URL builder for Sanity CDN images. Chain sizing before calling `.url()`:
 *
 *   urlFor(image).width(800).height(450).url()
 *
 * `auto('format')` serves WebP/AVIF to capable browsers; `fit('max')` never
 * upscales beyond the original asset.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max');
}
