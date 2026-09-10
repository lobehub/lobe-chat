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

  it('recovers a failure that happened outside the agent run without asking a person', () => {
    // The run itself finished cleanly; the device link, the dispatch or the verifier
    // broke around it, so there is no errored operation to pattern-match.
    const settled = { completionReason: 'done', status: 'done' } as AgentOperationItem;
    for (const error of [
      'Verification could not run (internal error); the delivery was not evaluated.',
      '{"error":"DEVICE_OFFLINE","success":false}',
      'Automatic recovery could not start the next attempt',
    ])
      expect(
        recoveryEligibility(graph, { ...task, error, status: 'paused' }, settled).eligible,
      ).toBe(true);
  });

  it('reads an errored run as an agent failure even when the Task is left paused', () => {
    // An ad-hoc run that fails is stored as `paused`, the same shape a pipeline
    // failure leaves. Reading the Task instead of the operation would route real
    // agent errors around the transport allowlist.
    const paused = { ...task, error: 'TypeError: cannot read property', status: 'paused' };
    const errored = { ...operation, error: { message: 'TypeError: cannot read property' } };
    expect(recoveryEligibility(graph, paused, errored).eligible).toBe(false);
    expect(
      recoveryEligibility(graph, paused, { ...operation, error: { message: 'ECONNRESET' } })
        .eligible,
    ).toBe(true);
  });

  it('never restarts a Task a person already settled', () => {
    const settled = { completionReason: 'done', status: 'done' } as AgentOperationItem;
    for (const status of ['completed', 'canceled', 'running'])
      expect(recoveryEligibility(graph, { ...task, status }, settled).eligible).toBe(false);
  });

  it('still refuses a pipeline failure that a person or a limit caused', () => {
    const settled = { completionReason: 'done', status: 'done' } as AgentOperationItem;
    expect(
      recoveryEligibility(
        graph,
        { ...task, error: 'device unauthorized', status: 'paused' },
        settled,
      ).eligible,
    ).toBe(false);
    expect(
      recoveryEligibility(graph, { ...task, status: 'paused' }, {
        ...settled,
        completionReason: 'cost_limit',
      } as AgentOperationItem).eligible,
    ).toBe(false);
    expect(
      recoveryEligibility(graph, { ...task, totalTopics: 3, status: 'paused' }, settled).eligible,
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
