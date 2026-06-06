import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@/lib/sanity/image';
import type { FooterProps } from '@/types/template';

const DAY_LABELS = [
  ['monday', 'Pazartesi'],
  ['tuesday', 'Salı'],
  ['wednesday', 'Çarşamba'],
  ['thursday', 'Perşembe'],
  ['friday', 'Cuma'],
  ['saturday', 'Cumartesi'],
  ['sunday', 'Pazar'],
] as const;

const SOCIAL_LABELS = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['x', 'X'],
  ['youtube', 'YouTube'],
  ['tiktok', 'TikTok'],
] as const;

export function Footer({ settings, navItems }: FooterProps) {
  const { clinicName, logo, contact, address, openingHours, socialLinks, footerText, footerLinks } =
    settings;
  const year = new Date().getFullYear();
  const socials: { label: string; url: string }[] = [];
  for (const [key, label] of SOCIAL_LABELS) {
    const url = socialLinks?.[key];
    if (url) socials.push({ label, url });
  }

  return (
    <footer className="border-t border-ink-200 bg-ink-900 text-ink-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            {logo.asset ? (
              <Image
                src={urlFor(logo).width(80).height(80).url()}
                alt={logo.alt}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : null}
            <span className="text-base font-semibold text-white">{clinicName}</span>
          </div>
          {footerText ? <p className="mt-4 text-sm leading-relaxed">{footerText}</p> : null}
          {socials.length ? (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-ink-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Alt menü">
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">Sayfalar</h2>
          <ul className="mt-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm transition hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">İletişim</h2>
          <address className="mt-4 space-y-2 text-sm not-italic">
            <p>
              {address.street}, {address.district}/{address.city}
            </p>
            <p>
              <a
                href={`tel:${contact.primaryPhone}`}
                className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              >
                {contact.primaryPhone}
              </a>
            </p>
            {contact.emergencyPhone ? (
              <p>
                Acil:{' '}
                <a
                  href={`tel:${contact.emergencyPhone}`}
                  className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                >
                  {contact.emergencyPhone}
                </a>
              </p>
            ) : null}
            <p>
              <a
                href={`mailto:${contact.email}`}
                className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              >
                {contact.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Çalışma Saatleri
          </h2>
          {openingHours.isAlwaysOpen ? (
            <p className="mt-4 text-sm">7/24 Açık</p>
          ) : (
            <ul className="mt-4 space-y-1 text-sm">
              {DAY_LABELS.map(([key, label]) => {
                const day = openingHours[key];
                return (
                  <li key={key} className="flex justify-between gap-4">
                    <span>{label}</span>
                    <span className="text-ink-300">
                      {day?.closed || !day?.openTime || !day.closeTime
                        ? 'Kapalı'
                        : `${day.openTime} – ${day.closeTime}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {openingHours.emergencyNote ? (
            <p className="mt-3 text-xs text-ink-400">{openingHours.emergencyNote}</p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-ink-700">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-400 sm:flex-row sm:px-6">
          <p>
            © {year} {clinicName}. Tüm hakları saklıdır.
          </p>
          {footerLinks?.length ? (
            <ul className="flex flex-wrap gap-4">
              {footerLinks.map((cta) => (
                <li key={cta._key}>
                  <Link
                    href={cta.href}
                    {...(cta.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {cta.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
