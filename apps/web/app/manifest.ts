import type { MetadataRoute } from 'next';

import { htmlLang, siteNameFallback } from '@/lib/seo/metadata';

// Static, env-driven values for now — siteSettings-driven branding (name,
// brand color, icons) gets wired when the template token pipeline lands
// (Chunk 10).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteNameFallback,
    short_name: siteNameFallback,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: htmlLang,
  };
}
