import { describe, expect, it } from 'vitest';

import { flowPlanPhase } from './planReview';

const snapshot = {
  flowId: 'flow',
  title: 'Send message',
  entryNodeId: 'entry',
  nodes: [],
  edges: [],
};

describe('flow plan review phase', () => {
  it('distinguishes approval from execution and leaves checklist-only plans alone', () => {
    expect(flowPlanPhase(undefined)).toBeUndefined();
    expect(
      flowPlanPhase({ run: { status: 'planned', flowSnapshots: null, planConfirmedAt: null } }),
    ).toBeUndefined();
    expect(
      flowPlanPhase({
        run: { status: 'planned', flowSnapshots: [snapshot], planConfirmedAt: null },
      }),
    ).toBe('awaiting');
    expect(
      flowPlanPhase({
        run: { status: 'planned', flowSnapshots: [snapshot], planConfirmedAt: new Date() },
      }),
    ).toBe('confirmed');
    expect(
      flowPlanPhase({
        run: {
          status: 'collecting_evidence',
          flowSnapshots: [snapshot],
          planConfirmedAt: new Date(),
        },
      }),
    ).toBeUndefined();
  });
});
