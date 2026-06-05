import type { MetadataRoute } from 'next';

// Static, env-driven values for now — siteSettings-driven branding (name,
// brand color) gets wired when the template token pipeline lands (Chunk 10).
export default function manifest(): MetadataRoute.Manifest {
  const name = process.env.NEXT_PUBLIC_SITE_NAME ?? 'vetkit';

  return {
    name,
    short_name: name,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'tr',
  };
}
