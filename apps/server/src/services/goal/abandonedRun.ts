import { isAgentOperationInFlight } from '@lobechat/types';

import type { AgentOperationModel } from '@/database/models/agentOperation';
import type { LobeChatDatabase } from '@/database/type';
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

/**
 * Stop a run the lease reclaim just declared dead, before its replacement starts.
 *
 * The reclaim only settles the operation row. A run stuck on a tool call stops
 * heartbeating, but it is not gone: when the call finally returns it carries on,
 * working the same branch as the attempt that replaced it. Interrupting it makes
 * the runtime stop at its next step. Best-effort — a device that cannot be
 * reached is the offline-device recovery's to handle, so the reclaim proceeds.
 */
export const interruptReclaimedRun = async (
  db: LobeChatDatabase,
  owner: { userId: string; workspaceId?: string },
  run: { operationId: string; topicId: string },
): Promise<void> => {
  try {
    await new AiAgentService(db, owner.userId, { workspaceId: owner.workspaceId }).interruptTask(
      run,
    );
  } catch (error) {
    console.error('[GoalService] failed to interrupt reclaimed run %s:', run.operationId, error);
  }
};
