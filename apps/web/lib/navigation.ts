import type { NavItem } from '@/types/template';

// The marketing-site navigation, shared by every page (routes land in
// Chunk 11; the paths mirror CLAUDE.md §4's app/(marketing) tree).
export const NAV_ITEMS: NavItem[] = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Hizmetler', href: '/hizmetler' },
  { label: 'Blog', href: '/blog' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'SSS', href: '/sss' },
  { label: 'İletişim', href: '/iletisim' },
];
