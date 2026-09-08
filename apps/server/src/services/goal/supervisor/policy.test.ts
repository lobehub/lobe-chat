import type { GoalGraphSnapshot, GoalItem, GoalSupervisionState, TaskItem } from '@lobechat/types';
import { summarizeGoalSupervision } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import type { AgentOperationItem } from '@/database/schemas/agentOperations';

import { recoveryEligibility } from './policy';

const graph = {
  decisions: [],
  nodes: [],
  edges: [],
  events: [],
  workVersions: [],
  goal: { config: { supervision: { enabled: true } }, status: 'running' } as GoalItem,
} as GoalGraphSnapshot;
const task = { status: 'failed', totalTopics: 1 } as TaskItem;
const operation = {
  completionReason: 'error',
  error: { message: 'fetch failed: ECONNRESET' },
  status: 'error',
} as AgentOperationItem;

describe('supervisor recovery authority', () => {
  it('allows a confirmed transport failure with attempts remaining', () => {
    expect(recoveryEligibility(graph, task, operation).eligible).toBe(true);
  });

  it.each([
    'InvalidProviderAPIKey',
    'authentication failed after network error',
    'quota exceeded 503',
    'approval required',
    'cancelled ECONNRESET',
  ])('keeps %s outside recovery authority', (error) => {
    expect(recoveryEligibility(graph, { ...task, error }, operation).eligible).toBe(false);
  });

  it.each(['paused', 'canceled', 'achieved', 'review'])('respects Goal %s', (status) => {
    expect(
      recoveryEligibility(
        { ...graph, goal: { ...graph.goal, status } as GoalItem },
        task,
        operation,
      ).eligible,
    ).toBe(false);
  });

  it('does not interpret a running, cancelled or unknown failure as recoverable', () => {
    expect(recoveryEligibility(graph, { ...task, status: 'canceled' }, operation).eligible).toBe(
      false,
    );
    expect(recoveryEligibility(graph, task, { ...operation, status: 'running' }).eligible).toBe(
      false,
    );
    expect(
      recoveryEligibility(graph, task, { ...operation, error: { message: 'unknown error' } })
        .eligible,
    ).toBe(false);
    expect(
      recoveryEligibility(graph, task, { ...operation, completionReason: 'max_steps' }).eligible,
    ).toBe(false);
  });

  it('respects attempt exhaustion and explicit manual decisions', () => {
    expect(recoveryEligibility(graph, { ...task, totalTopics: 3 }, operation).eligible).toBe(false);
    expect(
      recoveryEligibility(
        { ...graph, decisions: [{ status: 'pending' }] } as GoalGraphSnapshot,
        task,
        operation,
      ).eligible,
    ).toBe(false);
  });
});

describe('effective recovery metric', () => {
  it('does not count a diagnosis, restart or human continuation as an effective recovery', () => {
    const state = {
      incidents: [
        { eligible: true, status: 'diagnosing' },
        { eligible: true, status: 'retrying' },
        { eligible: true, status: 'human_resumed' },
        { eligible: true, status: 'unsuccessful' },
        { eligible: true, status: 'recovered' },
        { eligible: false, status: 'escalated' },
      ],
    } as GoalSupervisionState;
    expect(summarizeGoalSupervision(state)).toEqual({
      effectiveRecoveries: 1,
      effectiveRecoveryRate: 0.2,
      eligibleInterruptions: 5,
      escalated: 1,
      interruptions: 6,
      pendingRecoveries: 2,
    });
    expect(summarizeGoalSupervision().effectiveRecoveryRate).toBeNull();
  });
});
