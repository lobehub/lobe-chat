import type { GoalGraphSnapshot, GoalItem, TaskItem } from '@lobechat/types';

import type { AgentOperationItem } from '@/database/schemas/agentOperations';

import { resolveTaskAttemptBudget } from '../recoveryPolicy';

export const SUPERVISOR_DIAGNOSIS_TIMEOUT_MS = 10 * 60 * 1000;
export const MAX_SUPERVISION_INCIDENTS = 100;

export const supervisionLimit = (goal: GoalItem) =>
  Math.min(MAX_SUPERVISION_INCIDENTS, Math.max(1, goal.config?.supervision?.maxIncidents ?? 10));

/** Recognised transport failures only. Unknown failures need a person in v1. */
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
  if (task.status !== 'failed' || !operation || operation.status !== 'error') {
    return { eligible: false, reason: 'Only a confirmed failed operation can be recovered' };
  }
  if (
    operation.interruption ||
    (operation.completionReason && operation.completionReason !== 'error')
  ) {
    return { eligible: false, reason: 'Operation stopped at an explicit intervention or limit' };
  }
  if ((task.totalTopics ?? 0) >= resolveTaskAttemptBudget(graph.goal)) {
    return { eligible: false, reason: 'Task attempt budget exhausted' };
  }
  const error = `${operation.error?.type ?? ''} ${operation.error?.message ?? ''} ${task.error ?? ''}`;
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
