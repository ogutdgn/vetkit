import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@/lib/sanity/image';
import type { ServiceCardProps } from '@/types/template';

const PET_LABELS: Record<string, string> = {
  dog: 'Köpek',
  cat: 'Kedi',
  bird: 'Kuş',
  rabbit: 'Tavşan',
  exotic: 'Egzotik',
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/hizmetler/${service.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-ink-100">
          {service.mainImage.asset ? (
            <Image
              src={urlFor(service.mainImage).width(800).height(600).url()}
              alt={service.mainImage.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : null}
          {service.emergencyAvailable ? (
            <span className="absolute top-3 left-3 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              Acil
            </span>
          ) : null}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-ink-900 transition group-hover:text-brand-700">
            {service.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-700">
            {service.shortDescription}
          </p>
          {service.petTypes?.length ? (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Hayvan türleri">
              {service.petTypes.map((pet) => (
                <li
                  key={pet}
                  className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800"
                >
                  {PET_LABELS[pet] ?? pet}
                </li>
              ))}
            </ul>
          ) : null}
          {service.pricing ? (
            <p className="mt-3 text-sm font-medium text-brand-700">{service.pricing}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
