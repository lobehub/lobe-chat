import { describe, expect, it } from 'vitest';

import { pickThreadUsageBaseline } from '../threadRunHooks';

describe('pickThreadUsageBaseline', () => {
  it('ignores legacy totalSteps when no versioned LLM baseline exists', () => {
    const baseline = pickThreadUsageBaseline({ totalSteps: 9 } as any);

    // Legacy `totalSteps` is in execution-step units; reusing it would mix units.
    expect(baseline.totalLlmCalls).toBeUndefined();
  });

  it('uses the versioned totalLlmCalls baseline', () => {
    const baseline = pickThreadUsageBaseline({ totalLlmCalls: 3, totalSteps: 9 } as any);

    expect(baseline.totalLlmCalls).toBe(3);
  });
});
