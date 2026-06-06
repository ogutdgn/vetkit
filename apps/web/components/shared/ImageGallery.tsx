import Image from 'next/image';

import { urlFor } from '@/lib/sanity/image';
import type { GalleryImagesQueryResult } from '@/types/sanity';

const CATEGORY_LABELS: Record<string, string> = {
  'klinik-ici': 'Klinik içi',
  tedavi: 'Tedavi',
  ekip: 'Ekip',
  hastalar: 'Hastalar',
};

// Shared, template-independent gallery grid (CLAUDE.md §4). A lightbox can
// come later with shadcn (Chunk 14) if a client asks; the grid is fully
// usable without JS.
export function ImageGallery({ images }: { images: GalleryImagesQueryResult }) {
  if (images.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((item) => (
        <figure
          key={item._id}
          className="group overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm"
        >
          <div className="relative aspect-4/3 bg-ink-100">
            {item.image.asset ? (
              <Image
                src={urlFor(item.image).width(800).height(600).url()}
                alt={item.image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            ) : null}
          </div>
          {item.caption || item.category ? (
            <figcaption className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
              <span className="text-ink-700">{item.caption}</span>
              {item.category ? (
                <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
