'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { urlFor } from '@/lib/sanity/image';
import type { HeroSlideData } from '@/types/template';

const INTERVAL_MS = 6000;

// Internal to the modern Hero — the legacy-theme full-width slider
// (2026-06-07 design decision), rebuilt natively. Accessibility posture:
// inactive slides are `inert` (out of tab order and the a11y tree), the page
// h1 lives OUTSIDE the rotation (sr-only, first slide's heading), autoplay
// pauses on hover/focus, stops permanently on manual navigation, and is
// disabled under prefers-reduced-motion.
export function HeroCarousel({ slides }: { slides: HeroSlideData[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setStopped(true); // manual navigation wins — no surprise auto-advance after
      setActive((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (paused || stopped || reducedMotion || slides.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, stopped, reducedMotion, slides.length]);

  const first = slides[0];

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
      {/* The page h1 stays outside the rotation so assistive tech always
          finds it, whatever slide is active. */}
      {first ? <h1 className="sr-only">{first.heading}</h1> : null}
      <div aria-live={paused || stopped || reducedMotion ? 'polite' : 'off'}>
        {slides.map((slide, i) => (
          <div
            key={slide._key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}`}
            inert={i !== active}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === active ? 'opacity-100' : 'opacity-0'
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
            <div className="absolute inset-0 bg-linear-to-r from-ink-900/85 via-ink-900/60 to-ink-900/25" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                {slide.subheading ? (
                  <p className="text-sm font-semibold tracking-widest text-brand-300 uppercase">
                    {slide.subheading}
                  </p>
                ) : null}
                <p className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  {slide.heading}
                </p>
                {slide.cta ? (
                  <Link
                    href={slide.cta.href}
                    {...(slide.cta.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="mt-8 inline-flex rounded-lg bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {slide.cta.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Önceki slayt"
            onClick={() => goTo(active - 1)}
            className="absolute top-1/2 left-3 inline-flex -translate-y-1/2 rounded-full bg-ink-900/40 p-2.5 text-white backdrop-blur transition hover:bg-ink-900/70 focus-visible:outline-2 focus-visible:outline-white"
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
            className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 rounded-full bg-ink-900/40 p-2.5 text-white backdrop-blur transition hover:bg-ink-900/70 focus-visible:outline-2 focus-visible:outline-white"
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
          <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2">
            {slides.map((slide, i) => (
              <button
                key={slide._key}
                type="button"
                aria-label={`Slayt ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className="group/dot p-2 focus-visible:outline-2 focus-visible:outline-white"
              >
                <span
                  className={`block size-2.5 rounded-full transition ${
                    i === active ? 'bg-brand-500' : 'bg-white/60 group-hover/dot:bg-white'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
