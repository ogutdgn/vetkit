'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { urlFor } from '@/lib/sanity/image';
import type { HeroSlideData } from '@/types/template';

const INTERVAL_MS = 6000;

// Internal to the modern Hero — the legacy-theme full-width slider
// (2026-06-07 design decision), rebuilt natively: autoplay with pause on
// hover/focus, disabled entirely under prefers-reduced-motion.
export function HeroCarousel({ slides }: { slides: HeroSlideData[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  const goTo = useCallback(
    (index: number) => setActive((index + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2 || reducedMotion.current) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Tanıtım slaytları"
      className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-ink-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide._key}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} / ${slides.length}`}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === active ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {slide.image.asset ? (
            <Image
              src={urlFor(slide.image).width(1920).height(1080).url()}
              alt={slide.image.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-r from-ink-900/80 via-ink-900/50 to-ink-900/20" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              {slide.subheading ? (
                <p className="text-sm font-semibold tracking-widest text-brand-300 uppercase">
                  {slide.subheading}
                </p>
              ) : null}
              {i === 0 ? (
                <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  {slide.heading}
                </h1>
              ) : (
                <p className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  {slide.heading}
                </p>
              )}
              {slide.cta ? (
                <Link
                  href={slide.cta.href}
                  className="mt-8 inline-flex rounded-lg bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {slide.cta.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ))}
      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Önceki slayt"
            onClick={() => goTo(active - 1)}
            className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur transition hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white sm:inline-flex"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Sonraki slayt"
            onClick={() => goTo(active + 1)}
            className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur transition hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white sm:inline-flex"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2.5">
            {slides.map((slide, i) => (
              <button
                key={slide._key}
                type="button"
                aria-label={`Slayt ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className={`size-2.5 rounded-full transition focus-visible:outline-2 focus-visible:outline-white ${
                  i === active ? 'bg-brand-500' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
