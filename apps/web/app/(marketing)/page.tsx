import type { Metadata } from 'next';

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

export default async function HomePage() {
  const { Hero, ServiceCard, BlogCard, TeamSection } = await getTemplate();

  const [settings, services, posts, team] = await Promise.all([
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
    sanityFetch({ query: servicesListQuery, tags: [listTag('service')] }),
    sanityFetch({ query: homeBlogPostsQuery, tags: [listTag('blogPost'), listTag('teamMember')] }),
    sanityFetch({ query: teamMembersListQuery, tags: [listTag('teamMember')] }),
  ]);

  return (
    <>
      <Hero
        title={settings?.clinicName ?? 'Veteriner Kliniği'}
        subtitle={settings?.tagline}
        cta={{ label: 'Randevu Alın', href: '/iletisim' }}
      />
      {services.length > 0 ? (
        <section
          aria-labelledby="services-heading"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
        >
          <h2 id="services-heading" className="text-3xl font-bold tracking-tight text-ink-900">
            Hizmetlerimiz
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </section>
      ) : null}
      <TeamSection members={team} />
      {posts.length > 0 ? (
        <section aria-labelledby="blog-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="blog-heading" className="text-3xl font-bold tracking-tight text-ink-900">
            Blogdan
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
