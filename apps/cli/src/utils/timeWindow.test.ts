import { describe, expect, it } from 'vitest';

import { parseTimePoint, parseTimeWindow } from './timeWindow';

const now = new Date('2026-10-19T12:00:00.000Z');

describe('parseTimePoint', () => {
  it('counts relative values back from now', () => {
    expect(parseTimePoint('24h', 'start', now)).toEqual(new Date('2026-10-18T12:00:00.000Z'));
    expect(parseTimePoint('7d', 'start', now)).toEqual(new Date('2026-10-12T12:00:00.000Z'));
    expect(parseTimePoint('2W', 'start', now)).toEqual(new Date('2026-10-05T12:00:00.000Z'));
  });

  it('reads a bare date as a whole local day', () => {
    expect(parseTimePoint('2026-10-18', 'start')).toEqual(new Date(2026, 9, 18, 0, 0, 0, 0));
    expect(parseTimePoint('2026-10-18', 'end')).toEqual(new Date(2026, 9, 18, 23, 59, 59, 999));
  });

  it('accepts ISO timestamps as-is', () => {
    expect(parseTimePoint('2026-10-11T16:00:00Z', 'start')).toEqual(
      new Date('2026-10-11T16:00:00.000Z'),
    );
  });

  it('rejects unparseable input', () => {
    expect(() => parseTimePoint('last week', 'start')).toThrow('Invalid time "last week"');
  });
});

describe('parseTimeWindow', () => {
  it('rejects an inverted window', () => {
    expect(() => parseTimeWindow({ since: '2026-10-18', until: '2026-10-12' })).toThrow(
      '--since must be earlier than --until.',
    );
  });

  it('leaves unset edges open', () => {
    expect(parseTimeWindow({})).toEqual({});
  });
});
