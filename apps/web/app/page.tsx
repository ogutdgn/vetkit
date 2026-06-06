import { NAV_ITEMS } from '@/lib/navigation';
import { sanityFetch } from '@/lib/sanity/live';
import {
  blogPostsListQuery,
  servicesListQuery,
  siteSettingsQuery,
  teamMembersListQuery,
} from '@/lib/sanity/queries';
import { listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { getTemplate } from '@/lib/template';

// Home page rendered through the template (Chunk 10 integration). The full
// marketing layout (sections, copy, hero media) is refined in Chunk 11.
export default async function HomePage() {
  const { Header, Hero, ServiceCard, BlogCard, TeamSection, Footer } = await getTemplate();

  const [settings, services, posts, team] = await Promise.all([
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
    sanityFetch({ query: servicesListQuery, tags: [listTag('service')] }),
    sanityFetch({ query: blogPostsListQuery, tags: [listTag('blogPost'), listTag('teamMember')] }),
    sanityFetch({ query: teamMembersListQuery, tags: [listTag('teamMember')] }),
  ]);

  if (!settings) {
    return (
      <main className="mx-auto max-w-2xl px-8 py-16">
        <h1 className="text-2xl font-semibold text-ink-900">Kurulum eksik</h1>
        <p className="mt-2 text-ink-700">
          Sanity Studio&apos;da &quot;Klinik Bilgileri&quot; henüz doldurulmamış.
        </p>
      </main>
    );
  }

  return (
    <>
      <Header settings={settings} navItems={NAV_ITEMS} />
      <main>
        <Hero
          title={settings.clinicName}
          subtitle={settings.tagline}
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
      </main>
      <Footer settings={settings} navItems={NAV_ITEMS} />
    </>
  );
}
