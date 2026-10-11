import { describe, expect, it } from 'vitest';

import { litSegments } from './UsageMeter';

describe('litSegments', () => {
  it('lights nothing without a reading or at zero', () => {
    expect(litSegments(undefined)).toBe(0);
    expect(litSegments(null)).toBe(0);
    expect(litSegments(0)).toBe(0);
  });

  it('lights at least one tick for any non-zero usage', () => {
    expect(litSegments(0.5)).toBe(1);
  });

  it('scales to the segment count and clamps overload', () => {
    expect(litSegments(50)).toBe(20);
    expect(litSegments(150)).toBe(40);
  });
});
