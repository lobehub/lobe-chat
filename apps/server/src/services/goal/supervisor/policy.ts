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

/**
 * Only a Task the coordinator routed to recovery may be restarted. Anything else —
 * a cancellation, or a completion a person recorded while the diagnosis ran — is a
 * decision supervision must not overwrite.
 */
export const RECOVERABLE_TASK_STATUSES = new Set(['failed', 'paused']);

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
 * `agent-run` is a run that errored, so its own error text says whether retrying is
 * safe. The Task status cannot decide this: an ad-hoc run that fails is stored as
 * `paused`, exactly like a pipeline failure, so reading the Task would route real
 * agent errors around the credential and transport checks.
 *
 * `pipeline` is everything the coordinator routed here without an errored operation:
 * the dispatch never reached the device, the device link dropped, or a post-run step
 * like verification broke. Those never produce an error to inspect, so demanding one
 * used to escalate the entire class to a human.
 */
export type GoalFailureOrigin = 'agent-run' | 'pipeline';

export const failureOrigin = (operation?: AgentOperationItem): GoalFailureOrigin =>
  operation?.status === 'error' ? 'agent-run' : 'pipeline';

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
  if (!RECOVERABLE_TASK_STATUSES.has(task.status)) {
    return { eligible: false, reason: `A ${task.status} Task is not supervision's to restart` };
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
  if (failureOrigin(operation) === 'pipeline') {
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
