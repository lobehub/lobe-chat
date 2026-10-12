import { describe, expect, it } from 'vitest';

import { coordinatorGateReason, coordinatorReasonCopies, coordinatorReasonCopy } from './goalCopy';

/**
 * The machine gate's question is English data written on the server; without a
 * template it reached a Chinese reader verbatim on the goal page, the island
 * and the inbox brief.
 */
describe('machine gate reasons', () => {
  const reasonOf = (question: string) => coordinatorReasonCopy(coordinatorGateReason(question));

  it('names the missing working directory', () => {
    expect(
      reasonOf(
        'Setup problem: Working directory does not exist: /Users/user/lobehub. Create /Users/user/lobehub on the device the agent runs on, or point the agent at a working directory that exists there. Fix it, then retry or retire this task node?',
      ),
    ).toEqual({
      key: 'goalProcess.gate.reason.setupWorkingDirectory',
      params: { path: '/Users/user/lobehub' },
    });
  });

  it('carries every figure of a spent retry schedule', () => {
    expect(
      reasonOf(
        "Usage limit: You've hit your session limit. Retried 6 time(s) over 26h and the limit still applies. Check the plan or switch the agent to another account or provider. Fix it, then retry or retire this task node?",
      ),
    ).toEqual({
      key: 'goalProcess.gate.reason.quotaRetriesSpent',
      params: { count: '6', duration: '26h', error: "You've hit your session limit" },
    });
  });

  it('still reads the single-parameter templates', () => {
    expect(reasonOf('Task T-3 did not pass verification. Retry or retire this task node?')).toEqual(
      { key: 'goalProcess.gate.reason.verifyFailed', params: { id: 'T-3' } },
    );
  });
});

/**
 * A batch pattern break lists every blocker it hit at once, joined by `; `. The
 * sentence reached a Chinese reader verbatim, so each blocker is localized on
 * its own and the parts rejoin.
 */
describe('batch gate reasons', () => {
  const reasonOf = (question: string) => coordinatorReasonCopies(coordinatorGateReason(question));

  it('localizes each blocker a pattern break lists', () => {
    expect(
      reasonOf(
        '3 unit(s) did not succeed; the batch template is incomplete\n\nHow should this batch proceed?',
      ),
    ).toEqual([
      { key: 'goalProcess.gate.reason.batchBroken', params: { count: '3' } },
      { key: 'goalProcess.gate.reason.batchTemplateIncomplete' },
    ]);
  });

  it('reads a lone blocker', () => {
    expect(reasonOf('1 unit(s) did not succeed\n\nHow should this batch proceed?')).toEqual([
      { key: 'goalProcess.gate.reason.batchBroken', params: { count: '1' } },
    ]);
  });

  it('keeps a half-known sentence verbatim rather than half-translating it', () => {
    expect(
      reasonOf('1 unit(s) did not succeed; something new\n\nHow should this batch proceed?'),
    ).toBeUndefined();
  });
});
