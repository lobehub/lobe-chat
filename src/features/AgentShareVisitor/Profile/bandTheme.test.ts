import { describe, expect, it } from 'vitest';

import { buildBandTheme } from './bandTheme';

const lightnessOf = (hsl: string) => Number(/(\d+)%\)$/.exec(hsl)?.[1]);
const hueOf = (hsl: string) => Number(/hsl\((\d+)/.exec(hsl)?.[1]);

describe('buildBandTheme', () => {
  it('darkens a pale avatar colour instead of using it as a full-width surface', () => {
    // The colour that shipped unreadable: near-white ink on raw #FFE9E0.
    const theme = buildBandTheme('#FFE9E0');

    expect(lightnessOf(theme.field)).toBeLessThanOrEqual(20);
    expect(lightnessOf(theme.accent)).toBeLessThanOrEqual(45);
  });

  it('keeps the creator’s hue so two agents do not share a header', () => {
    const warm = buildBandTheme('#FFE9E0');
    const cool = buildBandTheme('#5a97db');

    expect(hueOf(warm.field)).not.toBe(hueOf(cool.field));
  });

  it('floors the saturation of a grey colour so the band never reads as flat chrome', () => {
    const theme = buildBandTheme('#888888');

    expect(Number(/hsl\(\d+ (\d+)%/.exec(theme.field)?.[1])).toBeGreaterThanOrEqual(22);
  });

  it('falls back for a missing or unparseable colour rather than throwing', () => {
    expect(() => buildBandTheme(null)).not.toThrow();
    expect(() => buildBandTheme('rebeccapurple')).not.toThrow();
    expect(lightnessOf(buildBandTheme('rgb(1,2,3)').field)).toBe(18);
  });

  it('accepts the shorthand hex form', () => {
    expect(hueOf(buildBandTheme('#f00').field)).toBe(0);
  });
});
