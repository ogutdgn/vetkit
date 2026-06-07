import type { Metadata } from 'next';

import { sanityFetch } from '@/lib/sanity/live';
import { siteSettingsQuery } from '@/lib/sanity/queries';
import { siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata } from '@/lib/seo/metadata';

const DAY_LABELS = [
  ['monday', 'Pazartesi'],
  ['tuesday', 'Salı'],
  ['wednesday', 'Çarşamba'],
  ['thursday', 'Perşembe'],
  ['friday', 'Cuma'],
  ['saturday', 'Cumartesi'],
  ['sunday', 'Pazar'],
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  return buildPageMetadata({
    title: 'İletişim',
    description: `${settings?.clinicName ?? 'Kliniğimize'} ulaşın: adres, telefon ve çalışma saatleri.`,
    path: '/iletisim',
    clinicName: settings?.clinicName,
  });
}

export default async function IletisimPage() {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  if (!settings) return null; // marketing layout already shows the setup notice
  const { contact, address, openingHours } = settings;
  const whatsapp = contact.whatsapp?.replace(/[^\d]/g, '');

  return (
    <>
      <section className="bg-ink-900">
        <div className="mx-auto max-w-6xl px-4 pt-36 pb-14 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white">İletişim</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-300">
            Sorularınız için bize ulaşın — acil durumlarda 7/24 telefonla yanınızdayız.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink-900">Telefon</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li>
              <a
                href={`tel:${contact.primaryPhone}`}
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                {contact.primaryPhone}
              </a>
            </li>
            {contact.emergencyPhone && contact.emergencyPhone !== contact.primaryPhone ? (
              <li>
                Acil:{' '}
                <a
                  href={`tel:${contact.emergencyPhone}`}
                  className="font-medium text-brand-700 hover:text-brand-800"
                >
                  {contact.emergencyPhone}
                </a>
              </li>
            ) : null}
            {whatsapp ? (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 hover:text-brand-800"
                >
                  WhatsApp ile yazın
                </a>
              </li>
            ) : null}
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink-900">Adres</h2>
          <address className="mt-3 text-sm leading-relaxed text-ink-700 not-italic">
            {address.street}
            <br />
            {address.district}/{address.city}
            {address.postalCode ? ` ${address.postalCode}` : ''}
          </address>
          {address.googleMapsUrl ? (
            <a
              href={address.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Haritada aç
            </a>
          ) : null}
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink-900">Çalışma Saatleri</h2>
          {openingHours.isAlwaysOpen ? (
            <p className="mt-3 text-sm font-medium text-ink-700">7/24 Açık</p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm text-ink-700">
              {DAY_LABELS.map(([key, label]) => {
                const day = openingHours[key];
                return (
                  <li key={key} className="flex justify-between gap-4">
                    <span>{label}</span>
                    <span className="text-ink-500">
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
            <p className="mt-3 text-xs text-ink-700">{openingHours.emergencyNote}</p>
          ) : null}
        </div>
      </section>
      {/* The contact form lands here in Chunk 12 (Resend). */}
    </>
  );
}
