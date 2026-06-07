import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@/lib/sanity/image';
import type { HeroProps } from '@/types/template';

import { HeroCarousel } from './HeroCarousel';

// Renders the page's single <h1> — pages must not add another (CLAUDE.md §5
// keeps h1 out of editor content for the same reason).
export function Hero({ title, subtitle, media, cta, slides }: HeroProps) {
  if (slides?.length) return <HeroCarousel slides={slides} />;
  return (
    <section className="bg-ink-900">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
          {subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-ink-300">{subtitle}</p>
          ) : null}
          {cta ? (
            <Link
              href={cta.href}
              className="mt-8 inline-flex rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
        {media?.asset ? (
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-lg">
            <Image
              src={urlFor(media).width(1200).height(900).url()}
              alt={media.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
