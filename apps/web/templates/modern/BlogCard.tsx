import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@/lib/sanity/image';
import type { BlogCardProps } from '@/types/template';

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

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/blog/${post.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <div className="relative aspect-video overflow-hidden bg-ink-100">
          {post.coverImage.asset ? (
            <Image
              src={urlFor(post.coverImage).width(1200).height(675).url()}
              alt={post.coverImage.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : null}
          {post.category ? (
            <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-brand-800 backdrop-blur">
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
          ) : null}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-ink-900 transition group-hover:text-brand-700">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-700">{post.excerpt}</p>
          <p className="mt-3 text-xs text-ink-700">
            <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>
            {post.author ? <> · {post.author.name}</> : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
