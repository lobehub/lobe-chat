import type {
  AgentOperationCompletionReason,
  AgentOperationStatus,
  GoalGraphSnapshot,
  GoalItem,
  TaskItem,
} from '@lobechat/types';

import type { AgentOperationItem } from '@/database/schemas/agentOperations';

import { resolveTaskAttemptBudget } from '../recoveryPolicy';

export const SUPERVISOR_DIAGNOSIS_TIMEOUT_MS = 10 * 60 * 1000;
export const MAX_SUPERVISION_INCIDENTS = 100;

export const supervisionLimit = (goal: GoalItem) =>
  Math.min(MAX_SUPERVISION_INCIDENTS, Math.max(1, goal.config?.supervision?.maxIncidents ?? 10));

/** A limit or a person stopped the run, so continuing is not the supervisor's call. */
const INTERVENTION_REASONS = new Set<AgentOperationCompletionReason>([
  'cost_limit',
  'interrupted',
  'max_steps',
  'waiting_for_human',
]);

/** The run has not settled yet; the lease reclaim owns it, not recovery. */
const IN_FLIGHT_STATUSES = new Set<AgentOperationStatus>([
  'idle',
  'running',
  'waiting_for_async_tool',
  'waiting_for_human',
]);

/**
 * Where the failure happened, which is what decides whether a person must be involved.
 *
 * `agent-run` is a run that started and errored, so its own error text says whether
 * retrying is safe. `pipeline` is everything the coordinator routed here without such
 * an error: the dispatch never reached the device, the device link dropped, or a
 * post-run step like verification broke. Those never produce an errored operation, so
 * demanding one used to escalate the entire class to a human — the failures least in
 * need of a human judgement were the only ones that always got one.
 */
export type GoalFailureOrigin = 'agent-run' | 'pipeline';

/**
 * Stable id for a failure that produced no operation, so a kickoff that threw
 * before writing a run can still be deduplicated and counted. Keyed per attempt:
 * a second failed dispatch is a second incident, not a silent reuse of the first.
 */
export const dispatchFailureKey = (task: TaskItem) =>
  `dispatch:${task.id}:${task.totalTopics ?? 0}`;

export const failureOrigin = (task: TaskItem, operation?: AgentOperationItem): GoalFailureOrigin =>
  task.status === 'failed' && operation?.status === 'error' ? 'agent-run' : 'pipeline';

export const recoveryEligibility = (
  graph: GoalGraphSnapshot,
  task: TaskItem,
  operation?: AgentOperationItem,
): { eligible: boolean; reason: string } => {
  if (!graph.goal.config?.supervision?.enabled && !graph.goal.config?.manager)
    return { eligible: false, reason: 'Supervision is disabled' };
  if (graph.goal.status !== 'running' || graph.decisions.some((d) => d.status === 'pending')) {
    return { eligible: false, reason: 'Goal is stopped or has a pending decision' };
  }
  if (operation && IN_FLIGHT_STATUSES.has(operation.status)) {
    return { eligible: false, reason: 'The operation has not settled yet' };
  }
  if (
    operation?.interruption ||
    (operation?.completionReason && INTERVENTION_REASONS.has(operation.completionReason))
  ) {
    return { eligible: false, reason: 'Operation stopped at an explicit intervention or limit' };
  }
  if (task.status === 'canceled') {
    return { eligible: false, reason: 'A cancelled Task is a human decision' };
  }
  if ((task.totalTopics ?? 0) >= resolveTaskAttemptBudget(graph.goal)) {
    return { eligible: false, reason: 'Task attempt budget exhausted' };
  }
  const error = `${operation?.error?.type ?? ''} ${operation?.error?.message ?? ''} ${task.error ?? ''}`;
  if (
    /auth|credential|api.?key|permission|approv|forbidden|unauthor|usage.?limit|quota|billing|budget|cancel|用户|授权|凭据|额度/i.test(
      error,
    )
  ) {
    return {
      eligible: false,
      reason: 'Credentials, permission, cancellation or spending requires user action',
    };
  }
  // A pipeline failure has no run error to pattern-match, and retrying it re-runs a
  // dispatch the goal already authorised rather than granting anything new.
  if (failureOrigin(task, operation) === 'pipeline') {
    return {
      eligible: true,
      reason: 'Failure outside the agent run; retrying uses the authority the goal already granted',
    };
  }
  if (
    !/ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|fetch failed|network error|socket hang up|service unavailable|bad gateway|gateway timeout|\b50[234]\b/i.test(
      error,
    )
  ) {
    return {
      eligible: false,
      reason: 'Failure is outside the recognised transport recovery policy',
    };
  }
  return {
    eligible: true,
    reason: 'Confirmed transient transport failure within existing execution authority',
  };
};
