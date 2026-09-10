import type {
  AgentOperationCompletionReason,
  AgentOperationStatus,
  GoalGraphSnapshot,
  GoalItem,
  TaskItem,
} from '@lobechat/types';

import type { AgentOperationItem } from '@/database/schemas/agentOperations';
import { HETERO_DISPATCH_ERROR_HEADLINES } from '@/server/services/aiAgent/helpers/heteroErrors';

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
 * Gateway codes whose own message states the run never started, so a retry cannot
 * duplicate committed work. `DEVICE_GATEWAY_UNAUTHORIZED` and `GATEWAY_NOT_CONFIGURED`
 * say retrying will not help, `DEVICE_RESPONSE_TIMEOUT` says whether the run started is
 * unknown, and `DEVICE_NOT_FOUND` needs someone to reconnect or rebind; those stay with
 * a person.
 */
const RETRYABLE_DISPATCH_CODES = [
  'DEVICE_OFFLINE',
  'DEVICE_CHANNEL_UNAVAILABLE',
  // Any gateway 5xx, so it covers the 500 the transport regex's 502-504 misses.
  'DEVICE_GATEWAY_ERROR',
  'DEVICE_GATEWAY_UNREACHABLE',
  'DEVICE_GATEWAY_RATE_LIMITED',
];

/**
 * The same failure reaches `task.error` as a raw code when the coordinator's own
 * dispatch fails, and as the humanized headline when the runtime finalizes it. Match
 * both, off the one map, so neither storage shape decides whether a person is needed.
 */
const isRetryableDispatchFailure = (error: string) =>
  RETRYABLE_DISPATCH_CODES.some(
    (code) =>
      error.includes(code) ||
      (HETERO_DISPATCH_ERROR_HEADLINES[code] &&
        error.includes(HETERO_DISPATCH_ERROR_HEADLINES[code])),
  );

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
  // `TaskService.updateStatus` replaces `error` only when a new one is supplied, so an
  // actor can move a pipeline-paused Task to `failed` and leave the transport text
  // that paused it. The status log records assignee changes, not transitions, so the
  // author is not readable; require the errored run instead. Nothing the system does
  // writes `failed` with a recoverable error — its own is `Heartbeat timeout`.
  if (task.status === 'failed' && operation?.status !== 'error') {
    return { eligible: false, reason: 'A failed Task without an errored run is a decision' };
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
  // One allowlist for both origins, read off whatever error text exists. Inferring a
  // recoverable failure from the *absence* of a run error is an open set: every state
  // an actor can author — a Task marked failed through the API, a settled run someone
  // reopened — arrives looking exactly like a dropped dispatch. Recognising the
  // failures instead keeps an authored decision with the person who made it.
  if (
    !isRetryableDispatchFailure(error) &&
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
