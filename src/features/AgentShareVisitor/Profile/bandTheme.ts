/**
 * Colour derivation for the share profile's identity band.
 *
 * `agents.background_color` is chosen to sit behind a small round avatar, so it
 * is routinely a pale pastel. Using it raw as a full-width surface fails
 * contrast outright — under the dark theme the near-white body ink on a pale
 * peach is unreadable — and mixing it into the page canvas instead washes the
 * agent's identity away entirely.
 *
 * So the band keeps the creator's HUE and replaces its lightness: a deep field
 * at a fixed lightness, with fixed near-white inks on top. Contrast then holds
 * for every colour a creator can pick, and each shared agent still gets a
 * visibly different header from one implementation.
 */

/** Lightness of the band surface. Near-white ink on this clears 4.5:1 by a wide margin. */
const FIELD_LIGHTNESS = 18;
/** Lightness of the radial lift behind the avatar; enough to read as depth, not as a second surface. */
const LIFT_LIGHTNESS = 31;
/** Lightness of the filled primary action. White label on this clears 4.5:1. */
const ACCENT_LIGHTNESS = 42;

/** Below this the band reads as flat grey; above it a vivid avatar colour turns garish at full width. */
const MIN_FIELD_SATURATION = 22;
const MAX_FIELD_SATURATION = 36;
/** The action may stay more saturated than the surface — it is a small area. */
const MIN_ACCENT_SATURATION = 42;
const MAX_ACCENT_SATURATION = 58;

/** Hue used when the agent has no colour, or one we cannot parse. A neutral slate. */
const FALLBACK_HUE = 220;
const FALLBACK_SATURATION = 24;

export interface BandTheme {
  accent: string;
  accentHover: string;
  field: string;
  lift: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Parse `#rgb` / `#rrggbb` into HSL. Returns `undefined` for anything else —
 * the column is free text, so a named colour or `rgb()` string is possible and
 * must fall back rather than throw on a visitor-facing page.
 */
const hexToHsl = (hex: string): { hue: number; saturation: number } | undefined => {
  const normalized = hex.trim().replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) return undefined;

  const red = Number.parseInt(expanded.slice(0, 2), 16) / 255;
  const green = Number.parseInt(expanded.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(expanded.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) return { hue: FALLBACK_HUE, saturation: 0 };

  const lightness = (max + min) / 2;
  const saturation = delta / (lightness > 0.5 ? 2 - max - min : max + min);

  let hue: number;
  if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
  else if (max === green) hue = ((blue - red) / delta + 2) * 60;
  else hue = ((red - green) / delta + 4) * 60;

  return { hue: Math.round(hue), saturation: Math.round(saturation * 100) };
};

/** Derive the band's surface, lift and action colours from the agent's own colour. */
export const buildBandTheme = (backgroundColor?: null | string): BandTheme => {
  const parsed = (backgroundColor && hexToHsl(backgroundColor)) || {
    hue: FALLBACK_HUE,
    saturation: FALLBACK_SATURATION,
  };

  const hue = parsed.hue;
  const fieldSaturation = clamp(parsed.saturation, MIN_FIELD_SATURATION, MAX_FIELD_SATURATION);
  const accentSaturation = clamp(parsed.saturation, MIN_ACCENT_SATURATION, MAX_ACCENT_SATURATION);

  return {
    accent: `hsl(${hue} ${accentSaturation}% ${ACCENT_LIGHTNESS}%)`,
    accentHover: `hsl(${hue} ${accentSaturation}% ${ACCENT_LIGHTNESS - 7}%)`,
    field: `hsl(${hue} ${fieldSaturation}% ${FIELD_LIGHTNESS}%)`,
    lift: `hsl(${hue} ${Math.min(accentSaturation, 50)}% ${LIFT_LIGHTNESS}%)`,
  };
};
