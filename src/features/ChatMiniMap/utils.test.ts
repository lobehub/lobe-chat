import { describe, expect, it } from 'vitest';

import {
  getIndicatorWidth,
  MAX_INDICATOR_WIDTH,
  MESSAGE_INLINE_PADDING,
  RAIL_INSET_END,
} from './utils';

describe('minimap rail footprint', () => {
  it('fits inside the message column inline-end padding', () => {
    expect(RAIL_INSET_END + MAX_INDICATOR_WIDTH).toBeLessThan(MESSAGE_INLINE_PADDING);
  });

  it('caps the widest dash at MAX_INDICATOR_WIDTH', () => {
    expect(getIndicatorWidth('x'.repeat(500))).toBe(MAX_INDICATOR_WIDTH);
    expect(getIndicatorWidth('')).toBe(5);
  });
});
