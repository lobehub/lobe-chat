import { isAgentOperationInFlight } from '@lobechat/types';

import { AgentOperationModel } from '@/database/models/agentOperation';
import { TopicModel } from '@/database/models/topic';
import type { LobeChatDatabase } from '@/database/type';
import { AgentRuntimeCoordinator } from '@/server/modules/AgentRuntime/AgentRuntimeCoordinator';
import { AiAgentService } from '@/server/services/aiAgent';

/**
 * Whether a Task topic is still `running` although its run has already ended.
 *
 * The run's terminal normally moves the topic through the task lifecycle hook,
 * but that delivery can be lost — a watchdog-abandoned device run had none at
 * all, and a dropped webhook has no retry. The lease reclaim cannot see these:
 * it only settles an operation that is itself still `running`, so the Task
 * stays in flight forever and its goal with it. Once the run has been over for
 * longer than the lease, nothing is left to report it and the topic is lost.
 *
 * A missing operation row proves nothing — a run executed on the client never
 * writes one — so only a row that says the run ended counts.
 */
export const isOrphanedRun = async (
  operationModel: AgentOperationModel,
  operationId: string,
  staleBefore: Date,
): Promise<boolean> => {
  const operation = await operationModel.findById(operationId);
  // Still-owned states (including a run parked for a client) are the lease
  // path's to reclaim, not this.
  if (!operation || isAgentOperationInFlight(operation.status)) return false;
  const endedAt = operation.completedAt ?? operation.updatedAt;
  return new Date(endedAt) < staleBefore;
};

/** Whether the runtime still holds the run's state, or a device hosts its process. */
const hasLiveExecutor = async (
  db: LobeChatDatabase,
  owner: { userId: string; workspaceId?: string },
  run: { operationId: string; topicId: string },
): Promise<boolean> => {
  if (await new AgentRuntimeCoordinator().loadAgentState(run.operationId)) return true;
  const topic = await new TopicModel(db, owner.userId, owner.workspaceId).findById(run.topicId);
  const marker = topic?.metadata?.runningOperation;
  const target =
    marker?.operationId === run.operationId
      ? marker
      : marker?.childOperations?.find((child) => child.operationId === run.operationId);
  return !!target?.deviceId;
};

/**
 * Stop a run whose lease expired, before its replacement starts.
 *
 * The lease reclaim only settles the operation row. A run stuck on a tool call
 * stops heartbeating, but it is not gone: when the call finally returns it
 * carries on, working the same branch as the attempt that replaced it. So the
 * run is interrupted first, and only a confirmed stop lets the reclaim proceed.
 *
 * - `not_running`: no stale `running` row to stop — the reclaim decides on its
 *   own as before.
 * - `stopped`: the runtime (and the device, for a device-hosted process)
 *   acknowledged the stop.
 * - `unconfirmed`: the stop was refused, unconfirmed or failed; the run may still
 *   be writing. `interruptTask` reports this as a resolved result, not a throw.
 */
export const stopStaleRun = async (
  db: LobeChatDatabase,
  owner: { userId: string; workspaceId?: string },
  run: { operationId: string; staleBefore: Date; topicId: string },
): Promise<'not_running' | 'stopped' | 'unconfirmed'> => {
  const operation = await new AgentOperationModel(db, owner.userId, owner.workspaceId).findById(
    run.operationId,
  );
  // Only a `running` row is the lease's to reclaim; a run parked for a person or
  // a client is legitimately quiet and must not be stopped.
  if (operation?.status !== 'running' || new Date(operation.updatedAt) >= run.staleBefore)
    return 'not_running';
  // With no runtime state and no device hosting it, nothing executes the run any
  // more. Interrupting it then would only retire the row outside the reclaim's
  // transaction, skipping its cost charge and its rollback.
  if (!(await hasLiveExecutor(db, owner, run))) return 'not_running';

  try {
    const result = await new AiAgentService(db, owner.userId, {
      workspaceId: owner.workspaceId,
    }).interruptTask({ operationId: run.operationId, topicId: run.topicId });
    return result.success && result.deviceCancellationConfirmed !== false
      ? 'stopped'
      : 'unconfirmed';
  } catch (error) {
    console.error('[GoalService] failed to interrupt stale run %s:', run.operationId, error);
    return 'unconfirmed';
  }
};
