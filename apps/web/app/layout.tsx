import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME ?? 'vetkit',
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME ?? 'vetkit'}`,
  },
  description: 'Veteriner kliniği web sitesi.',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
