// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assertNotHoldingRelease, withGoalGateAnswer } from './goalGateAcceptance';

const findByNode = vi.hoisted(() => vi.fn());
const answerReleaseGate = vi.hoisted(() => vi.fn());
const scheduleGoalAdvance = vi.hoisted(() => vi.fn());

vi.mock('@/database/models/goal', () => ({
  GoalModel: class {
    findByNode = findByNode;
  },
}));
vi.mock('@/server/services/goal', () => ({
  GoalService: class {
    answerReleaseGate = answerReleaseGate;
  },
}));
vi.mock('@/server/services/goal/scheduler', () => ({ scheduleGoalAdvance }));

const db = {} as never;
const gate = (id = 'acc_gate') =>
  ({
    id,
    subjectId: 'node_release',
    subjectType: 'goal_gate',
    userId: 'me',
    workspaceId: null,
  }) as never;
const heldOn = (acceptanceId: string, phase: string) => ({
  config: { rolloutState: { phase, releaseGateAcceptanceId: acceptanceId } },
});

beforeEach(() => {
  findByNode.mockReset();
  answerReleaseGate.mockReset();
  scheduleGoalAdvance.mockReset();
});

describe('assertNotHoldingRelease', () => {
  it('refuses to settle a report a batch is still held on', async () => {
    findByNode.mockResolvedValue(heldOn('acc_gate', 'release_review'));
    await expect(assertNotHoldingRelease(db, gate())).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // Sent back and being rewritten: the rewrite comes back to the same report.
    findByNode.mockResolvedValue(heldOn('acc_gate', 'plan_revision'));
    await expect(assertNotHoldingRelease(db, gate())).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });

  it('lets a decided gate report, or any other delivery, go', async () => {
    findByNode.mockResolvedValue(heldOn('acc_gate', 'mass'));
    await expect(assertNotHoldingRelease(db, gate())).resolves.toBeUndefined();

    findByNode.mockResolvedValue(heldOn('acc_newer', 'release_review'));
    await expect(assertNotHoldingRelease(db, gate())).resolves.toBeUndefined();

    await expect(
      assertNotHoldingRelease(db, { subjectType: 'task' } as never),
    ).resolves.toBeUndefined();
    expect(findByNode).toHaveBeenCalledTimes(2);
  });
});

describe('withGoalGateAnswer', () => {
  const service = (decidable: boolean) =>
    ({
      acceptanceModel: {
        findById: vi.fn(async () => ({ status: decidable ? 'delivered' : 'closed' })),
      },
    }) as never;

  it('leaves the goal alone when the report cannot take the decision', async () => {
    const write = vi.fn();

    await expect(
      withGoalGateAnswer(db, service(false), gate(), 'release', undefined, write),
    ).rejects.toThrow('closed');
    expect(answerReleaseGate).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it('advances the goal only after the report recorded the decision', async () => {
    answerReleaseGate.mockResolvedValue('goal_1');
    const write = vi.fn(async () => {
      expect(scheduleGoalAdvance).not.toHaveBeenCalled();
      return 'written';
    });

    await expect(
      withGoalGateAnswer(db, service(true), gate(), 'revise', '补上播种', write),
    ).resolves.toBe('written');
    expect(answerReleaseGate).toHaveBeenCalledWith('node_release', 'revise', '补上播种');
    expect(scheduleGoalAdvance).toHaveBeenCalledWith(
      expect.objectContaining({ goalId: 'goal_1', trigger: 'decide' }),
    );
  });

  it('does not advance a goal when the report write failed', async () => {
    answerReleaseGate.mockResolvedValue('goal_1');

    await expect(
      withGoalGateAnswer(db, service(true), gate(), 'release', undefined, async () => {
        throw new Error('write failed');
      }),
    ).rejects.toThrow('write failed');
    expect(scheduleGoalAdvance).not.toHaveBeenCalled();
  });
});
