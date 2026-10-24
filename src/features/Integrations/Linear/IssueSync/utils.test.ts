import { describe, expect, it } from 'vitest';

import { mergeLinearSyncResults } from './utils';

const result = (overrides: Partial<Parameters<typeof mergeLinearSyncResults>[0][number]>) => ({
  closed: 0,
  created: 0,
  keptLocalEdits: 0,
  skipped: [],
  truncated: false,
  unchanged: 0,
  updated: 0,
  ...overrides,
});

describe('mergeLinearSyncResults', () => {
  it('adds up batches of one import', () => {
    expect(
      mergeLinearSyncResults([
        result({ created: 50 }),
        result({
          created: 2,
          skipped: [{ identifier: 'ENG-1', reason: 'running' }],
          updated: 1,
        }),
      ]),
    ).toEqual(
      result({ created: 52, skipped: [{ identifier: 'ENG-1', reason: 'running' }], updated: 1 }),
    );
  });
});
