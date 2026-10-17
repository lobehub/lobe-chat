import { describe, expect, it } from 'vitest';

import { resolvePullRequestActionLock } from '../actionLock';

const context = {
  baseBehindBy: 0,
  requiredChecks: ['ci'],
  viewerCanBypass: true,
  viewerCanWrite: true,
};
const live = {
  confirmed: true,
  context,
  contextConfirmed: true,
  contextError: undefined,
  detailConfirmed: true,
};

describe('resolvePullRequestActionLock', () => {
  it('unlocks once the PR and its merge context are live', () => {
    expect(resolvePullRequestActionLock(live)).toEqual({
      context,
      locked: false,
      policyLocked: false,
    });
  });

  it('locks every action until the PR itself is confirmed', () => {
    expect(resolvePullRequestActionLock({ ...live, confirmed: false }).locked).toBe(true);
    expect(resolvePullRequestActionLock({ ...live, detailConfirmed: false }).locked).toBe(true);
  });

  // Regression: a persisted merge context hydrated before its live read, so
  // merge / update / bypass / base change unlocked on last session's policy.
  it('paints a persisted merge context but locks policy actions until it is live', () => {
    expect(resolvePullRequestActionLock({ ...live, contextConfirmed: false })).toEqual({
      context,
      locked: false,
      policyLocked: true,
    });
  });

  it('drops the persisted policy instead of locking forever when the live read fails', () => {
    expect(
      resolvePullRequestActionLock({
        ...live,
        contextConfirmed: false,
        contextError: new Error('gh failed'),
      }),
    ).toEqual({ context: undefined, locked: false, policyLocked: false });
  });

  it('keeps a confirmed context through a later failed refresh', () => {
    expect(
      resolvePullRequestActionLock({ ...live, contextError: new Error('gh failed') }).context,
    ).toBe(context);
  });
});
