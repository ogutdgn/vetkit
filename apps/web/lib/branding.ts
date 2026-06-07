// Brand customization pipeline (CLAUDE.md §2.5): siteSettings.brandColor.hex
// overrides the template's default `--color-brand-*` scale at runtime. The
// root layout spreads the returned vars as inline style on <html>; Tailwind
// v4 utilities reference the vars, so every `bg-brand-600` etc. recolors
// without a rebuild.
//
// A single hex can't fill a 10-step scale, so we convert it to OKLCH and
// re-ramp the template's default lightness/chroma curve around the brand hue.
// The step whose lightness is closest to the brand color carries the exact
// brand value.

/** The modern template's default ramp: [step, lightness, chroma]. */
const SCALE: readonly (readonly [number, number, number])[] = [
  [50, 0.97, 0.02],
  [100, 0.93, 0.05],
  [200, 0.86, 0.09],
  [300, 0.78, 0.13],
  [400, 0.7, 0.16],
  [500, 0.62, 0.18],
  [600, 0.54, 0.17],
  [700, 0.46, 0.15],
  [800, 0.38, 0.12],
  [900, 0.3, 0.09],
];

/** Chroma of the ramp's 600 step — the anchor a brand hex typically maps to. */
const ANCHOR_CHROMA = 0.17;

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** sRGB hex → OKLCH via OKLab (Björn Ottosson's reference matrices). */
export function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(srgbToLinear) as [number, number, number];

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const c = Math.sqrt(a * a + bb * bb);
  const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

/** OKLab → linear sRGB (Ottosson inverse matrices), channels clamped to gamut. */
function oklchToLinearRgb(l: number, c: number, h: number): [number, number, number] {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return [
    clamp(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    clamp(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    clamp(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ];
}

/** WCAG contrast ratio of white text over the given OKLCH background. */
function whiteContrast(l: number, c: number, h: number): number {
  const [r, g, b] = oklchToLinearRgb(l, c, h);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (luminance + 0.05);
}

/**
 * The lightness clamp alone is hue-blind (a vivid green at OKLCH L 0.54 is
 * far more luminous than a red at the same L), so the white-text steps get a
 * real WCAG check: lower lightness until white text clears AA (4.5:1).
 */
function ensureWhiteContrast(l: number, c: number, h: number): number {
  let adjusted = l;
  while (adjusted > 0.05 && whiteContrast(adjusted, c, h) < 4.5) adjusted -= 0.01;
  return adjusted;
}

/** Below this OKLCH chroma the hue is floating-point noise — treat as gray. */
const ACHROMATIC_THRESHOLD = 0.005;

/**
 * CSS custom-property overrides for the brand scale, or {} when no/invalid
 * hex (the template's tokens.css defaults then apply).
 *
 * Guard rails (Chunk 10 review):
 * - Achromatic brands (gray/black/white) get a pure neutral ramp — the
 *   chroma floor would otherwise tint the site with a noise-derived hue.
 * - The exact brand value substitutes only into the mid steps (400–700,
 *   where the brand color actually appears as a surface), and never lighter
 *   than the step's default lightness — steps 600/700 sit under white text,
 *   so a light brand hex must not float them above the contrast floor.
 */
export function brandStyleVars(hex: string | undefined): Record<string, string> {
  if (!hex) return {};
  const brand = hexToOklch(hex);
  if (!brand) return {};

  const isAchromatic = brand.c < ACHROMATIC_THRESHOLD;
  // Preserve how muted/saturated the brand is relative to the default ramp.
  const chromaScale = isAchromatic ? 0 : Math.min(Math.max(brand.c / ANCHOR_CHROMA, 0.15), 1.15);

  // The mid step nearest the brand's own lightness carries the brand value.
  let nearest: readonly [number, number, number] | null = null;
  if (!isAchromatic) {
    for (const step of SCALE) {
      if (step[0] < 400 || step[0] > 700) continue;
      if (!nearest || Math.abs(step[1] - brand.l) < Math.abs(nearest[1] - brand.l)) nearest = step;
    }
  }

  const vars: Record<string, string> = {};
  for (const [step, lightness, chroma] of SCALE) {
    const isExact = step === nearest?.[0];
    let l = isExact ? Math.min(brand.l, lightness) : lightness;
    const c = isExact ? brand.c : chroma * chromaScale;
    // 600/700 sit under white text throughout the templates.
    if (step === 600 || step === 700) l = ensureWhiteContrast(l, c, brand.h);
    vars[`--color-brand-${step}`] = `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${brand.h.toFixed(2)})`;
  }
  return vars;
}
