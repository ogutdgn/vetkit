import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { urlFor } from '@/lib/sanity/image';
import { sanityFetch } from '@/lib/sanity/live';
import {
  galleryImagesQuery,
  homeBlogPostsQuery,
  servicesListQuery,
  siteSettingsQuery,
  teamMembersListQuery,
} from '@/lib/sanity/queries';
import { listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata, siteNameFallback } from '@/lib/seo/metadata';
import { getTemplate } from '@/lib/template';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  const clinicName = settings?.clinicName ?? siteNameFallback;
  const metadata = buildPageMetadata({
    title: clinicName,
    description: settings?.tagline,
    seo: settings?.defaultSeo,
    path: '/',
    clinicName,
  });
  // Without a defaultSeo.metaTitle the templated form would render
  // "Clinic | Clinic" — the home title is the clinic name itself.
  if (!settings?.defaultSeo?.metaTitle) metadata.title = { absolute: clinicName };
  return metadata;
}

/** Legacy `heading-main` pattern: small kicker over a big Changa title. */
function SectionHeading({ kicker, title, id }: { kicker: string; title: string; id: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-semibold text-brand-600">{kicker}</p>
      <h2 id={id} className="mt-1 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}

/** The legacy 72px gray line icons for the services grid. */
function ServiceIcon({ title }: { title: string }) {
  const t = title.toLocaleLowerCase('tr-TR');
  const path = t.includes('acil')
    ? 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0' // clock
    : t.includes('laboratuvar')
      ? 'M9 3h6m-5 0v6L4.8 17.4A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 1.7-3.1L14 9V3m-5.5 10h7' // flask
      : t.includes('röntgen') || t.includes('ultrason')
        ? 'M4 5h16v14H4zM8 5v14m4-14v14m4-14v14M4 10h16' // x-ray panel
        : t.includes('mama') || t.includes('malzeme')
          ? 'M7 10a3 3 0 1 1 3-3c1-1 3-1 4 0a3 3 0 1 1 3 3c1 1 1 3 0 4a3 3 0 1 1-3 3c-1 1-3 1-4 0a3 3 0 1 1-3-3c-1-1-1-3 0-4' // bone
          : t.includes('eve')
            ? 'M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8' // house
            : 'M6 3v4a6 6 0 0 0 12 0V3M9 3v2m6-2v2m-3 12v4m-2 0h4'; // stethoscope-ish
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-16 text-ink-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function VisitCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md bg-navy p-7 text-white shadow-lg">
      <p className="text-sm font-bold tracking-wide uppercase">{title}</p>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default async function HomePage() {
  const { Hero, BlogCard, TeamSection } = await getTemplate();

  const [settings, services, posts, team, gallery] = await Promise.all([
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
    sanityFetch({ query: servicesListQuery, tags: [listTag('service')] }),
    sanityFetch({ query: homeBlogPostsQuery, tags: [listTag('blogPost'), listTag('teamMember')] }),
    sanityFetch({ query: teamMembersListQuery, tags: [listTag('teamMember')] }),
    sanityFetch({ query: galleryImagesQuery, tags: [listTag('galleryImage')] }),
  ]);

  const coords = settings?.address.coordinates;
  const bandImages = gallery.slice(0, 3);
  const bandLinks = [
    { label: 'Tedavi', href: '/hizmetler' },
    { label: 'Bloglar', href: '/blog' },
    { label: 'Dost Sahiplenin', href: '/galeri' },
  ];

  return (
    <>
      <Hero
        title={settings?.clinicName ?? 'Veteriner Kliniği'}
        subtitle={settings?.tagline}
        cta={{ label: 'Randevu Alın', href: '/iletisim' }}
        slides={settings?.heroSlides}
      />

      {/* Legacy "BİZİ ZİYARET EDİN" navy cards on light gray, pulled over the hero. */}
      {settings ? (
        <section aria-label="Hızlı bilgiler" className="bg-ink-50">
          <div className="mx-auto -mt-14 max-w-6xl px-4 pb-14 sm:px-6">
            <div className="relative z-10 grid gap-5 sm:grid-cols-3">
              <VisitCard title="Bizi Ziyaret Edin">
                <p>
                  {settings.address.street}, {settings.address.postalCode}{' '}
                  {settings.address.district}/{settings.address.city}
                </p>
              </VisitCard>
              <VisitCard title="Bizi Arayın">
                <a href={`tel:${settings.contact.primaryPhone}`} className="hover:underline">
                  {settings.contact.primaryPhone}
                </a>
                {settings.openingHours.isAlwaysOpen ? <p className="mt-1">7/24 Açık</p> : null}
              </VisitCard>
              <VisitCard title="Bize Mail Yazın">
                <a href={`mailto:${settings.contact.email}`} className="hover:underline">
                  {settings.contact.email}
                </a>
              </VisitCard>
            </div>
          </div>
        </section>
      ) : null}

      {/* Legacy home map embed. */}
      {coords?.lat != null && coords.lng != null ? (
        <section aria-label="Harita">
          <iframe
            title="Klinik konumu"
            src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
            className="h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      ) : null}

      {/* Legacy welcome: doghouse illustration left, text right. */}
      {settings ? (
        <section aria-labelledby="welcome-heading" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Image
                src="/welcome-illustration.png"
                alt=""
                width={640}
                height={520}
                className="mx-auto h-auto w-full max-w-xl"
              />
            </div>
            <div className="lg:col-span-5">
              <p className="text-base font-semibold text-brand-600">Hoşgeldiniz</p>
              <h2
                id="welcome-heading"
                className="mt-1 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl"
              >
                Kalite ve Birikim <span className="text-brand-600">{settings.clinicName}</span>
              </h2>
              {settings.tagline ? (
                <p className="mt-5 leading-relaxed text-ink-700">{settings.tagline}</p>
              ) : null}
              {settings.footerText ? (
                <p className="mt-3 leading-relaxed text-ink-700">{settings.footerText}</p>
              ) : null}
              <Link
                href="/hakkimizda"
                className="mt-8 inline-flex rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Bizi Tanıyın
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Legacy dark photo band (Tedavi / Bloglar / Dost Sahiplenin). */}
      {bandImages.length === 3 ? (
        <section aria-label="Keşfedin" className="bg-ink-900 pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-6 pt-20 sm:grid-cols-3">
              {bandLinks.map((item, i) => {
                const img = bandImages[i];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative block aspect-4/5 overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {img?.image.asset ? (
                      <Image
                        src={urlFor(img.image).width(600).height(750).url()}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : null}
                    <span className="absolute inset-0 bg-linear-to-t from-ink-900/80 to-transparent" />
                    <span className="absolute bottom-5 left-5 text-2xl font-bold text-white">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Legacy services icon grid: 72px line icons + Changa titles, 2 columns. */}
      {services.length > 0 ? (
        <section
          aria-labelledby="services-heading"
          className="mx-auto max-w-6xl px-4 py-24 sm:px-6"
        >
          <SectionHeading
            kicker="Sizin için Neler Sunuyoruz?"
            title="Sunduğumuz Hizmetler"
            id="services-heading"
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-x-12 gap-y-10 sm:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service._id}
                href={`/hizmetler/${service.slug}`}
                className="group flex items-center gap-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
              >
                <ServiceIcon title={service.title} />
                <h3 className="text-xl font-bold text-ink-900 transition group-hover:text-brand-600">
                  {service.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Legacy "Neden Biz" split on the soft-teal panel. */}
      {settings ? (
        <section aria-labelledby="why-heading" className="bg-teal-soft">
          <div className="mx-auto grid max-w-6xl items-stretch gap-0 px-0 lg:grid-cols-2">
            <div className="relative min-h-72">
              {gallery[3]?.image.asset ? (
                <Image
                  src={urlFor(gallery[3].image).width(1000).height(900).url()}
                  alt={gallery[3].image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="px-6 py-16 sm:px-10">
              <p className="text-base font-semibold text-brand-700">Neden Biz</p>
              <h2 id="why-heading" className="mt-1 text-4xl font-bold tracking-tight text-ink-900">
                Neden {settings.clinicName.replace(' Kliniği', '')}
              </h2>
              {settings.footerText ? (
                <p className="mt-5 leading-relaxed text-ink-700">{settings.footerText}</p>
              ) : null}
              <h3 className="mt-8 text-2xl font-bold text-ink-900">Hizmetlerimiz</h3>
              <ul className="mt-3 space-y-1.5 text-ink-700">
                {services.slice(0, 6).map((s) => (
                  <li key={s._id}>– {s.title}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <TeamSection members={team} />

      {/* Legacy gallery preview. */}
      {gallery.length > 0 ? (
        <section aria-labelledby="gallery-heading" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionHeading kicker="Resim Keşfi" title="Galerimiz" id="gallery-heading" />
          <div className="mt-12 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
            {gallery.slice(0, 6).map((item) => (
              <div key={item._id} className="overflow-hidden rounded-lg">
                {item.image.asset ? (
                  <Image
                    src={urlFor(item.image).width(700).url()}
                    alt={item.image.alt}
                    width={700}
                    height={500}
                    className="h-auto w-full"
                  />
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/galeri"
              className="inline-flex rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Tüm Galeriyi Gör
            </Link>
          </div>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section aria-labelledby="blog-heading" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <SectionHeading kicker="Bloglarımız" title="Son Yazılar" id="blog-heading" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
