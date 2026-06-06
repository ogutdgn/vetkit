import Image from 'next/image';

import { urlFor } from '@/lib/sanity/image';
import type { TeamSectionProps } from '@/types/template';

const SPECIALTY_LABELS: Record<string, string> = {
  cerrahi: 'Cerrahi',
  dahiliye: 'Dahiliye',
  jinekoloji: 'Jinekoloji',
  cildiye: 'Cildiye',
  davranis: 'Davranış',
  acil: 'Acil',
};

export function TeamSection({ members }: TeamSectionProps) {
  if (members.length === 0) return null;

  return (
    <section aria-labelledby="team-heading" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="team-heading" className="text-3xl font-bold tracking-tight text-ink-900">
          Ekibimiz
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <article
              key={member._id}
              className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm"
            >
              <div className="relative aspect-3/4 bg-ink-100">
                {member.photo.asset ? (
                  <Image
                    src={urlFor(member.photo).width(600).height(800).url()}
                    alt={member.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-ink-900">{member.name}</h3>
                <p className="text-sm font-medium text-brand-700">{member.title}</p>
                {member.specialties?.length ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Uzmanlık alanları">
                    {member.specialties.map((s) => (
                      <li
                        key={s}
                        className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700"
                      >
                        {SPECIALTY_LABELS[s] ?? s}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {member.shortBio ? (
                  // No clamp — members have no detail page, so clamped text
                  // would be unreachable for sighted users.
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">{member.shortBio}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
