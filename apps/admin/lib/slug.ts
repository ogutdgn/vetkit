// Turkish-aware slug helper (ported from apps/studio/lib/slug.ts). Slugs are
// unique per tenant; the admin generates them from titles/names.

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

function stripDiacritics(input: string): string {
  return input.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
}

export function turkishSlugify(input: string): string {
  const normalized = Array.from(input)
    .map((ch) => TURKISH_CHAR_MAP[ch] ?? ch)
    .join('');
  return stripDiacritics(normalized)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}
