import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@/lib/sanity/image';
import { sanityFetch } from '@/lib/sanity/live';
import {
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

/** Old-theme section header: small brand kicker over a centered title. */
function SectionHeading({ kicker, title, id }: { kicker: string; title: string; id: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">{kicker}</p>
      <h2 id={id} className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

export default async function HomePage() {
  const { Hero, BlogCard, TeamSection } = await getTemplate();

  const [settings, services, posts, team] = await Promise.all([
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
    sanityFetch({ query: servicesListQuery, tags: [listTag('service')] }),
    sanityFetch({ query: homeBlogPostsQuery, tags: [listTag('blogPost'), listTag('teamMember')] }),
    sanityFetch({ query: teamMembersListQuery, tags: [listTag('teamMember')] }),
  ]);

  const hours = settings?.openingHours;
  const hoursSummary = hours?.isAlwaysOpen ? '7/24 Açık' : 'Çalışma saatlerimiz için tıklayın';

  return (
    <>
      <Hero
        title={settings?.clinicName ?? 'Veteriner Kliniği'}
        subtitle={settings?.tagline}
        cta={{ label: 'Randevu Alın', href: '/iletisim' }}
        slides={settings?.heroSlides}
      />

      {/* Info-card row overlapping the hero (legacy-theme pattern). */}
      {settings ? (
        <section
          aria-label="Hızlı bilgiler"
          className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/iletisim"
              className="rounded-xl bg-brand-600 p-6 text-white shadow-lg transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <p className="text-sm font-semibold tracking-wide uppercase">Çalışma Saatleri</p>
              <p className="mt-2 text-lg font-bold">{hoursSummary}</p>
              {hours?.emergencyNote ? (
                <p className="mt-1 text-sm text-white">{hours.emergencyNote}</p>
              ) : null}
            </Link>
            <a
              href={settings.address.googleMapsUrl ?? '/iletisim'}
              {...(settings.address.googleMapsUrl
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="rounded-xl bg-ink-900 p-6 text-white shadow-lg transition hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
            >
              <p className="text-sm font-semibold tracking-wide uppercase">Adres</p>
              <p className="mt-2 text-lg font-bold">
                {settings.address.district}/{settings.address.city}
              </p>
              <p className="mt-1 text-sm text-white">{settings.address.street}</p>
            </a>
            <a
              href={`tel:${settings.contact.primaryPhone}`}
              className="rounded-xl bg-brand-600 p-6 text-white shadow-lg transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <p className="text-sm font-semibold tracking-wide uppercase">İletişim</p>
              <p className="mt-2 text-lg font-bold">{settings.contact.primaryPhone}</p>
              <p className="mt-1 text-sm text-white">7/24 acil hattımız açık</p>
            </a>
          </div>
        </section>
      ) : null}

      {/* Welcome (legacy "Hoşgeldiniz" section). */}
      {settings ? (
        <section
          aria-labelledby="welcome-heading"
          className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
        >
          <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">
            Hoşgeldiniz
          </p>
          <h2
            id="welcome-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl"
          >
            {settings.clinicName}
          </h2>
          {settings.tagline ? (
            <p className="mt-4 text-lg leading-relaxed text-ink-700">{settings.tagline}</p>
          ) : null}
          {settings.footerText ? (
            <p className="mt-3 leading-relaxed text-ink-700">{settings.footerText}</p>
          ) : null}
          <Link
            href="/hakkimizda"
            className="mt-8 inline-flex rounded-lg border border-brand-600 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Bizi Tanıyın
          </Link>
        </section>
      ) : null}

      {/* Services as legacy icon rows (photo thumb as the icon). */}
      {services.length > 0 ? (
        <section aria-labelledby="services-heading" className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionHeading
              kicker="Sizin için neler sunuyoruz?"
              title="Sunduğumuz Hizmetler"
              id="services-heading"
            />
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {services.map((service) => (
                <Link
                  key={service._id}
                  href={`/hizmetler/${service.slug}`}
                  className="group flex items-start gap-4 rounded-xl p-3 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-brand-100 bg-ink-100">
                    {(service.icon ?? service.mainImage).asset ? (
                      <Image
                        src={urlFor(service.icon ?? service.mainImage)
                          .width(128)
                          .height(128)
                          .url()}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span>
                    <h3 className="text-lg font-semibold text-ink-900 transition group-hover:text-brand-700">
                      {service.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-700">
                      {service.shortDescription}
                    </p>
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/hizmetler"
                className="inline-flex rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Tüm Hizmetlerimiz
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <TeamSection members={team} />

      {posts.length > 0 ? (
        <section aria-labelledby="blog-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading kicker="Bloglarımız" title="Son Yazılar" id="blog-heading" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
