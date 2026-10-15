import { isTaskArchiveBlocked } from '@lobechat/types';
import { TRPCError } from '@trpc/server';

interface ArchiveGuardTask {
  archivedAt?: Date | string | null;
  automationMode?: string | null;
  heartbeatInterval?: number | null;
  schedulePattern?: string | null;
  status: string;
}

/**
 * An archived task is hidden from every list, so it must stay idle: a patch or
 * status change that would leave it running, or with a schedule / heartbeat
 * that can fire, needs the task restored first. Uses the same rule that gates
 * archiving (`isTaskArchiveBlocked`), so the two directions can't disagree.
 */
export const assertArchivedTaskStaysIdle = (
  task: ArchiveGuardTask,
  change: Partial<Omit<ArchiveGuardTask, 'archivedAt'>>,
): void => {
  if (!task.archivedAt) return;

  const pick = <K extends keyof typeof change>(key: K) =>
    change[key] === undefined ? task[key] : change[key];
  const next = {
    automationMode: pick('automationMode'),
    heartbeatInterval: pick('heartbeatInterval'),
    schedulePattern: pick('schedulePattern'),
    status: pick('status') ?? task.status,
  };

  if (isTaskArchiveBlocked(next)) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'Restore this archived task before running or scheduling it',
    });
  }
};
