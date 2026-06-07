import type { Metadata } from 'next';

import { sanityFetch } from '@/lib/sanity/live';
import { blogPostsListQuery, siteSettingsQuery } from '@/lib/sanity/queries';
import { listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getTemplate } from '@/lib/template';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] });
  return buildPageMetadata({
    title: 'Blog',
    description: 'Evcil hayvan sağlığı, beslenme ve bakım üzerine yazılarımız.',
    path: '/blog',
    clinicName: settings?.clinicName,
  });
}

export default async function BlogPage() {
  const [{ BlogCard }, posts] = await Promise.all([
    getTemplate(),
    // author-> is dereferenced, so teamMember edits must bust this list too.
    sanityFetch({ query: blogPostsListQuery, tags: [listTag('blogPost'), listTag('teamMember')] }),
  ]);

  return (
    <>
      <section className="bg-ink-900">
        <div className="mx-auto max-w-6xl px-4 pt-36 pb-14 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white">Blog</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-300">
            Evcil hayvan sağlığı, beslenme ve bakım üzerine yazılarımız.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="sr-only">Tüm yazılar</h2>
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-ink-700">Henüz blog yazısı yayınlanmadı.</p>
        )}
      </section>
    </>
  );
}
