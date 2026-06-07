import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@/lib/sanity/image';
import type { HeaderProps } from '@/types/template';

import { MobileNav } from './MobileNav';

export function Header({ settings, navItems }: HeaderProps) {
  const { clinicName, logo, contact, emergencyBanner } = settings;
  const showBanner = emergencyBanner?.enabled && emergencyBanner.text;

  return (
    <>
      {showBanner ? (
        <div
          className={
            emergencyBanner.variant === 'sticky'
              ? 'sticky top-0 z-50 bg-brand-700 text-white'
              : 'bg-brand-700 text-white'
          }
        >
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium sm:px-6">
            <span>{emergencyBanner.text}</span>
            {emergencyBanner.phone ? (
              <a
                href={`tel:${emergencyBanner.phone}`}
                className="underline underline-offset-2 hover:text-brand-100 focus-visible:outline-2 focus-visible:outline-white"
              >
                {emergencyBanner.phone}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900/95 text-white backdrop-blur">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            {logo.asset ? (
              // Cropped square around the hotspot — clinic logos should be
              // square marks (wide wordmarks get center-cropped).
              <Image
                src={urlFor(logo).width(96).height(96).url()}
                alt={logo.alt}
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
            ) : null}
            <span className="text-lg font-semibold tracking-tight text-white">{clinicName}</span>
          </Link>
          <nav aria-label="Ana menü" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-sm text-sm font-medium text-ink-200 transition hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${contact.primaryPhone}`}
              className="hidden items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:inline-flex"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2Z" />
              </svg>
              Bizi Arayın
            </a>
            {/* Below sm the text CTA hides — keep an icon-only call button,
                tel: converts best on exactly these screens. */}
            <a
              href={`tel:${contact.primaryPhone}`}
              aria-label="Bizi arayın"
              className="inline-flex rounded-md p-2.5 text-brand-400 hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-brand-400 sm:hidden"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
                <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2Z" />
              </svg>
            </a>
            <MobileNav navItems={navItems} />
          </div>
        </div>
      </header>
    </>
  );
}
