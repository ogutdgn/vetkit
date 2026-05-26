// Locale primitives and helpers used by the locale-aware schema types.

export const SUPPORTED_LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

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

export function defaultSlugify(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}
