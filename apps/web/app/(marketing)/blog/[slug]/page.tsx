import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortableTextRenderer } from '@/components/shared/PortableTextRenderer';
import { client } from '@/lib/sanity/client';
import { urlFor } from '@/lib/sanity/image';
import { sanityFetch } from '@/lib/sanity/live';
import {
  blogPostByIdQuery,
  blogPostIdBySlugQuery,
  blogPostSlugsQuery,
  siteSettingsQuery,
} from '@/lib/sanity/queries';
import { docTag, listTag, siteSettingsTag } from '@/lib/sanity/tags';
import { buildPageMetadata } from '@/lib/seo/metadata';

const CATEGORY_LABELS: Record<string, string> = {
  genel: 'Genel',
  beslenme: 'Beslenme',
  asilama: 'Aşılama',
  davranis: 'Davranış',
  acil: 'Acil',
};

const dateFormat = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'long',
  timeZone: 'Europe/Istanbul',
});

interface Params {
  params: Promise<{ slug: string }>;
}

// OD-5 two-step: slug→_id (list-tagged), then the doc tagged with its docTag
// + the dereferenced teamMember (author) and service lists.
async function getPost(slug: string) {
  const id = await sanityFetch({
    query: blogPostIdBySlugQuery,
    params: { slug },
    tags: [listTag('blogPost')],
  });
  if (!id) return null;
  return sanityFetch({
    query: blogPostByIdQuery,
    params: { id },
    tags: [docTag('blogPost', id), listTag('teamMember'), listTag('service')],
  });
}

export async function generateStaticParams() {
  // Plain client: generateStaticParams runs at build time without a request,
  // so the draft-aware sanityFetch (await draftMode()) is not allowed here.
  const slugs = await client.fetch(
    blogPostSlugsQuery,
    {},
    { next: { tags: [listTag('blogPost')] } },
  );
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getPost(slug),
    sanityFetch({ query: siteSettingsQuery, tags: [siteSettingsTag] }),
  ]);
  if (!post) return {};
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    seo: post.seo,
    path: `/blog/${slug}`,
    clinicName: settings?.clinicName,
  });
}

export default async function BlogYaziPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article>
      <section className="bg-linear-to-b from-brand-50 to-ink-50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          {post.category ? (
            <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">
              {CATEGORY_LABELS[post.category] ?? post.category}
            </p>
          ) : null}
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink-900">{post.title}</h1>
          <p className="mt-4 text-sm text-ink-700">
            <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>
            {post.author ? <> · {post.author.name}</> : null}
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {post.coverImage.asset ? (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl shadow-md">
            <Image
              src={urlFor(post.coverImage).width(1600).height(900).url()}
              alt={post.coverImage.alt}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : null}
        <PortableTextRenderer value={post.body} />
        {post.tags?.length ? (
          <ul className="mt-10 flex flex-wrap gap-2" aria-label="Etiketler">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700"
              >
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}
        {post.relatedServices?.length ? (
          <aside className="mt-10 rounded-xl border border-ink-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-ink-900">İlgili Hizmetlerimiz</h2>
            <ul className="mt-3 space-y-2">
              {post.relatedServices.map((s) => (
                <li key={s._id}>
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
